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

    /* Motion is used to explain entry/continuity, not as decoration. */
    .gp-reveal {
      opacity: 0;
      transform: translateY(14px);
      transition: opacity 420ms cubic-bezier(.2,.8,.2,1), transform 420ms cubic-bezier(.2,.8,.2,1);
    }
    .gp-reveal.gp-visible { opacity: 1; transform: translateY(0); }
    main > section:not(:first-child), footer { content-visibility: auto; contain-intrinsic-size: 800px; }
    img, video { transition: opacity 220ms ease; }
    img[loading="lazy"], video[preload="none"] { opacity: .985; }

    @media (prefers-reduced-motion: reduce) {
      .gp-reveal, .gp-reveal.gp-visible, img, video {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
      }
      html { scroll-behavior: auto !important; }
    }
  `;
  document.head.appendChild(refinementStyle);

  const enablePerformanceMotion = () => {
    document.querySelectorAll('img').forEach((image, index) => {
      if (index > 0 && !image.hasAttribute('loading')) image.setAttribute('loading', 'lazy');
      image.setAttribute('decoding', 'async');
    });
    document.querySelectorAll('video').forEach((video) => {
      if (!video.hasAttribute('preload')) video.setAttribute('preload', 'metadata');
    });

    const targets = [...document.querySelectorAll('main > section, .feature-card, .connection-item, .demo-shell, .price-card, .cta-box')];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      targets.forEach((node) => node.classList.add('gp-visible'));
      return;
    }
    targets.forEach((node) => node.classList.add('gp-reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('gp-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '80px 0px', threshold: 0.08 });
    targets.forEach((node) => observer.observe(node));
  };

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
          aboutTitle: 'Why I built GamePlan',
          aboutParagraphs: [
            'My relationship with football began with my grandfather, Adão, an amateur coach. I started coaching in the United States in 2017 and later worked in different clubs and football environments before moving to the Netherlands.',
            'In practice, I was using different places for the game model, weekly planning, training notes and match review. When I wanted to check why a session had been planned in a certain way, the context was often spread across those records.',
            'The question I wanted to answer was simple: what did we train, what appeared in the match and what should I review before planning the next week?',
            'GamePlan keeps the game model, exercises, planning, players and match analysis in one environment. The coach chooses the methodology, interprets the evidence and decides what to do next.',
          ],
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
          aboutTitle: 'Por que eu criei o GamePlan',
          aboutParagraphs: [
            'Minha relação com o futebol começou com meu avô, Adão, treinador amador. Em 2017 comecei a trabalhar como treinador nos Estados Unidos e, depois, passei por diferentes clubes e contextos de futebol até me mudar para a Holanda.',
            'Na prática, eu usava lugares diferentes para o modelo de jogo, o planejamento semanal, as anotações de treino e a revisão da partida. Quando queria verificar por que uma sessão tinha sido planejada de determinada forma, o contexto muitas vezes estava espalhado entre esses registros.',
            'A pergunta que eu queria responder era simples: o que treinamos, o que apareceu na partida e o que preciso revisar antes de planejar a próxima semana?',
            'O GamePlan reúne modelo de jogo, exercícios, planejamento, atletas e análise da partida no mesmo ambiente. O treinador escolhe a metodologia, interpreta as evidências e decide o próximo passo.',
          ],
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

    const aboutCopy = document.querySelector('#about .about-copy');
    const aboutTitle = aboutCopy?.querySelector('h2');
    const aboutParagraphs = [...(aboutCopy?.querySelectorAll(':scope > p') || [])];
    if (aboutTitle) aboutTitle.textContent = copy.aboutTitle;
    copy.aboutParagraphs.forEach((text, index) => {
      if (aboutParagraphs[index]) aboutParagraphs[index].textContent = text;
    });

    enablePerformanceMotion();
  }).catch((error) => {
    console.error('[GamePlan] Phase 13 landing refinement failed to load.', error);
  });
})();
