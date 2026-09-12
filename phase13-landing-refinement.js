(() => {
  'use strict';

  const pitchOnlyGuard = document.createElement('style');
  pitchOnlyGuard.dataset.phase13PitchOnly = 'true';
  pitchOnlyGuard.textContent = `
    .hero-tactics .tactic-route,
    .hero-tactics .tactic-player,
    .hero-tactics svg g[aria-hidden="true"],
    .hero-tactics svg > circle:not(.tactic-pitch) {
      display: none !important;
    }
  `;
  document.head.appendChild(pitchOnlyGuard);

  import('./phase13-landing-refinement-base.js').then(() => {
    const heroTactics = document.querySelector('.hero-tactics svg');
    if (heroTactics) {
      heroTactics
        .querySelectorAll('defs, .tactic-route, g[aria-hidden="true"], circle:not(.tactic-pitch)')
        .forEach((node) => node.remove());
    }

    const demoTitle = document.querySelector('#demo .section-heading h2');
    if (demoTitle) {
      demoTitle.textContent = document.documentElement.lang === 'en'
        ? 'Take a look inside GamePlan'
        : 'Veja por dentro do GamePlan';
    }
  }).catch((error) => {
    console.error('[GamePlan] Phase 13 landing refinement failed to load.', error);
  });
})();
