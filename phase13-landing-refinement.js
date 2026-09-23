(() => {
  'use strict';

  const isEnglish = document.documentElement.lang === 'en';

  const refinementStyle = document.createElement('style');
  refinementStyle.dataset.phase13ProductWriting = 'true';
  refinementStyle.textContent = `
    .hero-tactics .tactic-route,
    .hero-tactics .tactic-player,
    .hero-tactics svg g[aria-hidden="true"],
    .hero-tactics svg > circle:not(.tactic-pitch) {
      display: none !important;
    }

    .bg-grid { opacity: .28 !important; }
    .bg-blur { opacity: .2 !important; filter: blur(90px) !important; }

    .connection-item,
    .connection-center,
    .feature-card,
    .demo-shell,
    .founder-card,
    .price-card,
    .cta-box {
      box-shadow: none !important;
      border-radius: 14px !important;
    }

    .connection-item,
    .feature-card,
    .demo-shell,
    .price-card,
    .cta-box {
      background: rgba(7, 17, 38, .72) !important;
      border-color: rgba(255, 255, 255, .12) !important;
    }

    .connection-center {
      background: rgba(7, 17, 38, .9) !important;
      border-color: rgba(255, 255, 255, .15) !important;
    }

    .feature-tag,
    .recommended-badge,
    .plan-label,
    .eyebrow,
    .hero-kicker {
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(refinementStyle);

  import('./phase13-landing-refinement-base.js').then(() => {
    const heroTactics = document.querySelector('.hero-tactics svg');
    if (heroTactics) {
      heroTactics
        .querySelectorAll('defs, .tactic-route, g[aria-hidden="true"], circle:not(.tactic-pitch)')
        .forEach((node) => node.remove());
    }

    const copy = isEnglish
      ? {
          hero: 'Plan the week, choose exercises and return to the match with the same principles and behaviours in view.',
          connectionTitle: 'Connect what you want to train with what you later observe in the match',
          connectionDescription: 'Record principles and behaviours, choose exercises, build the week and return to match observations using the same references.',
          connectionCenter: 'Coaching work',
          featuresTitle: 'What GamePlan records and connects',
          featuresDescription: 'Use each module on its own, or follow the same principle, exercise or observation across planning, training and match review.',
          demoTitle: 'See how a principle moves into the weekly plan',
          demoDescription: 'The demo follows the same references from the game model into exercises, planning and match review.',
          demoCardTitle: 'Follow one coaching decision across the app',
          demoCardText: 'Record a principle, choose an exercise, place it in the week and return to that reference in the match review.',
          aboutLast: 'GamePlan keeps the game model, exercises, planning, players and match analysis in one environment. The coach chooses the methodology, interprets the evidence and decides what to do next.',
        }
      : {
          hero: 'Planeje a semana, escolha os exercícios e volte à partida mantendo os mesmos princípios e comportamentos como referência.',
          connectionTitle: 'Conecte o que você quer treinar ao que depois observa na partida',
          connectionDescription: 'Registre princípios e comportamentos, escolha exercícios, monte a semana e volte às observações da partida usando as mesmas referências.',
          connectionCenter: 'Trabalho do treinador',
          featuresTitle: 'O que o GamePlan registra e conecta',
          featuresDescription: 'Use cada módulo separadamente ou acompanhe o mesmo princípio, exercício ou observação entre planejamento, treino e revisão da partida.',
          demoTitle: 'Veja como um princípio entra no plano semanal',
          demoDescription: 'A demonstração acompanha as mesmas referências do modelo de jogo até os exercícios, o planejamento e a revisão da partida.',
          demoCardTitle: 'Acompanhe uma decisão de treino dentro do app',
          demoCardText: 'Registre um princípio, escolha um exercício, coloque-o na semana e volte à mesma referência na revisão da partida.',
          aboutLast: 'O GamePlan reúne modelo de jogo, exercícios, planejamento, atletas e análise da partida no mesmo ambiente. O treinador escolhe a metodologia, interpreta as evidências e decide o próximo passo.',
        };

    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) heroDescription.textContent = copy.hero;

    const connectionTitle = document.querySelector('#connection .section-heading h2');
    const connectionDescription = document.querySelector('#connection .section-heading p');
    const connectionCenter = document.querySelector('#connection .connection-center span');
    if (connectionTitle) connectionTitle.textContent = copy.connectionTitle;
    if (connectionDescription) connectionDescription.textContent = copy.connectionDescription;
    if (connectionCenter) connectionCenter.textContent = copy.connectionCenter;

    const featuresTitle = document.querySelector('#features .section-heading h2');
    const featuresDescription = document.querySelector('#features .section-heading p');
    if (featuresTitle) featuresTitle.textContent = copy.featuresTitle;
    if (featuresDescription) featuresDescription.textContent = copy.featuresDescription;

    const demoTitle = document.querySelector('#demo .section-heading h2');
    const demoDescription = document.querySelector('#demo .section-heading p');
    const demoCardTitle = document.querySelector('#demo .demo-copy h3');
    const demoCardText = document.querySelector('#demo .demo-copy p');
    if (demoTitle) demoTitle.textContent = copy.demoTitle;
    if (demoDescription) demoDescription.textContent = copy.demoDescription;
    if (demoCardTitle) demoCardTitle.textContent = copy.demoCardTitle;
    if (demoCardText) demoCardText.textContent = copy.demoCardText;

    const aboutParagraphs = document.querySelectorAll('#about .about-copy > p');
    const aboutLast = aboutParagraphs[aboutParagraphs.length - 1];
    if (aboutLast) aboutLast.textContent = copy.aboutLast;
  }).catch((error) => {
    console.error('[GamePlan] Phase 13 landing refinement failed to load.', error);
  });
})();
