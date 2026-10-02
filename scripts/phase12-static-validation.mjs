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
  editorialCss: await fs.readFile('phase13-editorial-redesign.css', 'utf8'),
  editorialJs: await fs.readFile('phase13-editorial-redesign.js', 'utf8'),
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
  check(`${language} editorial stylesheet once`, (html.match(/phase13-editorial-redesign\.css/g) || []).length === 1);
  check(`${language} editorial runtime once`, (html.match(/phase13-editorial-redesign\.js/g) || []).length === 1);
  for (const section of ['process', 'product', 'demo', 'pricing', 'about', 'feedback']) {
    check(`${language} preserves #${section}`, html.includes(`id="${section}"`));
  }
  check(`${language} removed old card/connection architecture`, !/id="connection"|id="features"|features-grid|connection-board/.test(html));
  check(`${language} excludes legacy visual runtimes`, !/landing-final-polish\.js|landing-latest-connection\.js|phase13-landing-refinement\.js/.test(html));
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

check('capture has no literal Supabase endpoint', !/https:\/\/[^'"`\s]*supabase\.co/.test(files.capture));
check('capture defaults to explicit runtime gate', files.capture.includes("enabled: runtimeConfig.enabled === true"));
check('capture has explicit Preview allowlist', files.capture.includes('const auditedPreviewHosts = new Set(['));
check('capture keeps original audited Preview hostname', files.capture.includes('gameplan-landing-git-phase-12-lead-magnet-mvp-rmoniizs-projects.vercel.app'));
check('capture includes actual production-readiness Preview alias', files.capture.includes('gameplan-landing-git-phase-12-producti-f5a01e-rmoniizs-projects.vercel.app'));
check('capture excludes guessed production-readiness hostname', !files.capture.includes('gameplan-landing-git-phase-12-production-readiness-landing-rmoniizs-projects.vercel.app'));
check('capture requires exact Preview hostname membership', files.capture.includes('auditedPreviewHosts.has(window.location.hostname)'));
check('capture points Preview only at audited Rehearsal project ref', files.capture.includes("auditedRehearsalRef = 'dyhkhnjmnmktpjlqcqej'"));
check('capture has exact production hostname', files.capture.includes("productionHost = 'gameplan-landing.vercel.app'"));
check('capture points production only at primary project ref', files.capture.includes("productionRef = 'ljuwnrbrneedzatbbslr'"));
check('capture unknown hosts stay disabled', files.capture.includes(': {}'));
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
check('lead capture reduced-motion styles', files.styles.includes('@media(prefers-reduced-motion:reduce)'));
check('lead capture mobile breakpoint styles', files.styles.includes('@media(max-width:820px)'));
check('lead capture print styles', files.styles.includes('@media print'));
check('ffmpeg-static is pinned', packageJson.dependencies?.['ffmpeg-static'] === '5.2.0');
check('Playwright is pinned', packageJson.devDependencies?.playwright === '1.63.0');
check('Axe is pinned', packageJson.devDependencies?.['@axe-core/playwright'] === '4.13.0');
check('Rehearsal smoke command exists', packageJson.scripts?.['test:phase12:rehearsal'] === 'node scripts/phase12-rehearsal-smoke.mjs');

check('editorial CSS includes dark and paper canvases', files.editorialCss.includes('--dark:#050b22') && files.editorialCss.includes('--paper:#f3efe6'));
check('editorial CSS includes reduced-motion support', files.editorialCss.includes('@media(prefers-reduced-motion:reduce)'));
check('editorial CSS includes responsive mobile breakpoint', files.editorialCss.includes('@media(max-width:760px)'));
check('editorial CSS contains no gradients', !/linear-gradient|radial-gradient|conic-gradient/i.test(files.editorialCss));
check('editorial CSS contains no decorative blur', !/filter\s*:\s*blur\s*\(/i.test(files.editorialCss));
check('editorial CSS contains no backdrop filter', !/backdrop-filter/i.test(files.editorialCss));
check('editorial CSS uses real-product composition', files.editorialCss.includes('.hero-product') && files.editorialCss.includes('.product-shot') && files.editorialCss.includes('.module-list'));
check('editorial runtime moves its CSS to final precedence', files.editorialJs.includes('document.head.appendChild(stylesheet)'));
check('editorial runtime announces ready state', files.editorialJs.includes("document.body.classList.add('editorial-ready')"));
check('editorial runtime observes coaching flow', files.editorialJs.includes("document.querySelectorAll('[data-flow-step]')"));
check('editorial runtime respects reduced motion', files.editorialJs.includes('prefers-reduced-motion: reduce'));

const report = { generatedAt: new Date().toISOString(), checks, failures };
await fs.mkdir('phase12-validation-evidence', { recursive: true });
await fs.writeFile('phase12-validation-evidence/static-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ checks: checks.length, failures }, null, 2));
if (failures.length) process.exit(1);
