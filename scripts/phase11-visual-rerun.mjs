import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const OUT = 'phase11-rerun-evidence';
mkdirSync(OUT, { recursive: true });

const report = { generatedAt: new Date().toISOString(), sha: process.env.GITHUB_SHA || null, cases: [], failures: [], warnings: [] };
const fail = (message, details = null) => { report.failures.push({ message, details }); console.error('FAIL:', message, details || ''); };
const check = (condition, message, details = null) => { if (!condition) fail(message, details); };
const normalize = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const cases = [
  { id: 'pt-desktop', path: '/', viewport: { width: 1440, height: 1000 }, lang: 'pt-BR', h1: 'Do modelo ao campo. Planeje, treine e analise em um único lugar.', og: 'GamePlan | Do modelo ao campo', ogDescription: 'Planeje, treine e analise em um único lugar. Conecte modelo de jogo, exercícios, planejamento, atletas e partida sem perder a origem das decisões.' },
  { id: 'pt-mobile', path: '/', viewport: { width: 390, height: 844 }, lang: 'pt-BR', h1: 'Do modelo ao campo. Planeje, treine e analise em um único lugar.', og: 'GamePlan | Do modelo ao campo', ogDescription: 'Planeje, treine e analise em um único lugar. Conecte modelo de jogo, exercícios, planejamento, atletas e partida sem perder a origem das decisões.' },
  { id: 'en-desktop', path: '/en.html', viewport: { width: 1440, height: 1000 }, lang: 'en', h1: 'From the model to the pitch. Plan, train and analyze in one place.', og: 'GamePlan | From the model to the pitch', ogDescription: 'Plan, train and analyze in one place. Connect your game model, exercises, planning, players and match review without losing the reasoning behind each decision.' },
  { id: 'en-mobile', path: '/en.html', viewport: { width: 390, height: 844 }, lang: 'en', h1: 'From the model to the pitch. Plan, train and analyze in one place.', og: 'GamePlan | From the model to the pitch', ogDescription: 'Plan, train and analyze in one place. Connect your game model, exercises, planning, players and match review without losing the reasoning behind each decision.' },
];

const forbidden = [
  /\bTODO\b/,
  /\bplaceholder\b/i,
  /lorem ipsum/i,
  /aqui entra/i,
  /aqui (deve|precisa|vamos) (escrever|colocar|inserir)/i,
  /pré[- ]comercial/i,
  /pre[- ]commercial/i,
  /fase (específica )?de billing/i,
  /dedicated billing phase/i,
  /oferece ou prepara/i,
  /provides or prepares/i,
  /deve receber revisão/i,
  /should receive professional legal review/i,
  /\bRLS\b/,
  /\bbackend\b/i,
  /\bPreviews\b/,
  /chaves privilegiadas/i,
  /privileged keys/i,
];

async function waitReady(page, path) {
  const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 120000 });
  check(response && response.status() < 400, `${path}: page must load`, response?.status());
  await page.locator('#loader').waitFor({ state: 'hidden', timeout: 20000 }).catch(() => undefined);
  await page.evaluate(() => document.fonts?.ready).catch(() => undefined);
  await page.waitForTimeout(300);
}

async function layoutState(page) {
  return page.evaluate(() => {
    const body = document.body;
    const timeline = document.querySelector('.timeline');
    const outsideScroller = [...document.querySelectorAll('h1,h2,h3,p,a,button,li,strong,small')]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      })
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.left >= -2 && rect.right <= window.innerWidth + 2) return false;
        let ancestor = element.parentElement;
        while (ancestor) {
          const style = getComputedStyle(ancestor);
          if ((style.overflowX === 'auto' || style.overflowX === 'scroll') && ancestor.scrollWidth > ancestor.clientWidth) return false;
          ancestor = ancestor.parentElement;
        }
        return true;
      })
      .map((element) => ({ tag: element.tagName, text: (element.textContent || '').trim().slice(0, 120), rect: element.getBoundingClientRect().toJSON() }));
    return {
      viewport: window.innerWidth,
      bodyScrollWidth: body.scrollWidth,
      bodyOverflow: Math.max(0, body.scrollWidth - window.innerWidth),
      rootScrollWidth: document.documentElement.scrollWidth,
      outsideScroller,
      timeline: timeline ? {
        tabIndex: timeline.tabIndex,
        role: timeline.getAttribute('role'),
        ariaLabel: timeline.getAttribute('aria-label'),
        clientWidth: timeline.clientWidth,
        scrollWidth: timeline.scrollWidth,
        overflowX: getComputedStyle(timeline).overflowX,
      } : null,
    };
  });
}

