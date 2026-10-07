import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

const pt = await fs.readFile('index.html', 'utf8');
const en = await fs.readFile('en.html', 'utf8');
const css = await fs.readFile('phase13-editorial-redesign.css', 'utf8');
const runtime = await fs.readFile('phase13-editorial-redesign.js', 'utf8');
const failures = [];
const checks = [];

const check = (name, condition) => {
  const passed = Boolean(condition);
  checks.push({ name, passed });
  if (!passed) failures.push(name);
};

const validatePage = ({ label, html, language, privacy, terms, heroLines, demoVideo, attendanceText }) => {
  const ids = ['process', 'product', 'demo', 'about', 'pricing', 'feedback'];
  const positions = Object.fromEntries(ids.map((id) => [id, html.indexOf(`id="${id}"`)]));

  check(`${label}: language`, html.includes(`<html lang="${language}">`));
  check(`${label}: editorial sections`, ids.every((id) => positions[id] >= 0));
  check(`${label}: story order`, positions.process < positions.product && positions.product < positions.demo && positions.demo < positions.about && positions.about < positions.pricing && positions.pricing < positions.feedback);
  check(`${label}: Phase 12 lead capture preserved`, html.includes('phase12-lead-capture.js'));
  check(`${label}: Phase 12 lead styles preserved`, html.includes('phase12-lead-capture.css'));
  check(`${label}: editorial stylesheet once`, (html.match(/phase13-editorial-redesign\.css/g) || []).length === 1);
  check(`${label}: editorial runtime once`, (html.match(/phase13-editorial-redesign\.js/g) || []).length === 1);
  check(`${label}: legacy landing runtimes removed`, !/landing-final-polish\.js|landing-latest-connection\.js|phase13-landing-refinement\.js/.test(html));
  check(`${label}: old SaaS feature grid removed`, !/features-grid|feature-card|connection-board|bg-blur|bg-grid/.test(html));
  check(`${label}: six flow steps`, (html.match(/data-flow-step=/g) || []).length === 6);
  check(`${label}: real product assets`, ['assets/images/exercise-146-pt-desktop.webp', 'assets/images/exercise-146-pt-mobile.webp', 'assets/images/exercise-146-pt-diagram.webp', 'assets/images/renan-founder-updated.png'].every((asset) => html.includes(asset) && existsSync(asset)));
  check(`${label}: obsolete match screenshot removed pending authenticated capture`, !html.includes('assets/images/estatistica-da-partida.png'));
  check(`${label}: branded video cover`, html.includes('poster="assets/images/gameplan-video-poster.svg"') && existsSync('assets/images/gameplan-video-poster.svg'));
  check(`${label}: original GamePlan logo preserved`, !html.includes('gameplan-mark-review.svg') && (html.match(/src="assets\/images\/gameplan-logo\.png"/g) || []).length === 3);
  check(`${label}: seven-day week with weekend match`, language === 'pt-BR' ? html.includes('<span>DOM</span><strong>JOGO</strong>') : html.includes('<span>SUN</span><strong>MATCH</strong>'));
  check(`${label}: concrete process example`, html.includes('class="process-example reveal"'));
  check(`${label}: correct demo video`, html.includes(demoVideo));
  check(`${label}: hero copy`, heroLines.every((line) => html.includes(line)));
  check(`${label}: attendance remains context`, html.includes(attendanceText));
  check(`${label}: coach remains decision maker`, language === 'pt-BR' ? html.includes('decida como usá-la no seu trabalho') && html.includes('decisão técnica continuam com o treinador') : html.includes('decide how to use it in your coaching') && html.includes('technical decisions stay with the coach'));
  check(`${label}: privacy link`, html.includes(`href="${privacy}"`));
  check(`${label}: terms link`, html.includes(`href="${terms}"`));
  check(`${label}: canonical preserved`, html.includes('<link rel="canonical" href="https://gameplan-landing.vercel.app/"'));
  check(`${label}: hreflang PT-BR preserved`, html.includes('hreflang="pt-BR"'));
  check(`${label}: hreflang EN preserved`, html.includes('hreflang="en"'));
  check(`${label}: Starter price preserved`, html.includes('€9.99'));
  check(`${label}: Pro price preserved`, html.includes('€19.99'));
  check(`${label}: 7-day trial preserved`, html.includes('signup?trial=7&lang='));
  check(`${label}: login preserved`, html.includes('/login?lang='));
  check(`${label}: social links preserved`, ['instagram.com/the.gameplan.app', 'facebook.com/profile.php', 'linkedin.com/company/146358073', 'x.com/gameplantheapp'].every((value) => html.includes(value)));

  const finalCtaStart = html.indexOf('id="feedback"');
  const finalCtaEnd = html.indexOf('</section>', finalCtaStart);
  const finalCta = finalCtaStart >= 0 && finalCtaEnd > finalCtaStart ? html.slice(finalCtaStart, finalCtaEnd) : '';
  check(`${label}: final CTA has one action`, (finalCta.match(/<a class="btn /g) || []).length === 1);
  check(`${label}: final CTA contains no login action`, !/\/login\?lang=/.test(finalCta));
};

validatePage({
  label: 'PT-BR',
  html: pt,
  language: 'pt-BR',
  privacy: 'privacy.html',
  terms: 'terms.html',
  heroLines: ['PREPARE O TREINO.', 'SAIBA O QUE OBSERVAR', 'EM CAMPO.'],
  demoVideo: 'assets/videos/gameplan-demo-ptbr.mp4',
  attendanceText: 'Nenhum desses registros, sozinho, prova desenvolvimento',
});

validatePage({
  label: 'EN',
  html: en,
  language: 'en',
  privacy: 'privacy-en.html',
  terms: 'terms-en.html',
  heroLines: ['PLAN TRAINING AROUND', 'WHAT YOU WANT TO', 'OBSERVE ON THE PITCH.'],
  demoVideo: 'assets/videos/gameplan-demo-en.mp4',
  attendanceText: 'None of those records, on its own, proves development',
});

check('CSS has reduced-motion handling', css.includes('@media(prefers-reduced-motion:reduce)'));
check('CSS has mobile layout', css.includes('@media(max-width:760px)'));
check('CSS uses editorial module list', css.includes('.module-list'));
check('CSS uses editorial week composition', css.includes('.week-editorial'));
check('CSS avoids gradients', !/linear-gradient|radial-gradient|conic-gradient/i.test(css));
check('CSS avoids decorative blur', !/filter\s*:\s*blur\s*\(/i.test(css));
check('CSS avoids backdrop filter', !/backdrop-filter/i.test(css));
check('runtime restores editorial stylesheet precedence', runtime.includes('document.head.appendChild(stylesheet)'));
check('runtime marks editorial mode ready', runtime.includes("document.body.classList.add('editorial-ready')"));
check('runtime observes six-step flow selectors', runtime.includes("document.querySelectorAll('[data-flow-step]')"));
check('runtime respects reduced motion', runtime.includes("prefers-reduced-motion: reduce"));

const forbiddenCopy = /\b(unlock|elevate|empower|seamless|revolutionize|next-generation|unleash your potential|where strategy meets performance)\b/i;
check('PT-BR avoids generic AI marketing copy', !forbiddenCopy.test(pt));
check('EN avoids generic AI marketing copy', !forbiddenCopy.test(en));

console.log(JSON.stringify({ checks: checks.length, failures }, null, 2));
if (failures.length) process.exit(1);
