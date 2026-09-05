import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = 'phase12-validation-evidence';
const cases = [
  { name: 'pt-scroll-stability', path: '/index.html', lang: 'pt-BR' },
  { name: 'en-scroll-stability', path: '/en.html', lang: 'en' },
];

await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const testCase of cases) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  await context.addInitScript(() => {
    localStorage.setItem('gameplan:privacy:analytics-consent:v1', 'denied');
  });
  await context.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const baseUrl = new URL(base);
    if (requestUrl.origin === baseUrl.origin) await route.continue();
    else await route.abort();
  });

  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && text !== 'Failed to load resource: net::ERR_FAILED') runtimeErrors.push(`console: ${text}`);
  });

  await page.goto(`${base}${testCase.path}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#lead-magnet').waitFor({ state: 'visible' });
  await page.locator('#loader').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(800);

  const maxScroll = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
  const stops = [0, .18, .38, .58, .78, 1, .72, .44, .16, 0].map((ratio) => Math.round(maxScroll * ratio));
  for (const y of stops) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(90);
  }

  const stability = await page.evaluate(() => {
    const ids = ['connection', 'features', 'demo', 'pricing', 'about', 'timeline', 'feedback', 'lead-magnet'];
    const sections = ids.map((id) => {
      const element = document.getElementById(id);
      if (!element) return { id, exists: false };
      const style = getComputedStyle(element);
      return {
        id,
        exists: true,
        display: style.display,
        visibility: style.visibility,
        opacity: Number(style.opacity || 1),
        textLength: (element.innerText || '').trim().length,
      };
    });
    const hiddenReveal = [...document.querySelectorAll('.reveal')]
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) < .95;
      })
      .map((element) => element.id || element.className);
    const brokenImages = [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute('src'));
    return { sections, hiddenReveal, brokenImages, hasMotionTilt: Boolean(document.querySelector('.motion-tilt')) };
  });

  const errors = [...runtimeErrors];
  for (const section of stability.sections) {
    if (!section.exists) errors.push(`missing section after scroll: ${section.id}`);
    else if (section.display === 'none' || section.visibility === 'hidden' || section.opacity < .95 || section.textLength < 10) {
      errors.push(`section not paintable after scroll: ${JSON.stringify(section)}`);
    }
  }
  if (stability.hiddenReveal.length) errors.push(`reveal content became hidden after fast scroll: ${stability.hiddenReveal.join(', ')}`);
  if (stability.brokenImages.length) errors.push(`images failed after scroll: ${stability.brokenImages.join(', ')}`);
  if (stability.hasMotionTilt) errors.push('GPU-heavy motion tilt must not be present');
  const actualLang = await page.locator('html').getAttribute('lang');
  if (actualLang !== testCase.lang) errors.push(`language mismatch: ${actualLang}`);

  await page.screenshot({ path: `${out}/${testCase.name}.png`, fullPage: true });
  await fs.writeFile(`${out}/${testCase.name}.json`, JSON.stringify({ ...testCase, actualLang, stability, errors }, null, 2));
  errors.forEach((error) => failures.push(`${testCase.name}: ${error}`));
  await context.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Phase 12 scroll stability: PT-BR and English passed fast down/up paint checks.');