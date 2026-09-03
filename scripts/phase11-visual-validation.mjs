import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const EVIDENCE_DIR = 'phase11-evidence';
mkdirSync(EVIDENCE_DIR, { recursive: true });

const report = {
  schema: 'gameplan.phase11.visual-validation.v1',
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  sourceSha: process.env.GITHUB_SHA || null,
  results: [],
  consent: [],
  seo: {},
  linkChecks: [],
  failures: [],
  warnings: [],
};

const normalize = (value = '') => String(value).replace(/\s+/g, ' ').trim();
const recordFailure = (message, details = null) => {
  report.failures.push({ message, details });
  console.error(`FAIL: ${message}`, details || '');
};
const recordWarning = (message, details = null) => {
  report.warnings.push({ message, details });
  console.warn(`WARN: ${message}`, details || '');
};
const check = (condition, message, details = null) => {
  if (!condition) recordFailure(message, details);
};

const mainCases = [
  {
    id: 'pt-desktop',
    path: '/',
    lang: 'pt-BR',
    viewport: { width: 1440, height: 1000 },
    expectedH1: 'Do modelo ao campo. Planeje, treine e analise em um único lugar.',
    expectedSupport: 'Planeje, treine e analise em um único lugar.',
    expectedMenu: 'Funcionalidades',
    expectedConsentAccept: 'Aceitar analytics',
    expectedConsentDeny: 'Somente necessários',
    expectedPrivacyPreference: 'Preferências de privacidade',
  },
  {
    id: 'pt-mobile',
    path: '/',
    lang: 'pt-BR',
    viewport: { width: 390, height: 844 },
    expectedH1: 'Do modelo ao campo. Planeje, treine e analise em um único lugar.',
    expectedSupport: 'Planeje, treine e analise em um único lugar.',
    expectedMenu: 'Funcionalidades',
    expectedConsentAccept: 'Aceitar analytics',
    expectedConsentDeny: 'Somente necessários',
    expectedPrivacyPreference: 'Preferências de privacidade',
  },
  {
    id: 'en-desktop',
    path: '/en.html',
    lang: 'en',
    viewport: { width: 1440, height: 1000 },
    expectedH1: 'From the model to the pitch. Plan, train and analyze in one place.',
    expectedSupport: 'Plan, train and analyze in one place.',
    expectedMenu: 'Features',
    expectedConsentAccept: 'Accept analytics',
    expectedConsentDeny: 'Necessary only',
    expectedPrivacyPreference: 'Privacy preferences',
  },
  {
    id: 'en-mobile',
    path: '/en.html',
    lang: 'en',
    viewport: { width: 390, height: 844 },
    expectedH1: 'From the model to the pitch. Plan, train and analyze in one place.',
    expectedSupport: 'Plan, train and analyze in one place.',
    expectedMenu: 'Features',
    expectedConsentAccept: 'Accept analytics',
    expectedConsentDeny: 'Necessary only',
    expectedPrivacyPreference: 'Privacy preferences',
  },
];

const legalCases = [
  { id: 'pt-privacy-desktop', path: '/privacy.html', viewport: { width: 1280, height: 900 }, h1: 'Política de Privacidade', lang: 'pt-BR' },
  { id: 'pt-terms-mobile', path: '/terms.html', viewport: { width: 390, height: 844 }, h1: 'Termos de Serviço', lang: 'pt-BR' },
  { id: 'en-privacy-desktop', path: '/privacy-en.html', viewport: { width: 1280, height: 900 }, h1: 'Privacy Policy', lang: 'en' },
  { id: 'en-terms-mobile', path: '/terms-en.html', viewport: { width: 390, height: 844 }, h1: 'Terms of Service', lang: 'en' },
];

const forbiddenPublicPhrases = [
  /\bTODO\b/i,
  /\bplaceholder\b/i,
  /lorem ipsum/i,
  /aqui (deve|precisa|vamos) (escrever|colocar|inserir)/i,
  /aqui entra/i,
  /pré[- ]comercial/i,
  /pre[- ]commercial/i,
  /fase (específica )?de billing/i,
  /dedicated billing phase/i,
  /oferece ou prepara/i,
  /provides or prepares/i,
  /deve receber revisão/i,
  /should receive professional legal review/i,
  /será (atualizad|adicionad|acrescentad)/i,
  /will be (updated|added)/i,
  /\bRLS\b/,
  /\bbackend\b/i,
  /\bPreviews\b/,
  /chaves privilegiadas/i,
  /privileged keys/i,
];

