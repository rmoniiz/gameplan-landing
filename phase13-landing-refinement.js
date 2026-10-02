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

    #features .feature-mini-visual {
      height: 92px;
      margin: 2px 0 17px;
      border: 1px solid rgba(203, 216, 239, .12) !important;
      border-radius: 10px !important;
      background: rgba(5, 13, 30, .72) !important;
      box-shadow: none !important;
      color: rgba(196, 211, 237, .82) !important;
    }
    #features .feature-mini-visual::before {
      display: none !important;
    }
    #features .feature-mini-visual svg {
      overflow: hidden;
    }
    #features .feature-mini-visual .mini-surface {
      fill: rgba(10, 22, 43, .9);
      stroke: rgba(203, 216, 239, .12);
      stroke-width: .8;
    }
    #features .feature-mini-visual .mini-topbar {
      fill: rgba(255, 255, 255, .035);
    }
    #features .feature-mini-visual .mini-panel {
      fill: rgba(255, 255, 255, .025);
      stroke: rgba(203, 216, 239, .1);
      stroke-width: .7;
    }
    #features .feature-mini-visual .mini-grid,
    #features .feature-mini-visual .mini-line,
    #features .feature-mini-visual .mini-divider {
      fill: none;
      stroke: rgba(203, 216, 239, .2);
      stroke-width: .8;
      stroke-linecap: round;
    }
    #features .feature-mini-visual .mini-divider {
      stroke: rgba(203, 216, 239, .1);
    }
    #features .feature-mini-visual .mini-path {
      fill: none;
      stroke: currentColor;
      stroke-width: 1;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: none !important;
      opacity: .46;
      animation: none !important;
    }
    #features .feature-mini-visual .mini-node {
      fill: #09172c;
      stroke: currentColor;
      stroke-width: 1;
      filter: none !important;
      animation: none !important;
    }
    #features .feature-mini-visual .mini-fill {
      fill: currentColor;
      fill-opacity: .08;
      stroke: currentColor;
      stroke-opacity: .34;
      stroke-width: .8;
    }
    #features .feature-mini-visual .mini-bar,
    #features .feature-mini-visual .mini-bar.active {
      fill: rgba(203, 216, 239, .14);
      filter: none !important;
    }
    #features .feature-mini-visual .mini-bar.active {
      fill: currentColor;
      fill-opacity: .25;
    }
    #features .feature-mini-visual .mini-text {
      fill: rgba(222, 231, 247, .68);
      font-family: Lato, sans-serif;
      font-size: 5px;
      font-weight: 700;
      letter-spacing: .04em;
    }
    #features .feature-mini-visual .mini-caption {
      fill: rgba(176, 191, 216, .46);
      font-family: Lato, sans-serif;
      font-size: 4px;
      font-weight: 700;
      letter-spacing: .06em;
    }
    #features .feature-mini-visual .mini-value {
      fill: rgba(239, 244, 252, .8);
      font-family: "Josefin Sans", sans-serif;
      font-size: 6px;
      font-weight: 700;
    }
    #features .feature-card:hover .feature-mini-visual {
      border-color: rgba(203, 216, 239, .18) !important;
      box-shadow: none !important;
    }
    #features .feature-card:hover .feature-mini-visual .mini-path {
      opacity: .54;
      animation: none !important;
    }

    .gp-reveal {
      opacity: 0;
      transform: translateY(14px);
      transition: opacity 420ms cubic-bezier(.2,.8,.2,1), transform 420ms cubic-bezier(.2,.8,.2,1);
    }
    .gp-reveal.gp-visible { opacity: 1; transform: translateY(0); }
    img, video { transition: opacity 220ms ease; }
    img[loading="lazy"], video[preload="none"] { opacity: .985; }

    @media (prefers-reduced-motion: reduce) {
      .gp-reveal, .gp-reveal.gp-visible, img, video {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
      }
      #features .feature-mini-visual * {
        animation: none !important;
        transition: none !important;
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

  const renderProductModulePreviews = () => {
    const labels = isEnglish
      ? {
          model: 'GAME MODEL',
          attack: 'ATTACK',
          mid: 'MIDFIELD',
          defence: 'DEFENCE',
          week: 'WEEK',
          exercise: 'EXERCISE',
          player: 'PLAYER',
          decision: 'DECISION',
          match: 'MATCH',
          session: 'SESSION',
          observation: 'OBSERVATION',
          optionA: 'OPTION A',
          optionB: 'OPTION B',
        }
      : {
          model: 'MODELO DE JOGO',
          attack: 'ATAQUE',
          mid: 'MEIO',
          defence: 'DEFESA',
          week: 'SEMANA',
          exercise: 'EXERCÍCIO',
          player: 'ATLETA',
          decision: 'DECISÃO',
          match: 'PARTIDA',
          session: 'SESSÃO',
          observation: 'OBSERVAÇÃO',
          optionA: 'OPÇÃO A',
          optionB: 'OPÇÃO B',
        };

    const days = isEnglish ? ['M', 'T', 'W', 'T', 'F'] : ['S', 'T', 'Q', 'Q', 'S'];

    const previews = [
      `<svg data-visual="game-model-interface" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
        <rect class="mini-surface" x="17" y="11" width="186" height="72" rx="8"/>
        <rect class="mini-topbar" x="18" y="12" width="184" height="15" rx="7"/>
        <circle class="mini-bar active" cx="27" cy="19.5" r="2"/><circle class="mini-bar" cx="34" cy="19.5" r="2"/>
        <text class="mini-caption" x="43" y="21.5">${labels.model}</text>
        <line class="mini-divider" x1="18" y1="28" x2="202" y2="28"/>
        <text class="mini-caption" x="28" y="42">${labels.attack}</text>
        <text class="mini-caption" x="28" y="58">${labels.mid}</text>
        <text class="mini-caption" x="28" y="74">${labels.defence}</text>
        <line class="mini-divider" x1="67" y1="31" x2="67" y2="78"/>
        <path class="mini-line" d="M77 39h104M77 55h104M77 71h104"/>
        <circle class="mini-node" cx="91" cy="39" r="3"/><circle class="mini-node" cx="125" cy="39" r="3"/><circle class="mini-node" cx="164" cy="39" r="3"/>
        <circle class="mini-node" cx="104" cy="55" r="3"/><circle class="mini-node" cx="143" cy="55" r="3"/>
        <circle class="mini-node" cx="87" cy="71" r="3"/><circle class="mini-node" cx="118" cy="71" r="3"/><circle class="mini-node" cx="158" cy="71" r="3"/><circle class="mini-node" cx="181" cy="71" r="3"/>
      </svg>`,
      `<svg data-visual="planning-interface" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
        <rect class="mini-surface" x="15" y="11" width="190" height="72" rx="8"/>
        <rect class="mini-topbar" x="16" y="12" width="188" height="15" rx="7"/>
        <text class="mini-caption" x="26" y="21.5">${labels.week} 03</text>
        <rect class="mini-bar active" x="170" y="17" width="23" height="5" rx="2.5"/>
        <line class="mini-divider" x1="16" y1="28" x2="204" y2="28"/>
        ${days.map((day, index) => `<text class="mini-caption" x="${43 + index * 34}" y="38" text-anchor="middle">${day}</text>`).join('')}
        ${[60, 94, 128, 162].map((x) => `<line class="mini-divider" x1="${x}" y1="31" x2="${x}" y2="77"/>`).join('')}
        <rect class="mini-fill" x="30" y="45" width="26" height="11" rx="3"/>
        <rect class="mini-panel" x="64" y="57" width="26" height="14" rx="3"/>
        <rect class="mini-fill" x="98" y="43" width="26" height="20" rx="3"/>
        <rect class="mini-panel" x="132" y="50" width="26" height="12" rx="3"/>
        <rect class="mini-fill" x="166" y="40" width="26" height="26" rx="3"/>
      </svg>`,
      `<svg data-visual="exercise-interface" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
        <rect class="mini-surface" x="16" y="11" width="188" height="72" rx="8"/>
        <rect class="mini-topbar" x="17" y="12" width="186" height="15" rx="7"/>
        <text class="mini-caption" x="27" y="21.5">${labels.exercise}</text>
        <rect class="mini-bar active" x="173" y="17" width="19" height="5" rx="2.5"/>
        <line class="mini-divider" x1="17" y1="28" x2="203" y2="28"/>
        <rect class="mini-panel" x="26" y="35" width="111" height="39" rx="5"/>
        <line class="mini-divider" x1="81.5" y1="35" x2="81.5" y2="74"/>
        <circle class="mini-node" cx="49" cy="46" r="3"/><circle class="mini-node" cx="49" cy="63" r="3"/>
        <circle class="mini-node" cx="112" cy="46" r="3"/><circle class="mini-node" cx="112" cy="63" r="3"/>
        <circle class="mini-fill" cx="80" cy="55" r="2.4"/>
        <path class="mini-path" d="M53 46L75 53M53 63L75 57M85 55L108 46M85 55L108 63"/>
        <text class="mini-value" x="148" y="43">4v4+3</text>
        <text class="mini-caption" x="148" y="53">${labels.session}</text>
        <rect class="mini-bar active" x="148" y="60" width="39" height="4" rx="2"/>
        <rect class="mini-bar" x="148" y="68" width="29" height="3" rx="1.5"/>
      </svg>`,
      `<svg data-visual="player-interface" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
        <rect class="mini-surface" x="16" y="11" width="188" height="72" rx="8"/>
        <rect class="mini-topbar" x="17" y="12" width="186" height="15" rx="7"/>
        <text class="mini-caption" x="27" y="21.5">${labels.player}</text>
        <line class="mini-divider" x1="17" y1="28" x2="203" y2="28"/>
        <circle class="mini-panel" cx="48" cy="49" r="14"/>
        <text class="mini-value" x="48" y="52" text-anchor="middle">07</text>
        <rect class="mini-bar active" x="33" y="69" width="30" height="4" rx="2"/>
        <rect class="mini-bar" x="76" y="37" width="49" height="4" rx="2"/>
        <rect class="mini-bar" x="76" y="47" width="38" height="3" rx="1.5"/>
        <text class="mini-caption" x="76" y="62">${labels.observation}</text>
        <rect class="mini-panel" x="76" y="66" width="115" height="7" rx="2.5"/>
        <rect class="mini-bar active" x="79" y="68" width="62" height="3" rx="1.5"/>
      </svg>`,
      `<svg data-visual="tactical-test-interface" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
        <rect class="mini-surface" x="16" y="11" width="188" height="72" rx="8"/>
        <rect class="mini-topbar" x="17" y="12" width="186" height="15" rx="7"/>
        <text class="mini-caption" x="27" y="21.5">${labels.decision}</text>
        <line class="mini-divider" x1="17" y1="28" x2="203" y2="28"/>
        <rect class="mini-panel" x="26" y="36" width="99" height="37" rx="5"/>
        <line class="mini-divider" x1="75" y1="36" x2="75" y2="73"/>
        <circle class="mini-node" cx="49" cy="56" r="3.5"/>
        <circle class="mini-node" cx="101" cy="45" r="3.5"/><circle class="mini-node" cx="104" cy="65" r="3.5"/>
        <path class="mini-path" d="M54 55L94 46M54 57L97 64"/>
        <rect class="mini-panel" x="137" y="38" width="54" height="13" rx="3"/>
        <text class="mini-caption" x="144" y="46">${labels.optionA}</text>
        <rect class="mini-panel" x="137" y="57" width="54" height="13" rx="3"/>
        <text class="mini-caption" x="144" y="65">${labels.optionB}</text>
        <circle class="mini-fill" cx="183" cy="44.5" r="2.2"/>
      </svg>`,
      `<svg data-visual="match-analysis-interface" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
        <rect class="mini-surface" x="16" y="11" width="188" height="72" rx="8"/>
        <rect class="mini-topbar" x="17" y="12" width="186" height="15" rx="7"/>
        <text class="mini-caption" x="27" y="21.5">${labels.match}</text>
        <line class="mini-divider" x1="17" y1="28" x2="203" y2="28"/>
        <rect class="mini-panel" x="26" y="36" width="100" height="37" rx="5"/>
        <line class="mini-divider" x1="76" y1="36" x2="76" y2="73"/>
        <circle class="mini-grid" cx="76" cy="54.5" r="9"/>
        <circle class="mini-node" cx="49" cy="47" r="2.8"/><circle class="mini-node" cx="59" cy="64" r="2.8"/>
        <circle class="mini-node" cx="94" cy="46" r="2.8"/><circle class="mini-node" cx="108" cy="61" r="2.8"/>
        <circle class="mini-fill" cx="83" cy="42" r="2"/>
        <rect class="mini-bar active" x="140" y="39" width="45" height="4" rx="2"/>
        <rect class="mini-bar" x="140" y="49" width="34" height="3" rx="1.5"/>
        <rect class="mini-bar active" x="140" y="58" width="28" height="4" rx="2"/>
        <rect class="mini-bar" x="140" y="68" width="41" height="3" rx="1.5"/>
      </svg>`,
    ];

    [...document.querySelectorAll('#features .feature-mini-visual')].forEach((visual, index) => {
      if (previews[index]) visual.innerHTML = previews[index];
    });
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
          demoTitle: 'Take a look inside GamePlan',
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
          demoTitle: 'Veja por dentro do GamePlan',
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

    renderProductModulePreviews();
    enablePerformanceMotion();
  }).catch((error) => {
    console.error('[GamePlan] Phase 13 landing refinement failed to load.', error);
  });
})();