import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = 'phase12-validation-evidence';
const allowedLeadProperties = new Set(['page_language', 'lead_magnet_id', 'source', 'duplicate', 'error_type']);
const expectedEvents = [
  'landing_lead_magnet_viewed',
  'landing_lead_capture_started',
  'landing_lead_capture_submitted',
  'landing_lead_capture_succeeded',
  'landing_lead_capture_failed',
  'landing_lead_magnet_opened',
  'landing_lead_magnet_trial_clicked',
];

await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = {
  generatedAt: new Date().toISOString(),
  sha: process.env.GITHUB_SHA || null,
  cases: [],
  failures: [],
};

const recordFailure = (caseName, message) => {
  report.failures.push(`${caseName}: ${message}`);
};

async function createContext({ width, height, reducedMotion = false, adapter = true, analytics = true }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });

  await context.addInitScript(({ adapterEnabled, analyticsEnabled }) => {
    if (analyticsEnabled) {
      localStorage.setItem('gameplan:privacy:analytics-consent:v1', 'granted');
      window.__GAMEPLAN_PHASE12_ANALYTICS__ = [];
      window.posthog = {
        __SV: 1,
        capture: (eventName, properties) => window.__GAMEPLAN_PHASE12_ANALYTICS__.push({ eventName, properties }),
        opt_in_capturing: () => {},
        opt_out_capturing: () => {},
        reset: () => {},
      };
    }
    if (adapterEnabled) {
      window.__GAMEPLAN_PHASE12_CAPTURE_TEST_ADAPTER__ = async (payload) => {
        window.__GAMEPLAN_PHASE12_TEST_PAYLOAD__ = payload;
        return { ok: true, duplicate: false };
      };
    }
  }, { adapterEnabled: adapter, analyticsEnabled: analytics });

  await context.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const baseUrl = new URL(base);
    if (requestUrl.origin === baseUrl.origin) await route.continue();
    else await route.abort();
  });

  return context;
}

async function openPage(context, path) {
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('console', (message) => {
    const text = message.text();
    const expectedBlockedResource = text === 'Failed to load resource: net::ERR_FAILED';
    if (message.type() === 'error' && !expectedBlockedResource) runtimeErrors.push(`console: ${text}`);
  });
  page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));
  await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#lead-magnet, .checklist-main').first().waitFor({ state: 'visible' });
  await page.locator('#loader').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {});
  return { page, runtimeErrors };
}

