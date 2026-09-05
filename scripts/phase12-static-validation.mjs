import fs from 'node:fs/promises';

const failures = [];
const checks = [];
const files = {
  pt: await fs.readFile('index.html', 'utf8'),
  en: await fs.readFile('en.html', 'utf8'),
  checklistPt: await fs.readFile('checklist-modelo-de-jogo.html', 'utf8'),
  checklistEn: await fs.readFile('game-model-checklist.html', 'utf8'),
  capture: await fs.readFile('phase12-lead-capture.js', 'utf8'),
  styles: await fs.readFile('phase12-lead-capture.css', 'utf8'),
  privacyPt: await fs.readFile('privacy.html', 'utf8'),
  privacyEn: await fs.readFile('privacy-en.html', 'utf8'),
};
const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));

const check = (name, condition, detail = '') => {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) failures.push(detail ? `${name}: ${detail}` : name);
};

for (const [language, html] of [['pt-BR', files.pt], ['en', files.en]]) {
  check(`${language} Phase 12 stylesheet once`, (html.match(/phase12-lead-capture\.css/g) || []).length === 1);
  check(`${language} Phase 12 script once`, (html.match(/phase12-lead-capture\.js/g) || []).length === 1);
  for (const section of ['connection', 'features', 'demo', 'pricing', 'about', 'timeline', 'feedback']) {
    check(`${language} preserves #${section}`, html.includes(`id="${section}"`));
  }
  check(`${language} preserves privacy link`, /href="privacy(?:-en)?\.html"/.test(html));
  check(`${language} preserves terms link`, /href="terms(?:-en)?\.html"/.test(html));
  check(`${language} preserves signup`, html.includes('/signup?trial=7&lang='));
  check(`${language} preserves login`, html.includes('/login?lang='));
  check(`${language} preserves WhatsApp`, html.includes('wa.me/'));
}

for (const [language, html, expectedLang] of [
  ['pt-BR', files.checklistPt, 'pt-BR'],
  ['en', files.checklistEn, 'en'],
]) {
  check(`${language} checklist language`, html.includes(`<html lang="${expectedLang}">`));
  check(`${language} checklist noindex`, /<meta name="robots" content="noindex, nofollow"/.test(html));
  check(`${language} checklist has 10 items`, (html.match(/class="checklist-item glass"/g) || []).length === 10);
  check(`${language} checklist has 10 practical prompts`, (html.match(/class="checklist-prompt"/g) || []).length === 10);
  check(`${language} checklist supports print`, html.includes('window.print()'));
}

check('capture has no literal Supabase endpoint', !/supabase\.co|capture-marketing-lead/.test(files.capture));
check('capture defaults to explicit runtime gate', files.capture.includes("enabled: runtimeConfig.enabled === true"));
check('capture is bound to the Phase 12 branch Preview hostname', files.capture.includes("auditedPreviewHost = 'gameplan-landing-git-phase-12-lead-magnet-mvp-rmoniizs-projects.vercel.app'"));
check('capture requires exact Preview hostname match', files.capture.includes('window.location.hostname === auditedPreviewHost'));
check('capture points only at audited Rehearsal project ref', files.capture.includes("auditedRehearsalRef = 'dyhkhnjmnmktpjlqcqej'"));
check('capture has a 10-second timeout', files.capture.includes('controller.abort(), 10000'));
check('capture sanitizes campaign controls', files.capture.includes("replace(/[\\u0000-\\u001f\\u007f]/g"));
check('capture never sends analytics without granted consent', files.capture.includes("!== 'granted'"));
check('capture has no service key markers', !/service_role|sb_secret_|SUPABASE_SERVICE_ROLE/i.test(Object.values(files).join('\n')));

for (const eventName of [
  'landing_lead_magnet_viewed',
  'landing_lead_capture_started',
  'landing_lead_capture_submitted',
  'landing_lead_capture_succeeded',
  'landing_lead_capture_failed',
  'landing_lead_magnet_opened',
  'landing_lead_magnet_trial_clicked',
]) {
  check(`event contract ${eventName}`, files.capture.includes(eventName));
}

check('PT-BR privacy disclosure', files.privacyPt.includes('Solicitação de materiais gratuitos'));
check('English privacy disclosure', files.privacyEn.includes('Free-resource requests'));
check('PT-BR privacy states 12-month lead retention', files.privacyPt.includes('por até 12 meses'));
check('English privacy states 12-month lead retention', files.privacyEn.includes('for up to 12 months'));
check('reduced-motion styles', files.styles.includes('@media(prefers-reduced-motion:reduce)'));
check('mobile breakpoint styles', files.styles.includes('@media(max-width:820px)'));
check('print styles', files.styles.includes('@media print'));
check('ffmpeg-static is pinned', packageJson.dependencies?.['ffmpeg-static'] === '5.2.0');
check('Playwright is pinned', packageJson.devDependencies?.playwright === '1.63.0');
check('Axe is pinned', packageJson.devDependencies?.['@axe-core/playwright'] === '4.13.0');
check('Rehearsal smoke command exists', packageJson.scripts?.['test:phase12:rehearsal'] === 'node scripts/phase12-rehearsal-smoke.mjs');

const report = { generatedAt: new Date().toISOString(), checks, failures };
await fs.mkdir('phase12-validation-evidence', { recursive: true });
await fs.writeFile('phase12-validation-evidence/static-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ checks: checks.length, failures }, null, 2));
if (failures.length) process.exit(1);
