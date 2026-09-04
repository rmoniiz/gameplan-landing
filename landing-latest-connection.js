(() => {
  'use strict';

  const connectionStylesheet = document.querySelector('link[href="landing-latest-connection.css"]');
  if (connectionStylesheet) {
    document.head.appendChild(connectionStylesheet);
  } else {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'landing-latest-connection.css';
    document.head.appendChild(stylesheet);
  }

  if (!document.querySelector('link[href="phase12-lead-capture.css"]')) {
    const leadStylesheet = document.createElement('link');
    leadStylesheet.rel = 'stylesheet';
    leadStylesheet.href = 'phase12-lead-capture.css';
    document.head.appendChild(leadStylesheet);
  }
  if (!document.querySelector('script[src="phase12-lead-capture.js"]')) {
    const leadScript = document.createElement('script');
    leadScript.src = 'phase12-lead-capture.js';
    leadScript.defer = true;
    document.body.appendChild(leadScript);
  }

  const isEnglish = document.documentElement.lang === 'en';
  const copy = isEnglish
    ? {
        eyebrow: 'From the model to the pitch',
        title: 'One connected path for the coach’s decisions',
        description: 'GamePlan links the coaching process without imposing one methodology: define the game idea, turn priorities into exercises, organize the plan, follow players and review what appeared in the match.',
        boardLabel: 'GamePlan connected coaching process: game model, exercises, planning, players, match and reflection',
        centerAlt: 'GamePlan logo',
        centerLabel: 'Connected process',
        timelineLabel: 'GamePlan founder journey. Scroll horizontally to view all entries.',
        ogTitle: 'GamePlan | From the model to the pitch',
        ogDescription: 'Plan, train and analyze in one place. Connect your game model, exercises, planning, players and match review without losing the reasoning behind each decision.',
        cards: {
          a: ['01', 'Game model', 'Record your idea, principles and observable behaviours.'],
          b: ['02', 'Exercises', 'Turn priorities into your own tasks or ready-made exercises.'],
          c: ['03', 'Planning', 'Distribute objectives and sessions across the week and month.'],
          d: ['04', 'Players', 'Organize the squad and follow development evidence.'],
          e: ['05', 'Match', 'Compare what was planned with what appeared on the pitch.'],
        },
      }
    : {
        eyebrow: 'Do modelo ao campo',
        title: 'Um caminho conectado para as decisões do treinador',
        description: 'O GamePlan conecta o processo sem impor uma metodologia: defina a ideia de jogo, transforme prioridades em exercícios, organize o planejamento, acompanhe os atletas e revise o que apareceu na partida.',
        boardLabel: 'Processo conectado do GamePlan: modelo de jogo, exercícios, planejamento, atletas, partida e reflexão',
        centerAlt: 'Logo do GamePlan',
        centerLabel: 'Processo conectado',
        timelineLabel: 'Trajetória do fundador do GamePlan. Role horizontalmente para ver todas as etapas.',
        ogTitle: 'GamePlan | Do modelo ao campo',
        ogDescription: 'Planeje, treine e analise em um único lugar. Conecte modelo de jogo, exercícios, planejamento, atletas e partida sem perder a origem das decisões.',
        cards: {
          a: ['01', 'Modelo de jogo', 'Registre sua ideia, princípios e comportamentos observáveis.'],
          b: ['02', 'Exercícios', 'Transforme prioridades em tarefas próprias ou exercícios prontos.'],
          c: ['03', 'Planejamento', 'Distribua objetivos e sessões na semana e no mês.'],
          d: ['04', 'Atletas', 'Organize o elenco e acompanhe evidências de desenvolvimento.'],
          e: ['05', 'Partida', 'Compare o que foi planejado com o que apareceu em campo.'],
        },
      };

  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogTitle) ogTitle.setAttribute('content', copy.ogTitle);
  if (ogDescription) ogDescription.setAttribute('content', copy.ogDescription);

  const timeline = document.querySelector('.timeline');
  if (timeline) {
    timeline.tabIndex = 0;
    timeline.setAttribute('role', 'region');
    timeline.setAttribute('aria-label', copy.timelineLabel);
  }

  const pricingCopy = isEnglish
    ? {
        starterDescription: 'For organizing training, planning and your squad in one place.',
        starterItems: ['Weekly planning', 'Monthly planning', 'Your own exercises', 'Player registration', 'Attendance'],
        proDescription: 'For connecting your game idea to training, players and what happens in the match.',
        proItems: ['Everything in Starter', 'Game Model & Methodology', 'GamePlan Library', 'Player Development', 'Tactical Test', 'Match Statistics', 'Virtual Assistant Coach'],
      }
    : {
        starterDescription: 'Para organizar treinos, planejamento e elenco em um só lugar.',
        starterItems: ['Planejamento semanal', 'Planejamento mensal', 'Exercícios próprios', 'Cadastro de atletas', 'Assiduidade'],
        proDescription: 'Para conectar sua ideia de jogo ao treino, aos atletas e ao que acontece na partida.',
        proItems: ['Tudo do Starter', 'Modelo de Jogo & Metodologia', 'Biblioteca GamePlan', 'Desenvolvimento de atletas', 'Teste tático', 'Estatísticas da partida', 'Assistente Técnico Virtual'],
      };

  const priceCards = document.querySelectorAll('#pricing .price-card');
  const starterCard = priceCards[0];
  const proCard = priceCards[1];
  const applyPlanCopy = (card, description, items) => {
    if (!card) return;
    const paragraph = card.querySelector('p');
    const list = card.querySelector('ul');
    if (paragraph) paragraph.textContent = description;
    if (list) list.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
  };
  applyPlanCopy(starterCard, pricingCopy.starterDescription, pricingCopy.starterItems);
  applyPlanCopy(proCard, pricingCopy.proDescription, pricingCopy.proItems);

  const board = document.querySelector('.connection-board');
  const eyebrow = document.querySelector('#connection .eyebrow');
  const title = document.querySelector('#connection .section-heading h2');
  const description = document.querySelector('#connection .section-heading p');
  const center = document.querySelector('.connection-center');
  const links = document.querySelector('.connection-links');

  if (!board || !center || !links) return;

  board.setAttribute('aria-label', copy.boardLabel);
  if (eyebrow) eyebrow.textContent = copy.eyebrow;
  if (title) title.textContent = copy.title;
  if (description) description.textContent = copy.description;

  center.innerHTML = `<span>${copy.centerLabel}</span><img class="connection-logo" src="assets/images/gameplan-logo.png" alt="${copy.centerAlt}" width="72" height="72" /><strong>GamePlan</strong>`;
  links.innerHTML = `
    <defs><marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z"></path></marker></defs>
    <path class="flow-main" d="M16 35 H24" marker-end="url(#flow-arrow)"></path>
    <path class="flow-main" d="M36 35 H44" marker-end="url(#flow-arrow)"></path>
    <path class="flow-main" d="M56 35 H64" marker-end="url(#flow-arrow)"></path>
    <path class="flow-main" d="M76 35 H84" marker-end="url(#flow-arrow)"></path>
    <path class="flow-hub" d="M50 47 V66" marker-end="url(#flow-arrow)"></path>
    <path class="flow-feedback" d="M89 47 C86 72 70 78 59 78" marker-end="url(#flow-arrow)"></path>
    <path class="flow-feedback" d="M41 78 C27 78 15 68 11 48" marker-end="url(#flow-arrow)"></path>`;

  Object.entries(copy.cards).forEach(([key, [number, heading, text]]) => {
    const item = document.querySelector(`.item-${key}`);
    if (item) item.innerHTML = `<small>${number}</small><strong>${heading}</strong><span>${text}</span>`;
  });
})();