async function runLandingCase({ name, path, width, height, lang, reducedMotion = false, adapter = true, submit = false }) {
  const context = await createContext({ width, height, reducedMotion, adapter });
  const { page, runtimeErrors } = await openPage(context, path);
  const errors = [...runtimeErrors];
  const lead = page.locator('#lead-magnet');
  await lead.scrollIntoViewIfNeeded();

  const layout = await page.evaluate(() => {
    const bodyOverflow = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const section = document.getElementById('lead-magnet')?.getBoundingClientRect();
    return {
      bodyOverflow,
      sectionLeft: section ? Math.round(section.left) : null,
      sectionRight: section ? Math.round(section.right) : null,
      viewportWidth: innerWidth,
    };
  });

  const actualLang = await page.locator('html').getAttribute('lang');
  const form = page.locator('.lead-magnet-form');
  const submitButton = form.locator('button[type=submit]');
  let success = null;

  if (!adapter) {
    if (!(await submitButton.isDisabled())) errors.push('submit must remain disabled while the audited endpoint is unavailable');
    const status = (await page.locator('#leadFormStatus').innerText()).trim();
    if (!status) errors.push('disabled integration status is missing');
  }

  if (submit) {
    await form.locator('input[name=name]').fill(lang === 'en' ? 'Phase Twelve Test' : 'Teste Fase Doze');
    await form.locator('input[name=email]').fill(`phase12-${lang.replace(/[^a-z]/gi, '')}@example.invalid`);
    await submitButton.click();
    const consent = form.locator('input[name=consent]');
    const invalidWithoutConsent = await consent.evaluate((element) => !element.validity.valid);
    if (!invalidWithoutConsent) errors.push('required consent did not block submission');

    await consent.check();
    await submitButton.click();
    await page.locator('.lead-success').waitFor({ state: 'visible' });

    const focusedClass = await page.evaluate(() => document.activeElement?.className || '');
    const href = await page.locator('.lead-open').getAttribute('href');
    const trialHref = await page.locator('.lead-trial').getAttribute('href');
    const payload = await page.evaluate(() => window.__GAMEPLAN_PHASE12_TEST_PAYLOAD__);
    if (!focusedClass.includes('lead-success')) errors.push('focus did not move to the success state');
    if (payload?.email?.endsWith('@example.invalid') !== true) errors.push('test adapter did not receive the synthetic payload');
    if (payload?.company !== '') errors.push('honeypot value was not normalized');
    if (!trialHref?.includes(`lang=${lang}`)) errors.push(`trial did not preserve language: ${trialHref}`);

    await page.locator('.lead-open').evaluate((element) => element.addEventListener('click', (event) => event.preventDefault(), { once: true }));
    await page.locator('.lead-trial').evaluate((element) => element.addEventListener('click', (event) => event.preventDefault(), { once: true }));
    await page.locator('.lead-open').click();
    await page.locator('.lead-trial').click();

    const leadAnalytics = await page.evaluate(() =>
      (window.__GAMEPLAN_PHASE12_ANALYTICS__ || []).filter((entry) => entry.eventName.startsWith('landing_lead_'))
    );
    const eventNames = new Set(leadAnalytics.map((entry) => entry.eventName));
    for (const required of ['landing_lead_capture_started', 'landing_lead_capture_submitted', 'landing_lead_capture_succeeded', 'landing_lead_magnet_opened', 'landing_lead_magnet_trial_clicked']) {
      if (!eventNames.has(required)) errors.push(`missing analytics event ${required}`);
    }
    for (const entry of leadAnalytics) {
      for (const key of Object.keys(entry.properties || {})) {
        if (!allowedLeadProperties.has(key)) errors.push(`analytics property is not allowlisted: ${entry.eventName}.${key}`);
      }
      const serialized = JSON.stringify(entry);
      if (/example\.invalid|Phase Twelve Test|Teste Fase Doze/i.test(serialized)) {
        errors.push(`analytics contains synthetic PII: ${entry.eventName}`);
      }
    }

    success = { visible: true, href, trialHref, analyticsEvents: [...eventNames] };
  }

  const serious = (await new AxeBuilder({ page }).include('#lead-magnet').analyze())
    .violations
    .filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))
    .map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length }));

  if (actualLang !== lang) errors.push(`language mismatch: ${actualLang}`);
  if (layout.bodyOverflow > 1) errors.push(`horizontal overflow: ${layout.bodyOverflow}`);
  if (layout.sectionLeft === null || layout.sectionLeft < -1 || layout.sectionRight > layout.viewportWidth + 1) {
    errors.push(`lead section outside viewport: ${JSON.stringify(layout)}`);
  }
  if (serious.length) errors.push(`axe serious/critical: ${serious.map((item) => item.id).join(', ')}`);

  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  report.cases.push({ name, path, actualLang, layout, reducedMotion, adapter, success, serious, errors });
  errors.forEach((error) => recordFailure(name, error));
  await context.close();
}

async function runChecklistCase({ name, path, width, height, lang, expectedTrialLanguage }) {
  const context = await createContext({ width, height, reducedMotion: true, adapter: false, analytics: false });
  const { page, runtimeErrors } = await openPage(context, path);
  const errors = [...runtimeErrors];
  const robots = await page.locator('meta[name=robots]').getAttribute('content');
  const articles = await page.locator('.checklist-item').count();
  const prompts = await page.locator('.checklist-prompt').count();
  const actualLang = await page.locator('html').getAttribute('lang');
  const trialHref = await page.locator('.checklist-actions a[href*="signup"]').getAttribute('href');
  const languageHref = await page.locator('.checklist-header a[lang]').getAttribute('href');
  const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));

  await page.evaluate(() => {
    window.__GAMEPLAN_PRINT_CALLED__ = false;
    window.print = () => { window.__GAMEPLAN_PRINT_CALLED__ = true; };
  });
  await page.locator('.checklist-print').click();
  const printCalled = await page.evaluate(() => window.__GAMEPLAN_PRINT_CALLED__);

  const serious = (await new AxeBuilder({ page }).include('.checklist-main').analyze())
    .violations
    .filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))
    .map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length }));

  if (robots !== 'noindex, nofollow') errors.push(`robots=${robots}`);
  if (articles !== 10) errors.push(`checklist items=${articles}`);
  if (prompts !== 10) errors.push(`practical prompts=${prompts}`);
  if (actualLang !== lang) errors.push(`language mismatch: ${actualLang}`);
  if (!trialHref?.includes(`lang=${expectedTrialLanguage}`)) errors.push(`trial language mismatch: ${trialHref}`);
  if (!languageHref) errors.push('equivalent-language link is missing');
  if (!printCalled) errors.push('print action did not call window.print');
  if (overflow > 1) errors.push(`horizontal overflow: ${overflow}`);
  if (serious.length) errors.push(`axe serious/critical: ${serious.map((item) => item.id).join(', ')}`);

  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  report.cases.push({ name, path, actualLang, robots, articles, prompts, trialHref, languageHref, overflow, serious, errors });
  errors.forEach((error) => recordFailure(name, error));
  await context.close();
}