const browser = await chromium.launch({ headless: true });
try {
  for (const testCase of cases) {
    const context = await browser.newContext({ viewport: testCase.viewport, locale: testCase.lang === 'en' ? 'en-US' : 'pt-BR', colorScheme: 'dark', reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await waitReady(page, testCase.path);
    check(normalize(await page.locator('#hero-title').innerText()) === testCase.h1, `${testCase.id}: slogan/support must remain correct`, await page.locator('#hero-title').innerText());
    check((await page.locator('meta[property="og:title"]').getAttribute('content')) === testCase.og, `${testCase.id}: runtime Open Graph title`, await page.locator('meta[property="og:title"]').getAttribute('content'));
    check((await page.locator('meta[property="og:description"]').getAttribute('content')) === testCase.ogDescription, `${testCase.id}: runtime Open Graph description`, await page.locator('meta[property="og:description"]').getAttribute('content'));

    const layout = await layoutState(page);
    check(layout.bodyOverflow <= 1, `${testCase.id}: page body must not horizontally overflow`, layout);
    check(layout.outsideScroller.length === 0, `${testCase.id}: visible text must not escape the viewport except inside intentional horizontal scrollers`, layout.outsideScroller);
    check(layout.timeline && layout.timeline.tabIndex === 0 && layout.timeline.role === 'region' && Boolean(layout.timeline.ariaLabel), `${testCase.id}: timeline must be keyboard-focusable and labelled`, layout.timeline);
    if (testCase.viewport.width <= 1120) {
      check(layout.timeline.scrollWidth > layout.timeline.clientWidth, `${testCase.id}: responsive timeline remains an internal horizontal scroller`, layout.timeline);
      await page.locator('.timeline').focus();
      check(await page.locator('.timeline').evaluate((element) => document.activeElement === element), `${testCase.id}: keyboard focus reaches timeline`);
    }

    const axe = await new AxeBuilder({ page }).analyze();
    const serious = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
    check(serious.length === 0, `${testCase.id}: no serious/critical accessibility violations`, serious.map((violation) => ({ id: violation.id, impact: violation.impact, help: violation.help, targets: violation.nodes.map((node) => node.target) })));

    const video = page.locator('video').first();
    await page.waitForFunction(() => {
      const element = document.querySelector('video');
      return Boolean(element && element.readyState >= 1 && Number.isFinite(element.duration));
    }, null, { timeout: 30000 }).catch((error) => fail(`${testCase.id}: video metadata must load`, error.message));
    const media = await video.evaluate(async (element) => {
      element.muted = true;
      const start = element.currentTime;
      let error = null;
      try { await element.play(); await new Promise((resolve) => setTimeout(resolve, 1000)); } catch (caught) { error = caught.message; }
      const end = element.currentTime;
      element.pause();
      return { duration: element.duration, readyState: element.readyState, start, end, error, controls: element.controls };
    });
    check(media.controls && media.duration >= 59 && media.duration <= 61 && media.end > media.start && !media.error, `${testCase.id}: localized native video controls/playback`, media);
    check(consoleErrors.length === 0, `${testCase.id}: no console errors`, consoleErrors);
    check(pageErrors.length === 0, `${testCase.id}: no page errors`, pageErrors);

    const metadata = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || null,
      canonical: document.querySelector('link[rel="canonical"]')?.href || null,
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((link) => link.hreflang),
      robots: document.querySelector('meta[name="robots"]')?.content || null,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => script.textContent),
    }));
    check(Boolean(metadata.title && metadata.description && metadata.canonical), `${testCase.id}: title/description/canonical must remain present`, metadata);
    check(['pt-BR', 'en', 'x-default'].every((lang) => metadata.hreflang.includes(lang)), `${testCase.id}: hreflang set must remain complete`, metadata.hreflang);
    check(metadata.robots?.includes('index') && metadata.robots?.includes('follow'), `${testCase.id}: index/follow metadata`, metadata.robots);
    for (const raw of metadata.jsonLd) { try { JSON.parse(raw); } catch (error) { fail(`${testCase.id}: JSON-LD must parse`, error.message); } }
    check(metadata.jsonLd.length > 0, `${testCase.id}: JSON-LD remains present`);

    await page.screenshot({ path: `${OUT}/${testCase.id}.png`, fullPage: true });
    report.cases.push({ ...testCase, layout, media, metadata, axe: axe.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help })) });
    await context.close();
  }

  const legal = [
    { id: 'pt-privacy', path: '/privacy.html', viewport: { width: 1280, height: 900 } },
    { id: 'pt-terms', path: '/terms.html', viewport: { width: 390, height: 844 } },
    { id: 'en-privacy', path: '/privacy-en.html', viewport: { width: 1280, height: 900 } },
    { id: 'en-terms', path: '/terms-en.html', viewport: { width: 390, height: 844 } },
  ];
  for (const testCase of legal) {
    const context = await browser.newContext({ viewport: testCase.viewport, colorScheme: 'dark', reducedMotion: 'reduce' });
    const page = await context.newPage();
    const response = await page.goto(`${BASE_URL}${testCase.path}`, { waitUntil: 'networkidle', timeout: 120000 });
    check(response && response.status() < 400, `${testCase.id}: legal page loads`, response?.status());
    const text = await page.locator('body').innerText();
    for (const pattern of forbidden) check(!pattern.test(text), `${testCase.id}: no provisional/internal copy ${pattern}`);
    check(text.includes('vmonizperformance@gmail.com'), `${testCase.id}: official contact remains present`);
    const bodyOverflow = await page.evaluate(() => Math.max(0, document.body.scrollWidth - window.innerWidth));
    check(bodyOverflow <= 1, `${testCase.id}: legal page body does not overflow`, bodyOverflow);
    await page.screenshot({ path: `${OUT}/${testCase.id}.png`, fullPage: true });
    report.cases.push({ ...testCase, bodyOverflow });
    await context.close();
  }
} finally {
  await browser.close();
}

writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
writeFileSync(`${OUT}/summary.txt`, [`SHA: ${report.sha}`, `Failures: ${report.failures.length}`, ...report.failures.map((item) => `FAIL: ${item.message}`), ...report.warnings.map((item) => `WARN: ${item.message}`)].join('\n'));
if (report.failures.length) process.exit(1);
console.log('Phase 11 affected visual gates passed.');
