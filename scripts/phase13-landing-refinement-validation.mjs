import fs from 'node:fs/promises';

const pt = await fs.readFile('index.html', 'utf8');
const en = await fs.readFile('en.html', 'utf8');
const runtime = await fs.readFile('phase13-landing-refinement.js', 'utf8');
const baseRuntime = await fs.readFile('phase13-landing-refinement-base.js', 'utf8');
const combinedRuntime = `${baseRuntime}\n${runtime}`;
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

check('runtime keeps prior Phase 13 refinement as immutable base', runtime.includes("import('./phase13-landing-refinement-base.js')"));
check('runtime removes hero tactical routes and player markers after base loads', runtime.includes(".querySelectorAll('defs, .tactic-route, g[aria-hidden=\"true\"], circle:not(.tactic-pitch)')"));
check('runtime hides hero route/player overlays before base loads', runtime.includes('.hero-tactics .tactic-route') && runtime.includes('.hero-tactics .tactic-player'));
check('runtime preserves pitch markings', baseRuntime.includes('class="tactic-pitch"') && !runtime.includes("querySelectorAll('.tactic-pitch')"));
check('runtime uses approved PT-BR demo title', runtime.includes('Veja por dentro do GamePlan'));
check('runtime uses natural EN demo title', runtime.includes('Take a look inside GamePlan'));
check('runtime removes duplicate tactical journey', baseRuntime.includes("document.querySelector('.tactical-journey')") && baseRuntime.includes('?.remove()'));
check('runtime provides six football-specific module visuals', (baseRuntime.match(/data-visual=/g) || []).length === 6);
check('runtime gives game model a collective structure visual', baseRuntime.includes('data-visual="game-model-structure"') && baseRuntime.includes("'ATAQUE'") && baseRuntime.includes("'DEFESA'"));
check('runtime gives planning a weekly agenda visual', baseRuntime.includes('data-visual="weekly-plan"') && baseRuntime.includes("'SEG'") && baseRuntime.includes("'DOM'"));
check('runtime gives exercise card a training-task visual', baseRuntime.includes('data-visual="exercise-task"'));
check('runtime gives development a player-context visual', baseRuntime.includes('data-visual="player-development"'));
check('runtime gives tactical test a decision visual', baseRuntime.includes('data-visual="tactical-decision"'));
check('runtime gives match statistics a pitch-events visual', baseRuntime.includes('data-visual="match-events"'));
check('runtime lowers initial demo volume to 8 percent', baseRuntime.includes('demoVideo.volume = 0.08'));
check('runtime keeps video controls untouched', !combinedRuntime.includes("removeAttribute('controls')") && !combinedRuntime.includes('controls = false'));
check('runtime uses approved PT-BR About title', baseRuntime.includes('O GamePlan nasceu de uma necessidade.'));
check('runtime uses independent EN About title', baseRuntime.includes('GamePlan started with a need.'));
check('runtime removes disliked friction wording', !combinedRuntime.includes('fricção'));
check('runtime preserves personal football origin', baseRuntime.includes('Minha relação com o futebol começou com meu avô') && baseRuntime.includes('My relationship with football began with my grandfather'));
check('runtime preserves coach decision principle', baseRuntime.includes('decisão técnica continuam com o treinador') && baseRuntime.includes('technical decisions stay with the coach'));
check('runtime uses approved final CTA PT-BR', baseRuntime.includes('Leve sua semana para dentro do GamePlan.'));
check('runtime uses natural final CTA EN', baseRuntime.includes('Bring your week into GamePlan.'));
check('runtime removes trial CTA from hero while preserving demo CTA', baseRuntime.includes("heroActions.querySelector('a[href*=\"signup?trial=7\"]')?.remove()") && baseRuntime.includes("a[href=\"#demo\"]"));
check('runtime keeps Phase 13 Preview lead magnet useful without sending data', baseRuntime.includes("dataset.previewSimulation = 'true'") && baseRuntime.includes('Nenhum dado foi enviado ou registrado'));
check('runtime limits lead-magnet preview simulation to Phase 13 Vercel preview host', baseRuntime.includes('isPhase13Preview') && baseRuntime.includes('rmoniizs-projects\\.vercel\\.app'));

console.log(JSON.stringify({ checks: checks.length, failures }, null, 2));
if (failures.length) process.exit(1);