async function configurePage(context, caseId) {
  const page = await context.newPage();
  const events = { consoleErrors: [], pageErrors: [], failedRequests: [], posthog: [] };

  page.on('console', (message) => {
    if (message.type() === 'error') events.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => events.pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!url.includes('fonts.googleapis.com') && !url.includes('fonts.gstatic.com')) {
      events.failedRequests.push({ url, error: request.failure()?.errorText || 'unknown' });
    }
  });

  await page.route(/https:\/\/eu-assets\.i\.posthog\.com\/.*|https:\/\/eu\.i\.posthog\.com\/.*/, async (route) => {
    events.posthog.push({ method: route.request().method(), url: route.request().url(), caseId, at: new Date().toISOString() });
    const url = route.request().url();
    if (url.includes('/static/array.js')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `(() => {
          const p = window.posthog || {};
          let optedOut = false;
          p.__loaded = true;
          p.opt_in_capturing = () => { optedOut = false; };
          p.opt_out_capturing = () => { optedOut = true; };
          p.has_opted_out_capturing = () => optedOut;
          p.capture = () => undefined;
          p.reset = () => undefined;
          window.posthog = p;
        })();`,
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  return { page, events };
}

async function waitForPage(page, path) {
  const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 120_000 });
  check(Boolean(response) && response.status() < 400, `${path} must load successfully`, response?.status());
  await page.locator('#loader').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => undefined);
  await page.evaluate(() => document.fonts?.ready).catch(() => undefined);
  await page.waitForTimeout(400);
}

async function collectLayoutAudit(page) {
  return page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
    };
    const clippedText = [...document.querySelectorAll('h1,h2,h3,p,a,button,li,strong,small')]
      .filter(visible)
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const horizontallyClipped = element.scrollWidth > element.clientWidth + 2 && ['hidden', 'clip'].includes(style.overflowX);
        const outsideViewport = rect.left < -2 || rect.right > window.innerWidth + 2;
        return horizontallyClipped || outsideViewport;
      })
      .map((element) => ({
        tag: element.tagName,
        text: (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
        className: element.className,
        rect: element.getBoundingClientRect().toJSON(),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }))
      .filter((entry) => !String(entry.className).includes('skip-link'));

    const emptyInteractiveNames = [...document.querySelectorAll('a,button,input,select,textarea')]
      .filter(visible)
      .filter((element) => {
        const name = element.getAttribute('aria-label') || element.textContent || element.getAttribute('title') || element.getAttribute('placeholder') || '';
        return !name.trim();
      })
      .map((element) => ({ tag: element.tagName, className: element.className }));

    const images = [...document.images].map((image) => ({
      src: image.getAttribute('src'),
      alt: image.getAttribute('alt'),
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    }));

    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((heading) => ({
      level: Number(heading.tagName.slice(1)),
      text: (heading.textContent || '').replace(/\s+/g, ' ').trim(),
    }));

    return {
      innerWidth: window.innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
      clippedText,
      emptyInteractiveNames,
      images,
      headings,
      lang: document.documentElement.lang,
    };
  });
}

function validateHeadingSequence(headings, caseId) {
  check(headings.filter((heading) => heading.level === 1).length === 1, `${caseId}: exactly one H1 is required`, headings);
  let previous = 0;
  for (const heading of headings) {
    if (previous && heading.level > previous + 1) {
      recordFailure(`${caseId}: heading hierarchy skips a level`, { previous, current: heading });
    }
    previous = heading.level;
  }
}

async function runAxe(page, caseId) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact));
  if (blocking.length) {
    recordFailure(`${caseId}: serious or critical accessibility violations`, blocking.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.slice(0, 8).map((node) => ({ target: node.target, failureSummary: node.failureSummary })),
    })));
  }
  return results.violations.map((violation) => ({ id: violation.id, impact: violation.impact, help: violation.help, nodeCount: violation.nodes.length }));
}

async function verifyExternalLink(context, label, url) {
  try {
    const response = await context.request.get(url, { maxRedirects: 5, timeout: 45_000 });
    const status = response.status();
    report.linkChecks.push({ label, url, status, finalUrl: response.url() });
    check(status < 400, `${label} must return a non-error HTTP status`, { url, status, finalUrl: response.url() });
  } catch (error) {
    recordFailure(`${label} could not be reached`, { url, error: error.message });
  }
}

