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
  finalPolish: await fs.readFile('landing-final-polish.js', 'utf8'),
  compositor: await fs.readFile('phase12-scroll-compositor.css', 'utf8'),
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
check('reduced-motion styles', files.styles.includes('@media(prefers-reduced-motion:reduce)'));
check('mobile breakpoint styles', files.styles.includes('@media(max-width:820px)'));
check('print styles', files.styles.includes('@media print'));
check('ffmpeg-static is pinned', packageJson.dependencies?.['ffmpeg-static'] === '5.2.0');
check('Playwright is pinned', packageJson.devDependencies?.playwright === '1.63.0');
check('Axe is pinned', packageJson.devDependencies?.['@axe-core/playwright'] === '4.13.0');
check('Rehearsal smoke command exists', packageJson.scripts?.['test:phase12:rehearsal'] === 'node scripts/phase12-rehearsal-smoke.mjs');

check('compositor guard stylesheet is loaded by final polish', files.finalPolish.includes("compositorStylesheet.href = 'phase12-scroll-compositor.css'"));
check('root canvas gets an immediate dark fallback', files.finalPolish.includes("root.style.backgroundColor = '#050b22'"));
check('body gets an immediate dark fallback', files.finalPolish.includes("body.style.backgroundColor = '#050b22'"));
check('CSS keeps html canvas dark', /html\s*\{[^}]*background-color\s*:\s*#050b22/i.test(files.compositor));
check('CSS isolates body stacking context', /body\s*\{[^}]*isolation\s*:\s*isolate/i.test(files.compositor));
check('decorative backgrounds no longer use negative z-index', /body::before,\s*\.bg-grid,\s*\.bg-blur\s*\{[^}]*z-index\s*:\s*0!important/i.test(files.compositor));
check('tilt keeps no permanent will-change', /\.motion-tilt\s*\{[^}]*will-change\s*:\s*auto!important/i.test(files.compositor));
check('tilt promotes only during interaction', /\.motion-tilt\.is-tilting\s*\{[^}]*will-change\s*:\s*transform!important/i.test(files.compositor));
check('scroll progress is scoped to the header', files.finalPolish.includes("header.style.setProperty('--scroll-progress'"));
check('journey progress is scoped to the journey', files.finalPolish.includes("journey.style.setProperty('--journey-progress'"));
check('section ambience is scoped to body', files.finalPolish.includes("body.style.setProperty('--section-rgb'"));
check('pointer glow coordinates are scoped to body', files.finalPolish.includes("body.style.setProperty('--pointer-x'") && files.finalPolish.includes("body.style.setProperty('--pointer-y'"));
check('no scroll progress write remains on root', !files.finalPolish.includes("root.style.setProperty('--scroll-progress'"));
check('no journey progress write remains on root', !files.finalPolish.includes("root.style.setProperty('--journey-progress'"));
check('header height is cached outside scroll RAF', files.finalPolish.includes('cachedHeaderHeight = header?.offsetHeight || 0'));
check('scroll RAF uses cached header height', files.finalPolish.includes('scrollY + cachedHeaderHeight'));
check('cinematic tilt remains enabled', files.finalPolish.includes("setupTilt(document.querySelector('.connection-board'), 1.25)") && files.finalPolish.includes("setupTilt(document.querySelector('.demo-shell'), 1.05)") && files.finalPolish.includes("setupTilt(document.querySelector('.founder-card'), 1.15)"));
check('cinema mode remains enabled', files.finalPolish.includes("body.classList.add('demo-cinema-mode')"));
check('hero tactics remain enabled', files.finalPolish.includes("tactics.className = 'hero-tactics'"));
check('Tactical Journey remains enabled', files.finalPolish.includes("journey.className = 'tactical-journey'"));
check('mini diagrams remain enabled', files.finalPolish.includes("visual.className = 'feature-mini-visual'"));

const report = { generatedAt: new Date().toISOString(), checks, failures };
await fs.mkdir('phase12-validation-evidence', { recursive: true });
await fs.writeFile('phase12-validation-evidence/static-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ checks: checks.length, failures }, null, 2));
if (failures.length) process.exit(1);
