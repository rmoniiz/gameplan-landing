import fs from 'node:fs/promises';

const pt = await fs.readFile('index.html', 'utf8');
const en = await fs.readFile('en.html', 'utf8');
const runtime = await fs.readFile('phase13-landing-refinement.js', 'utf8');
const failures = [];
const checks = [];

const check = (name, condition) => {
  const passed = Boolean(condition);
  checks.push({ name, passed });
  if (!passed) failures.push(name);
};

const validatePage = (label, html, language, aboutLabel, pricingLabel) => {
  const ids = ['connection', 'features', 'demo', 'about', 'timeline', 'pricing', 'feedback'];
  const position = Object.fromEntries(ids.map((id) => [id, html.indexOf(`id="${id}"`)]));
  check(`${label}: language`, html.includes(`<html lang="${language}">`));
  check(`${label}: all required sections`, ids.every((id) => position[id] >= 0));
  check(`${label}: About before Pricing`, position.about < position.pricing);
  check(`${label}: Timeline remains between About and Pricing`, position.about < position.timeline && position.timeline < position.pricing);
  check(`${label}: Pricing before final trial CTA`, position.pricing < position.feedback);
  check(`${label}: nav About before Pricing`, html.indexOf(`>${aboutLabel}</a>`) < html.indexOf(`>${pricingLabel}</a>`));
  check(`${label}: Phase 12 lead capture preserved`, html.includes('phase12-lead-capture.js'));
  check(`${label}: Phase 13 runtime loaded after final polish`, html.indexOf('landing-final-polish.js') < html.indexOf('phase13-landing-refinement.js'));
  check(`${label}: canonical preserved`, /<link rel="canonical" href="https:\/\/gameplan-landing\.vercel\.app\//.test(html));
  check(`${label}: hreflang PT-BR preserved`, html.includes('hreflang="pt-BR"'));
  check(`${label}: hreflang EN preserved`, html.includes('hreflang="en"'));
  check(`${label}: Starter price preserved`, html.includes('€9.99'));
  check(`${label}: Pro price preserved`, html.includes('€19.99'));
  check(`${label}: 7-day trial preserved`, html.includes('signup?trial=7&lang='));

  const finalCtaStart = html.indexOf('id="feedback"');
  const finalCta = finalCtaStart >= 0 ? html.slice(finalCtaStart, html.indexOf('</section>', finalCtaStart) + 10) : '';
  check(`${label}: final CTA has one action`, (finalCta.match(/<a class="btn /g) || []).length === 1);
  check(`${label}: final CTA contains no login action`, !/\/login\?lang=/.test(finalCta));
};

validatePage('PT-BR', pt, 'pt-BR', 'Sobre', 'Planos');
validatePage('EN', en, 'en', 'About', 'Pricing');

check('runtime removes duplicate tactical journey', runtime.includes("document.querySelector('.tactical-journey')") && runtime.includes('journey?.remove()'));
check('runtime replaces hero with three coach-like straight tactical routes', (runtime.match(/data-route=/g) || []).length === 3 && runtime.includes('hero-tactic-arrow'));
check('runtime avoids Bezier curves in hero replacement route definitions', !/data-route=[\s\S]{0,120}\bd="[^"]*\bC\b/.test(runtime));
check('runtime provides six football-specific module visuals', (runtime.match(/data-visual=/g) || []).length === 6);
check('runtime gives planning a microcycle/calendar visual', runtime.includes('data-visual="microcycle"'));
check('runtime gives exercise card a training-area visual', runtime.includes('data-visual="exercise"'));
check('runtime gives tactical test a game-situation visual', runtime.includes('data-visual="tactical-test"'));
check('runtime gives match statistics a pitch-events visual', runtime.includes('data-visual="match-events"'));
check('runtime lowers initial demo volume to 10 percent', runtime.includes('demoVideo.volume = 0.10'));
check('runtime keeps video controls untouched', !runtime.includes("removeAttribute('controls')") && !runtime.includes('controls = false'));
check('runtime preserves coach decision principle in copy', runtime.includes('a decisão técnica continuam com o treinador') && runtime.includes('technical decisions stay with the coach'));
check('runtime rewrites About from personal football origin into product need', runtime.includes('Minha relação com o futebol começou com meu avô') && runtime.includes('My relationship with football began with my grandfather'));
check('runtime removes trial CTA from hero while preserving demo CTA', runtime.includes("heroActions.querySelector('a[href*=\"signup?trial=7\"]')?.remove()") && runtime.includes("a[href=\"#demo\"]"));
check('runtime keeps Phase 13 Preview lead magnet useful without sending data', runtime.includes("dataset.previewSimulation = 'true'") && runtime.includes('Nenhum dado foi enviado ou registrado'));
check('runtime limits lead-magnet preview simulation to Phase 13 Vercel preview host', runtime.includes('isPhase13Preview') && runtime.includes('rmoniizs-projects\\.vercel\\.app'));

console.log(JSON.stringify({ checks: checks.length, failures }, null, 2));
if (failures.length) process.exit(1);