async function auditMain(browser, testCase) {
  const context = await browser.newContext({
    viewport: testCase.viewport,
    locale: testCase.lang === 'en' ? 'en-US' : 'pt-BR',
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const { page, events } = await configurePage(context, testCase.id);
  await waitForPage(page, testCase.path);

  const h1 = normalize(await page.locator('#hero-title').innerText());
  const support = normalize(await page.locator('#hero-title span').innerText());
  check(h1 === testCase.expectedH1, `${testCase.id}: official slogan and support line`, { expected: testCase.expectedH1, actual: h1 });
  check(support === testCase.expectedSupport, `${testCase.id}: support line`, { expected: testCase.expectedSupport, actual: support });

  for (const id of ['connection', 'features', 'demo', 'pricing', 'about', 'timeline', 'feedback']) {
    check(await page.locator(`#${id}`).isVisible(), `${testCase.id}: section #${id} must be visible`);
  }

  const bodyText = await page.locator('body').innerText();
  for (const pattern of forbiddenPublicPhrases) {
    check(!pattern.test(bodyText), `${testCase.id}: must not expose internal/provisional phrase ${pattern}`);
  }
  check(bodyText.includes('vmonizperformance@gmail.com') || (await page.locator('a[href^="mailto:vmonizperformance@gmail.com"]').count()) > 0,
    `${testCase.id}: official contact email must be present`);

  const layout = await collectLayoutAudit(page);
  check(layout.horizontalOverflow <= 1, `${testCase.id}: no horizontal overflow`, layout.horizontalOverflow);
  check(layout.clippedText.length === 0, `${testCase.id}: no clipped or off-screen visible text`, layout.clippedText);
  check(layout.emptyInteractiveNames.length === 0, `${testCase.id}: controls need accessible names`, layout.emptyInteractiveNames);
  check(layout.images.every((image) => image.alt !== null && image.alt.trim() !== ''), `${testCase.id}: every image needs alt text`, layout.images);
  check(layout.images.every((image) => image.complete && image.naturalWidth > 0), `${testCase.id}: every image must load`, layout.images.filter((image) => !image.complete || image.naturalWidth === 0));
  validateHeadingSequence(layout.headings, testCase.id);

  const video = page.locator('video').first();
  check((await video.count()) === 1, `${testCase.id}: one demo video is required`);
  check(await video.getAttribute('controls') !== null, `${testCase.id}: native video controls must be enabled`);
  const source = await video.locator('source').getAttribute('src');
  const expectedVideo = testCase.lang === 'en' ? 'gameplan-demo-en.mp4' : 'gameplan-demo-ptbr.mp4';
  check(Boolean(source?.endsWith(expectedVideo)), `${testCase.id}: localized video source`, { expectedVideo, source });
  await page.waitForFunction(() => {
    const element = document.querySelector('video');
    return Boolean(element && element.readyState >= 1 && Number.isFinite(element.duration));
  }, null, { timeout: 30_000 }).catch((error) => recordFailure(`${testCase.id}: video metadata did not load`, error.message));
  const videoState = await video.evaluate(async (element) => {
    const initialTime = element.currentTime;
    element.muted = true;
    let playError = null;
    try {
      await element.play();
      await new Promise((resolve) => setTimeout(resolve, 1200));
    } catch (error) {
      playError = error.message;
    }
    const advancedTo = element.currentTime;
    element.pause();
    return { duration: element.duration, readyState: element.readyState, initialTime, advancedTo, playError, controls: element.controls };
  });
  check(videoState.duration >= 59 && videoState.duration <= 61, `${testCase.id}: demo video duration should remain 60 seconds`, videoState);
  check(videoState.advancedTo > videoState.initialTime, `${testCase.id}: demo video must play`, videoState);

  const signupHref = await page.locator('a[href*="/signup?"]').first().getAttribute('href');
  const loginHref = await page.locator('a[href*="/login?"]').first().getAttribute('href');
  check(Boolean(signupHref?.includes(`lang=${testCase.lang === 'en' ? 'en' : 'pt-BR'}`)), `${testCase.id}: signup language must be preserved`, signupHref);
  check(Boolean(loginHref?.includes(`lang=${testCase.lang === 'en' ? 'en' : 'pt-BR'}`)), `${testCase.id}: login language must be preserved`, loginHref);
  check((await page.locator('a[href^="mailto:vmonizperformance@gmail.com"]').count()) >= 1, `${testCase.id}: contact link must use official email`);
  check((await page.locator('a[href^="https://wa.me/31643759823"]').count()) === 1, `${testCase.id}: WhatsApp link must be preserved`);

  const desktop = testCase.viewport.width >= 1000;
  if (desktop) {
    check(await page.locator('.nav').isVisible(), `${testCase.id}: desktop navigation must be visible`);
    await page.locator(`.nav a:has-text("${testCase.expectedMenu}")`).click();
    await page.waitForTimeout(350);
    check(page.url().includes('#features'), `${testCase.id}: desktop navigation link must work`, page.url());
  } else {
    const menuToggle = page.locator('#menuToggle');
    check(await menuToggle.isVisible(), `${testCase.id}: mobile menu button must be visible`);
    await menuToggle.click();
    check((await menuToggle.getAttribute('aria-expanded')) === 'true', `${testCase.id}: mobile menu must expose expanded state`);
    check(await page.locator('.nav').isVisible(), `${testCase.id}: mobile navigation must open`);
    await page.screenshot({ path: `${EVIDENCE_DIR}/${testCase.id}-menu-open.png`, fullPage: false });
    await page.locator(`.nav a:has-text("${testCase.expectedMenu}")`).click();
    await page.waitForTimeout(350);
    check((await menuToggle.getAttribute('aria-expanded')) === 'false', `${testCase.id}: mobile menu must close after navigation`);
    check(page.url().includes('#features'), `${testCase.id}: mobile navigation link must work`, page.url());
  }

  await page.screenshot({ path: `${EVIDENCE_DIR}/${testCase.id}.png`, fullPage: true });

  const axe = await runAxe(page, testCase.id);
  check(events.consoleErrors.length === 0, `${testCase.id}: no browser console errors`, events.consoleErrors);
  check(events.pageErrors.length === 0, `${testCase.id}: no uncaught page errors`, events.pageErrors);
  check(events.failedRequests.length === 0, `${testCase.id}: no failed product requests`, events.failedRequests);

  report.results.push({
    id: testCase.id,
    path: testCase.path,
    viewport: testCase.viewport,
    h1,
    support,
    title: await page.title(),
    layout,
    videoState,
    axe,
    browserEvents: events,
  });

  if (testCase.id === 'pt-desktop') {
    const languageButton = page.locator('#languageButton');
    await languageButton.click();
    const enLink = page.locator('#languageMenu a[href="en.html"]');
    check(await enLink.isVisible(), 'pt-desktop: English language option must open');
    await enLink.click();
    await page.waitForLoadState('networkidle');
    await page.locator('#loader').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => undefined);
    check(page.url().includes('/en.html'), 'pt-desktop: PT-BR to EN navigation must work', page.url());
    check(normalize(await page.locator('#hero-title').innerText()) === mainCases[2].expectedH1, 'pt-desktop: English content must load after language switch');

    await page.locator('#languageButton').click();
    await page.locator('#languageMenu a[href="index.html"]').click();
    await page.waitForLoadState('networkidle');
    check(!page.url().includes('/en.html'), 'pt-desktop: EN to PT-BR navigation must work', page.url());
  }

  if (testCase.id === 'pt-desktop' && signupHref && loginHref) {
    await verifyExternalLink(context, 'PT-BR signup', signupHref);
    await verifyExternalLink(context, 'PT-BR login', loginHref);
  }
  if (testCase.id === 'en-desktop' && signupHref && loginHref) {
    await verifyExternalLink(context, 'EN signup', signupHref);
    await verifyExternalLink(context, 'EN login', loginHref);
  }

  await context.close();
}

async function auditConsent(browser, testCase) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, locale: testCase.lang === 'en' ? 'en-US' : 'pt-BR' });
  const { page, events } = await configurePage(context, `${testCase.id}-consent`);
  await waitForPage(page, testCase.path);

  check(events.posthog.length === 0, `${testCase.id}: analytics must not load before consent`, events.posthog);
  const banner = page.locator('.privacy-consent');
  check(await banner.isVisible(), `${testCase.id}: consent banner must be visible for a new visitor`);
  await page.getByRole('button', { name: testCase.expectedConsentDeny }).click();
  await page.waitForTimeout(300);
  check(await page.evaluate(() => localStorage.getItem('gameplan:privacy:analytics-consent:v1')) === 'denied', `${testCase.id}: necessary-only choice must persist`);
  check(events.posthog.length === 0, `${testCase.id}: denied consent must keep analytics unloaded`, events.posthog);

  const privacyPreference = page.getByRole('button', { name: testCase.expectedPrivacyPreference });
  check(await privacyPreference.isVisible(), `${testCase.id}: privacy preferences control must remain available`);
  await privacyPreference.click();
  check(await banner.isVisible(), `${testCase.id}: privacy preferences must reopen the banner`);
  await page.getByRole('button', { name: testCase.expectedConsentAccept }).click();
  await page.waitForTimeout(600);
  check(await page.evaluate(() => localStorage.getItem('gameplan:privacy:analytics-consent:v1')) === 'granted', `${testCase.id}: affirmative consent must persist`);
  check(events.posthog.some((entry) => entry.url.includes('/static/array.js')), `${testCase.id}: PostHog SDK must load only after consent`, events.posthog);

  await privacyPreference.click();
  await page.getByRole('button', { name: testCase.expectedConsentDeny }).click();
  await page.waitForTimeout(300);
  check(await page.evaluate(() => localStorage.getItem('gameplan:privacy:analytics-consent:v1')) === 'denied', `${testCase.id}: consent withdrawal must persist immediately`);

  report.consent.push({ id: testCase.id, posthogRequests: events.posthog });
  await context.close();
}

