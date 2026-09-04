import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = 'phase12-validation-evidence';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { generatedAt: new Date().toISOString(), sha: process.env.GITHUB_SHA || null, cases: [], failures: [] };

async function runCase({ name, path, width, height, lang, submit = false }) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console:${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`page:${err.message}`));
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.locator('#lead-magnet').scrollIntoViewIfNeeded();
  const visible = await page.locator('#lead-magnet').isVisible();
  const locale = await page.locator('html').getAttribute('lang');
  const bodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const form = page.locator('.lead-magnet-form');
  const consentText = (await page.locator('.lead-consent').innerText()).trim();
  const checkbox = page.locator('.lead-consent input[type=checkbox]');
  let success = null;
  if (submit) {
    await form.locator('input[name=name]').fill(lang === 'en' ? 'Phase Twelve Test' : 'Teste Fase Doze');
    await form.locator('input[name=email]').fill(`phase12-e2e-${Date.now()}-${lang.replace(/[^a-z]/gi,'')}@example.invalid`);
    await form.locator('button[type=submit]').click();
    const invalidWithoutConsent = await checkbox.evaluate((el) => !el.validity.valid);
    if (!invalidWithoutConsent) errors.push('consent checkbox did not block submit');
    await checkbox.check();
    await form.locator('button[type=submit]').click();
    await page.locator('.lead-success').waitFor({ state: 'visible', timeout: 15000 });
    success = { visible: await page.locator('.lead-success').isVisible(), href: await page.locator('.lead-open').getAttribute('href') };
  }
  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter(v => ['serious','critical'].includes(v.impact || '')).map(v => ({ id:v.id, impact:v.impact, nodes:v.nodes.length }));
  if (!visible) errors.push('lead magnet not visible');
  if (locale !== lang) errors.push(`lang mismatch ${locale}`);
  if (bodyOverflow > 1) errors.push(`horizontal overflow ${bodyOverflow}`);
  if (!consentText) errors.push('consent copy missing');
  if (serious.length) errors.push(`axe serious/critical: ${serious.map(v=>v.id).join(',')}`);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  report.cases.push({ name, path, width, height, locale, visible, bodyOverflow, consentText, success, serious, errors });
  report.failures.push(...errors.map(error => `${name}: ${error}`));
  await context.close();
}

await runCase({ name:'pt-desktop', path:'/index.html?utm_source=phase12-test&utm_medium=e2e&utm_campaign=lead-capture', width:1440, height:1000, lang:'pt-BR', submit:true });
await runCase({ name:'pt-mobile', path:'/index.html', width:390, height:844, lang:'pt-BR' });
await runCase({ name:'en-desktop', path:'/en.html?utm_source=phase12-test&utm_medium=e2e&utm_campaign=lead-capture', width:1440, height:1000, lang:'en', submit:true });
await runCase({ name:'en-mobile', path:'/en.html', width:390, height:844, lang:'en' });

for (const [name, path, lang] of [['checklist-pt','/checklist-modelo-de-jogo.html','pt-BR'],['checklist-en','/game-model-checklist.html','en']]) {
  const context = await browser.newContext({ viewport:{ width:390, height:844 } });
  const page = await context.newPage();
  await page.goto(`${base}${path}`, { waitUntil:'networkidle' });
  const robots = await page.locator('meta[name=robots]').getAttribute('content');
  const articles = await page.locator('.checklist-item').count();
  const locale = await page.locator('html').getAttribute('lang');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const errors=[];
  if (robots !== 'noindex, nofollow') errors.push(`robots=${robots}`);
  if (articles !== 10) errors.push(`articles=${articles}`);
  if (locale !== lang) errors.push(`lang=${locale}`);
  if (overflow > 1) errors.push(`horizontal overflow=${overflow}`);
  await page.screenshot({ path:`${out}/${name}.png`, fullPage:true });
  report.cases.push({ name, path, locale, robots, articles, bodyOverflow:overflow, errors });
  report.failures.push(...errors.map(error => `${name}: ${error}`));
  await context.close();
}

await browser.close();
await fs.writeFile(`${out}/report.json`, JSON.stringify(report,null,2));
await fs.writeFile(`${out}/summary.txt`, `SHA: ${report.sha}\nFailures: ${report.failures.length}\n${report.failures.join('\n')}\n`);
console.log(JSON.stringify(report,null,2));
if (report.failures.length) process.exit(1);