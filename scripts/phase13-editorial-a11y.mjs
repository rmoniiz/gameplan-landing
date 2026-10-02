import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const cases = [
  { path: '/index.html', lang: 'pt-BR', width: 1440, height: 1000 },
  { path: '/en.html', lang: 'en', width: 1440, height: 1000 },
  { path: '/index.html', lang: 'pt-BR', width: 390, height: 844, reducedMotion: true },
  { path: '/en.html', lang: 'en', width: 390, height: 844, reducedMotion: true },
];

const browser = await chromium.launch({ headless: true });
const failures = [];

for (const testCase of cases) {
  const context = await browser.newContext({
    viewport: { width: testCase.width, height: testCase.height },
    reducedMotion: testCase.reducedMotion ? 'reduce' : 'no-preference',
  });

  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    const origin = new URL(base).origin;
    if (url.origin === origin) await route.continue();
    else await route.abort();
  });

  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && text !== 'Failed to load resource: net::ERR_FAILED') runtimeErrors.push(text);
  });

  await page.goto(`${base}${testCase.path}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#lead-magnet').waitFor({ state: 'visible' });
  await page.locator('#loader').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {});

  const actualLang = await page.locator('html').getAttribute('lang');
  if (actualLang !== testCase.lang) failures.push(`${testCase.path} ${testCase.width}px: language mismatch ${actualLang}`);

  const serious = (await new AxeBuilder({ page }).analyze())
    .violations
    .filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))
    .map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => ({
        target: node.target.join(' '),
        summary: node.failureSummary || '',
      })),
    }));
  if (serious.length) failures.push(`${testCase.path} ${testCase.width}px: axe ${JSON.stringify(serious)}`);

  const layout = await page.evaluate(() => {
    const rawOverflow = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const rootOverflow = getComputedStyle(document.documentElement).overflowX;
    const bodyOverflow = getComputedStyle(document.body).overflowX;
    return {
      rawOverflow,
      clipped: [rootOverflow, bodyOverflow].some((value) => ['hidden', 'clip'].includes(value)),
      main: document.querySelector('main')?.getBoundingClientRect().width || 0,
      viewport: innerWidth,
    };
  });
  if (layout.rawOverflow > 2 && !layout.clipped) failures.push(`${testCase.path} ${testCase.width}px: uncontained overflow ${layout.rawOverflow}px`);
  if (layout.main < 1 || layout.main > layout.viewport + 2) failures.push(`${testCase.path} ${testCase.width}px: main width ${layout.main}/${layout.viewport}`);
  runtimeErrors.forEach((error) => failures.push(`${testCase.path} ${testCase.width}px: runtime ${error}`));

  await context.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Editorial landing accessibility: PT-BR/English desktop/mobile passed serious/critical Axe, runtime and containment checks.');