async function runStaticContractChecks() {
  const name = 'static-contract';
  const errors = [];
  const [script, pt, en, privacyPt, privacyEn] = await Promise.all([
    fs.readFile('phase12-lead-capture.js', 'utf8'),
    fs.readFile('index.html', 'utf8'),
    fs.readFile('en.html', 'utf8'),
    fs.readFile('privacy.html', 'utf8'),
    fs.readFile('privacy-en.html', 'utf8'),
  ]);

  if (/supabase\.co|capture-marketing-lead/.test(script)) errors.push('a live Supabase endpoint is embedded in frontend code');
  if (!script.includes("enabled: runtimeConfig.enabled === true")) errors.push('runtime endpoint gate is missing');
  for (const eventName of expectedEvents) {
    if (!script.includes(eventName)) errors.push(`event contract missing: ${eventName}`);
  }
  for (const [label, html] of [['pt', pt], ['en', en]]) {
    if ((html.match(/phase12-lead-capture\.css/g) || []).length !== 1) errors.push(`${label}: Phase 12 stylesheet must appear once`);
    if ((html.match(/phase12-lead-capture\.js/g) || []).length !== 1) errors.push(`${label}: Phase 12 script must appear once`);
    for (const selector of ['id="connection"', 'id="features"', 'id="demo"', 'id="pricing"', 'id="about"', 'id="timeline"', 'id="feedback"']) {
      if (!html.includes(selector)) errors.push(`${label}: preserved landing section missing ${selector}`);
    }
  }
  if (!privacyPt.includes('solicitação de recurso gratuito')) errors.push('PT-BR privacy disclosure for the free resource is missing');
  if (!privacyEn.includes('Free-resource requests')) errors.push('English privacy disclosure for the free resource is missing');

  report.cases.push({ name, errors });
  errors.forEach((error) => recordFailure(name, error));
}

await runStaticContractChecks();
await runLandingCase({ name: 'pt-desktop-success', path: '/index.html?utm_source=phase12-test', width: 1440, height: 1000, lang: 'pt-BR', adapter: true, submit: true });
await runLandingCase({ name: 'en-desktop-success', path: '/en.html?utm_source=phase12-test', width: 1440, height: 1000, lang: 'en', adapter: true, submit: true });
await runLandingCase({ name: 'pt-mobile-disabled', path: '/index.html', width: 390, height: 844, lang: 'pt-BR', reducedMotion: true, adapter: false });
await runLandingCase({ name: 'en-mobile-disabled', path: '/en.html', width: 390, height: 844, lang: 'en', reducedMotion: true, adapter: false });
await runChecklistCase({ name: 'checklist-pt-mobile', path: '/checklist-modelo-de-jogo.html', width: 390, height: 844, lang: 'pt-BR', expectedTrialLanguage: 'pt-BR' });
await runChecklistCase({ name: 'checklist-en-mobile', path: '/game-model-checklist.html', width: 390, height: 844, lang: 'en', expectedTrialLanguage: 'en' });

await browser.close();
await fs.writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
await fs.writeFile(`${out}/summary.txt`, `SHA: ${report.sha}\nFailures: ${report.failures.length}\n${report.failures.join('\n')}\n`);
console.log(JSON.stringify(report, null, 2));
if (report.failures.length) process.exit(1);