async function auditLegal(browser, testCase) {
  const context = await browser.newContext({ viewport: testCase.viewport, locale: testCase.lang === 'en' ? 'en-US' : 'pt-BR', colorScheme: 'dark', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const response = await page.goto(`${BASE_URL}${testCase.path}`, { waitUntil: 'networkidle', timeout: 120_000 });
  check(Boolean(response) && response.status() < 400, `${testCase.id}: legal page must load`, response?.status());
  await page.evaluate(() => document.fonts?.ready).catch(() => undefined);
  await page.waitForTimeout(300);

  check(normalize(await page.locator('h1').innerText()) === testCase.h1, `${testCase.id}: legal H1`, await page.locator('h1').innerText());
  const bodyText = await page.locator('body').innerText();
  for (const pattern of forbiddenPublicPhrases) {
    check(!pattern.test(bodyText), `${testCase.id}: legal copy must not expose ${pattern}`);
  }
  check(bodyText.includes('vmonizperformance@gmail.com'), `${testCase.id}: legal contact must be present`);

  const layout = await collectLayoutAudit(page);
  check(layout.horizontalOverflow <= 1, `${testCase.id}: no horizontal overflow`, layout.horizontalOverflow);
  check(layout.clippedText.length === 0, `${testCase.id}: no clipped legal text`, layout.clippedText);
  check(layout.emptyInteractiveNames.length === 0, `${testCase.id}: legal controls need accessible names`, layout.emptyInteractiveNames);
  check(layout.images.every((image) => image.complete && image.naturalWidth > 0), `${testCase.id}: legal images must load`, layout.images);
  validateHeadingSequence(layout.headings, testCase.id);

  await page.screenshot({ path: `${EVIDENCE_DIR}/${testCase.id}.png`, fullPage: true });
  const axe = await runAxe(page, testCase.id);
  check(consoleErrors.length === 0, `${testCase.id}: no legal console errors`, consoleErrors);
  check(pageErrors.length === 0, `${testCase.id}: no legal page errors`, pageErrors);

  const canonical = await page.locator('link[rel="canonical"]').count();
  const hreflang = await page.locator('link[rel="alternate"][hreflang]').count();
  if (!canonical || !hreflang) {
    recordWarning(`${testCase.id}: legal page has no canonical/hreflang metadata`, { canonical, hreflang });
  }

  report.results.push({ id: testCase.id, path: testCase.path, viewport: testCase.viewport, title: await page.title(), layout, axe, canonical, hreflang });
  await context.close();
}

async function auditSeo(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const current of [
    { id: 'pt', path: '/', canonical: 'https://gameplan-landing.vercel.app/', ogTitle: 'GamePlan | Do modelo ao campo' },
    { id: 'en', path: '/en.html', canonical: 'https://gameplan-landing.vercel.app/en.html', ogTitle: 'GamePlan | From the model to the pitch' },
  ]) {
    await waitForPage(page, current.path);
    const metadata = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || null,
      robots: document.querySelector('meta[name="robots"]')?.content || null,
      canonical: document.querySelector('link[rel="canonical"]')?.href || null,
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((link) => ({ lang: link.hreflang, href: link.href })),
      ogTitle: document.querySelector('meta[property="og:title"]')?.content || null,
      ogDescription: document.querySelector('meta[property="og:description"]')?.content || null,
      ogImage: document.querySelector('meta[property="og:image"]')?.content || null,
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.content || null,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => script.textContent),
    }));
    check(Boolean(metadata.title), `${current.id}: title metadata`);
    check(Boolean(metadata.description), `${current.id}: description metadata`);
    check(metadata.robots?.includes('index') && metadata.robots?.includes('follow'), `${current.id}: robots metadata`, metadata.robots);
    check(metadata.canonical === current.canonical, `${current.id}: canonical`, metadata.canonical);
    check(metadata.hreflang.length === 3 && ['pt-BR', 'en', 'x-default'].every((lang) => metadata.hreflang.some((item) => item.lang === lang)), `${current.id}: reciprocal hreflang set`, metadata.hreflang);
    check(metadata.ogTitle === current.ogTitle, `${current.id}: Open Graph title`, metadata.ogTitle);
    check(Boolean(metadata.ogDescription && metadata.ogImage && metadata.twitterCard), `${current.id}: social metadata`, metadata);
    for (const raw of metadata.jsonLd) {
      try { JSON.parse(raw); } catch (error) { recordFailure(`${current.id}: JSON-LD must parse`, error.message); }
    }
    check(metadata.jsonLd.length >= 1, `${current.id}: JSON-LD must exist`);
    report.seo[current.id] = metadata;
  }

  const robotsResponse = await context.request.get(`${BASE_URL}/robots.txt`);
  const robotsText = await robotsResponse.text();
  check(robotsResponse.status() === 200, 'robots.txt must return 200', robotsResponse.status());
  check(/User-agent:\s*\*/i.test(robotsText) && /Allow:\s*\//i.test(robotsText), 'robots.txt must allow crawling', robotsText);
  check(/Sitemap:\s*https:\/\/gameplan-landing\.vercel\.app\/sitemap\.xml/i.test(robotsText), 'robots.txt must reference sitemap', robotsText);

  const sitemapResponse = await context.request.get(`${BASE_URL}/sitemap.xml`);
  const sitemapText = await sitemapResponse.text();
  check(sitemapResponse.status() === 200, 'sitemap.xml must return 200', sitemapResponse.status());
  check(sitemapText.includes('<urlset') && sitemapText.includes('https://gameplan-landing.vercel.app/') && sitemapText.includes('https://gameplan-landing.vercel.app/en.html'), 'sitemap.xml must contain both localized landing URLs', sitemapText);
  check((sitemapText.match(/hreflang="pt-BR"/g) || []).length === 2, 'sitemap must contain PT-BR alternates');
  check((sitemapText.match(/hreflang="en"/g) || []).length === 2, 'sitemap must contain EN alternates');
  check((sitemapText.match(/hreflang="x-default"/g) || []).length === 2, 'sitemap must contain x-default alternates');
  report.seo.robots = robotsText;
  report.seo.sitemap = sitemapText;
  await context.close();
}

const browser = await chromium.launch({ headless: true });
try {
  for (const testCase of mainCases) await auditMain(browser, testCase);
  await auditConsent(browser, mainCases[0]);
  await auditConsent(browser, mainCases[2]);
  for (const testCase of legalCases) await auditLegal(browser, testCase);
  await auditSeo(browser);
} finally {
  await browser.close();
}

writeFileSync(`${EVIDENCE_DIR}/phase11-visual-validation-report.json`, JSON.stringify(report, null, 2));
writeFileSync(`${EVIDENCE_DIR}/phase11-visual-validation-summary.txt`, [
  `Source SHA: ${report.sourceSha}`,
  `Failures: ${report.failures.length}`,
  `Warnings: ${report.warnings.length}`,
  ...report.failures.map((failure) => `FAIL: ${failure.message}`),
  ...report.warnings.map((warning) => `WARN: ${warning.message}`),
].join('\n'));

if (report.failures.length) {
  console.error(`Phase 11 visual validation failed with ${report.failures.length} issue(s).`);
  process.exit(1);
}
console.log(`Phase 11 visual validation passed with ${report.warnings.length} warning(s).`);
