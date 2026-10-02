import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = 'phase12-validation-evidence';
const cases = [
  { name: 'pt-desktop-scroll-paint', path: '/index.html', lang: 'pt-BR', viewport: { width: 1440, height: 1000 }, desktop: true },
  { name: 'en-desktop-scroll-paint', path: '/en.html', lang: 'en', viewport: { width: 1440, height: 1000 }, desktop: true },
  { name: 'pt-mobile-scroll-paint', path: '/index.html', lang: 'pt-BR', viewport: { width: 390, height: 844 }, desktop: false },
  { name: 'en-mobile-scroll-paint', path: '/en.html', lang: 'en', viewport: { width: 390, height: 844 }, desktop: false },
];

await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];

const analyzePaintVideo = async (videoPath, testName) => {
  const metadataPath = path.join(out, `${testName}-luma.txt`);
  execFileSync(ffmpegPath, [
    '-hide_banner', '-loglevel', 'error', '-i', videoPath,
    '-vf', `crop=iw*0.70:ih*0.48:iw*0.15:ih*0.20,signalstats,metadata=print:file=${metadataPath}`,
    '-an', '-f', 'null', '-',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  const metadata = await fs.readFile(metadataPath, 'utf8');
  const luma = [...metadata.matchAll(/lavfi\.signalstats\.YAVG=(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
  const maxLuma = luma.length ? Math.max(...luma) : 0;
  const nearWhiteFrames = luma.filter((value) => value > 250).length;
  let isolatedNearWhiteSpikes = 0;
  for (let index = 1; index < luma.length - 1; index += 1) {
    if (luma[index] > 250 && luma[index - 1] < 230 && luma[index + 1] < 230) isolatedNearWhiteSpikes += 1;
  }
  const avgLuma = luma.length ? luma.reduce((sum, value) => sum + value, 0) / luma.length : 0;
  return { frames: luma.length, maxLuma, avgLuma, nearWhiteFrames, isolatedNearWhiteSpikes };
};

for (const testCase of cases) {
  const context = await browser.newContext({
    viewport: testCase.viewport,
    reducedMotion: 'no-preference',
    recordVideo: { dir: out, size: testCase.viewport },
  });
  await context.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const baseUrl = new URL(base);
    if (requestUrl.origin === baseUrl.origin) await route.continue();
    else await route.abort();
  });

  const page = await context.newPage();
  const video = page.video();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && text !== 'Failed to load resource: net::ERR_FAILED') runtimeErrors.push(`console: ${text}`);
  });

  await page.goto(`${base}${testCase.path}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#lead-magnet').waitFor({ state: 'visible' });
  await page.locator('#loader').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(500);

  const maxScroll = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
  const wheelStep = testCase.desktop ? 560 : 390;
  const downSteps = Math.max(18, Math.ceil(maxScroll / wheelStep));
  for (let index = 0; index < downSteps; index += 1) {
    await page.mouse.wheel(0, wheelStep);
    await page.waitForTimeout(12);
  }
  for (let index = 0; index < downSteps; index += 1) {
    await page.mouse.wheel(0, -wheelStep);
    await page.waitForTimeout(12);
  }
  for (let index = 0; index < Math.ceil(downSteps * 0.68); index += 1) {
    await page.mouse.wheel(0, wheelStep);
    await page.waitForTimeout(10);
  }
  await page.waitForTimeout(250);

  const stability = await page.evaluate(() => {
    const ids = ['process', 'product', 'demo', 'about', 'pricing', 'feedback', 'lead-magnet'];
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
    const rawOverflow = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const rootOverflow = getComputedStyle(document.documentElement).overflowX;
    const bodyOverflow = getComputedStyle(document.body).overflowX;
    const horizontalOverflowIsClipped = [rootOverflow, bodyOverflow].some((value) => ['hidden', 'clip'].includes(value));
    return {
      sections,
      hiddenReveal,
      brokenImages,
      rawOverflow,
      horizontalOverflowIsClipped,
      editorialReady: document.body.classList.contains('editorial-ready'),
      editorialStylesLoaded: Boolean(document.querySelector('link[href="phase13-editorial-redesign.css"]')?.sheet),
      legacyBackgroundLayers: Boolean(document.querySelector('.bg-grid, .bg-blur')),
      rootBackground: getComputedStyle(document.documentElement).backgroundColor,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
    };
  });

  const actualLang = await page.locator('html').getAttribute('lang');
  await page.screenshot({ path: `${out}/${testCase.name}.png`, fullPage: false });
  await context.close();
  const sourceVideoPath = await video.path();
  const evidenceVideoPath = path.join(out, `${testCase.name}.webm`);
  if (sourceVideoPath !== evidenceVideoPath) await fs.copyFile(sourceVideoPath, evidenceVideoPath);
  const paint = await analyzePaintVideo(evidenceVideoPath, testCase.name);

  const errors = [...runtimeErrors];
  for (const section of stability.sections) {
    if (!section.exists) errors.push(`missing section after continuous scroll: ${section.id}`);
    else if (section.display === 'none' || section.visibility === 'hidden' || section.opacity < .95 || section.textLength < 10) {
      errors.push(`section not paintable after continuous scroll: ${JSON.stringify(section)}`);
    }
  }
  if (stability.hiddenReveal.length) errors.push(`reveal content became hidden: ${stability.hiddenReveal.join(', ')}`);
  if (stability.brokenImages.length) errors.push(`images failed after scroll: ${stability.brokenImages.join(', ')}`);
  if (stability.rawOverflow > 2 && !stability.horizontalOverflowIsClipped) errors.push(`uncontained horizontal overflow after continuous scroll: ${stability.rawOverflow}`);
  if (!stability.editorialReady) errors.push('editorial runtime did not mark the page ready');
  if (!stability.editorialStylesLoaded) errors.push('editorial stylesheet did not load');
  if (stability.legacyBackgroundLayers) errors.push('legacy decorative background layers are still present');
  if (stability.rootBackground !== 'rgb(5, 11, 34)') errors.push(`root canvas fallback is not dark: ${stability.rootBackground}`);
  if (stability.bodyBackground !== 'rgb(5, 11, 34)') errors.push(`body fallback is not dark: ${stability.bodyBackground}`);
  if (actualLang !== testCase.lang) errors.push(`language mismatch: ${actualLang}`);
  if (!paint.frames) errors.push('continuous-scroll video did not yield paint frames');
  if (paint.isolatedNearWhiteSpikes > 0 || paint.maxLuma > 253) {
    errors.push(`unexpected near-white paint flash detected: ${JSON.stringify(paint)}`);
  }

  await fs.writeFile(`${out}/${testCase.name}.json`, JSON.stringify({ ...testCase, actualLang, stability, paint, errors }, null, 2));
  errors.forEach((error) => failures.push(`${testCase.name}: ${error}`));
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Editorial landing continuous-scroll paint: PT-BR/English desktop/mobile passed runtime, overflow and paint checks.');
