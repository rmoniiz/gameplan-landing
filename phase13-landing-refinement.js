(() => {
  'use strict';

  const isEnglish = document.documentElement.lang === 'en';
  const body = document.body;

  const copy = isEnglish
    ? {
        connection: {
          eyebrow: 'How it connects',
          title: 'From what you want to see to what actually showed up on the pitch',
          description: 'Capture the game idea, carry priorities into exercises and the week, follow your players, then return to the match with context. The thinking stays yours; GamePlan keeps the thread from getting lost.',
          cards: [
            ['Game model', 'Principles and behaviours that give your game idea a shape.'],
            ['Exercises', 'Your own tasks, plus GamePlan Library exercises when they fit.'],
            ['Planning', 'Weekly and monthly objectives and sessions connected to training.'],
            ['Players', 'Evaluations and observations kept in each player’s context.'],
            ['Match', 'Actions and evidence you can bring back to the plan.'],
          ],
        },
        features: [
          ['Game Model', 'Record principles, behaviours, positional roles and training references without forcing your idea into a ready-made methodology.'],
          ['Weekly and monthly planning', 'Build weeks and months around objectives, sessions and exercises connected to what you want to train.'],
          ['Exercise database', 'Create your own tasks and reuse GamePlan Library exercises when they fit your work.'],
          ['Individual development', 'Keep player evaluations and observations together and follow that history across the season.'],
          ['Tactical test', 'Use tactical situations to look at game reading, decision-making and understanding of the principles you work on.'],
          ['Match statistics', 'Record match actions and return to the plan to compare what was trained with what actually showed up on the pitch.'],
        ],
        pricing: {
          starter: 'For keeping exercises, planning and your squad together without spreading the routine across different tools.',
          pro: 'For connecting your game model, training, players and match review in one process.',
        },
        aboutTitle: 'GamePlan started because too much of a coach’s work was living in different places.',
      }
    : {
        connection: {
          eyebrow: 'Como tudo se conecta',
          title: 'Do que você quer ver ao que realmente apareceu em campo',
          description: 'Registre a ideia de jogo, leve prioridades para os exercícios e para a semana, acompanhe os atletas e volte à partida com contexto. O raciocínio continua sendo seu; o GamePlan ajuda a não perder o fio pelo caminho.',
          cards: [
            ['Modelo de jogo', 'Princípios e comportamentos que dão forma à sua ideia.'],
            ['Exercícios', 'Tarefas próprias e exercícios da Biblioteca GamePlan quando fizer sentido.'],
            ['Planejamento', 'Objetivos e sessões da semana e do mês ligados ao treino.'],
            ['Atletas', 'Avaliações e observações guardadas no contexto de cada atleta.'],
            ['Partida', 'Ações e evidências para voltar ao que foi planejado.'],
          ],
        },
        features: [
          ['Modelo de Jogo', 'Registre princípios, comportamentos, funções por posição e referências de treino sem encaixar sua ideia numa metodologia pronta.'],
          ['Plano semanal e mensal', 'Monte semanas e meses com objetivos, sessões e exercícios ligados ao que você quer treinar.'],
          ['Banco de exercícios', 'Crie suas próprias tarefas e reutilize exercícios da Biblioteca GamePlan quando fizer sentido.'],
          ['Desenvolvimento individual', 'Registre avaliações e observações dos atletas e acompanhe esse histórico ao longo da temporada.'],
          ['Teste tático', 'Use situações táticas para observar leitura de jogo, decisão e entendimento dos princípios trabalhados.'],
          ['Estatísticas da partida', 'Registre ações da partida e volte ao planejamento para comparar o que foi treinado com o que apareceu em campo.'],
        ],
        pricing: {
          starter: 'Para organizar exercícios, planejamento e elenco sem espalhar a rotina por várias ferramentas.',
          pro: 'Para conectar modelo de jogo, treino, atletas e partida no mesmo processo.',
        },
        aboutTitle: 'O GamePlan começou porque o trabalho do treinador estava espalhado demais.',
      };

  const connectionEyebrow = document.querySelector('#connection .eyebrow');
  const connectionTitle = document.querySelector('#connection .section-heading h2');
  const connectionDescription = document.querySelector('#connection .section-heading p');
  if (connectionEyebrow) connectionEyebrow.textContent = copy.connection.eyebrow;
  if (connectionTitle) connectionTitle.textContent = copy.connection.title;
  if (connectionDescription) connectionDescription.textContent = copy.connection.description;

  const connectionItems = [...document.querySelectorAll('#connection .connection-item')];
  connectionItems.forEach((item, index) => {
    const card = copy.connection.cards[index];
    if (!card) return;
    const heading = item.querySelector('strong');
    const description = item.querySelector('span');
    if (heading) heading.textContent = card[0];
    if (description) description.textContent = card[1];
  });

  const featureCards = [...document.querySelectorAll('.features-grid .feature-card')];
  featureCards.forEach((card, index) => {
    const item = copy.features[index];
    if (!item) return;
    const heading = card.querySelector('h3');
    const description = card.querySelector('p');
    if (heading) heading.textContent = item[0];
    if (description) description.textContent = item[1];
  });

  const priceCards = [...document.querySelectorAll('#pricing .price-card')];
  const starterDescription = priceCards[0]?.querySelector('p');
  const proDescription = priceCards[1]?.querySelector('p');
  if (starterDescription) starterDescription.textContent = copy.pricing.starter;
  if (proDescription) proDescription.textContent = copy.pricing.pro;

  const aboutTitle = document.querySelector('#about .about-copy h2');
  if (aboutTitle) aboutTitle.textContent = copy.aboutTitle;

  const journey = document.querySelector('.tactical-journey');
  journey?.remove();

  const heroRoutes = [...document.querySelectorAll('.hero-tactics .tactic-route')];
  const routeShapes = [
    'M270 388 L350 342 L420 260 L523 271 L636 338 L786 306 L862 258 L938 246',
    'M318 214 L405 186 L472 206 L527 248 L612 336 L720 390 L812 382 L900 340',
  ];
  heroRoutes.forEach((route, index) => {
    if (routeShapes[index]) route.setAttribute('d', routeShapes[index]);
  });

  const footballVisuals = [
    `<svg viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="10" y="10" width="200" height="74" rx="12"/><line class="mini-line" x1="110" y1="10" x2="110" y2="84"/><circle class="mini-grid" cx="110" cy="47" r="16"/><path class="mini-path" d="M42 61 L76 44 L110 47 L145 32 L181 42"/><circle class="mini-node" cx="42" cy="61" r="5"/><circle class="mini-node" cx="76" cy="44" r="5"/><circle class="mini-node" cx="110" cy="47" r="5"/><circle class="mini-node" cx="145" cy="32" r="5"/><circle class="mini-node" cx="181" cy="42" r="5"/></svg>`,
    `<svg viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="10" y="12" width="200" height="70" rx="12"/><path class="mini-line" d="M39 12v70M68 12v70M97 12v70M126 12v70M155 12v70M184 12v70"/><rect class="mini-fill" x="43" y="29" width="21" height="32" rx="5"/><circle class="mini-node" cx="53.5" cy="45" r="4"/><rect class="mini-fill" x="101" y="21" width="21" height="40" rx="5"/><circle class="mini-node" cx="111.5" cy="41" r="4"/><rect class="mini-fill" x="159" y="35" width="21" height="26" rx="5"/><circle class="mini-node" cx="169.5" cy="48" r="4"/></svg>`,
    `<svg viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="28" y="13" width="164" height="68" rx="10"/><path class="mini-line" d="M110 13v68M28 47h164"/><path class="mini-fill" d="M57 31 l5 10 h-10 z M160 57 l5 10 h-10 z M151 24 l5 10 h-10 z"/><path class="mini-path" d="M61 62 L92 55 L116 37 L155 42"/><circle class="mini-node" cx="61" cy="62" r="5"/><circle class="mini-node" cx="92" cy="55" r="5"/><circle class="mini-node" cx="116" cy="37" r="5"/><circle class="mini-node" cx="155" cy="42" r="5"/></svg>`,
    `<svg viewBox="0 0 220 94" focusable="false"><circle class="mini-fill" cx="110" cy="43" r="18"/><circle class="mini-node" cx="110" cy="35" r="7"/><path class="mini-line" d="M97 57c4-11 22-11 26 0"/><rect class="mini-grid" x="30" y="24" width="47" height="18" rx="7"/><rect class="mini-grid" x="143" y="24" width="47" height="18" rx="7"/><rect class="mini-grid" x="36" y="55" width="41" height="16" rx="7"/><rect class="mini-grid" x="143" y="55" width="41" height="16" rx="7"/><path class="mini-path" d="M77 33 L92 38 M143 33 L128 38 M77 63 L94 53 M143 63 L126 53"/></svg>`,
    `<svg viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="18" y="10" width="184" height="74" rx="12"/><path class="mini-line" d="M110 10v74M18 47h184"/><circle class="mini-fill" cx="72" cy="48" r="11"/><circle class="mini-node" cx="72" cy="48" r="4"/><circle class="mini-node" cx="128" cy="31" r="6"/><circle class="mini-node" cx="151" cy="62" r="6"/><path class="mini-path" d="M83 46 L116 33 L128 31 M83 51 L121 58 L151 62"/></svg>`,
    `<svg viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="18" y="9" width="184" height="76" rx="11"/><line class="mini-line" x1="110" y1="9" x2="110" y2="85"/><circle class="mini-grid" cx="110" cy="47" r="18"/><path class="mini-line" d="M18 27h28v40H18M202 27h-28v40h28"/><circle class="mini-node" cx="54" cy="32" r="5"/><circle class="mini-node" cx="86" cy="57" r="5"/><circle class="mini-node" cx="132" cy="42" r="5"/><circle class="mini-node" cx="168" cy="62" r="5"/><path class="mini-path" d="M54 32 L86 57 L110 47 L132 42 L168 62"/></svg>`,
  ];

  const miniVisuals = [...document.querySelectorAll('.feature-mini-visual')];
  miniVisuals.forEach((visual, index) => {
    if (footballVisuals[index]) visual.innerHTML = footballVisuals[index];
  });

  const demoVideo = document.querySelector('#demo video');
  if (demoVideo) {
    const applyInitialVolume = () => {
      if (demoVideo.dataset.phase13VolumeReady === 'true') return;
      try {
        demoVideo.volume = 0.18;
        demoVideo.dataset.phase13VolumeReady = 'true';
      } catch {
        // Some mobile browsers keep media volume under system control.
      }
    };
    if (demoVideo.readyState >= 1) applyInitialVolume();
    else demoVideo.addEventListener('loadedmetadata', applyInitialVolume, { once: true });
  }

  const ambience = [
    [document.querySelector('.hero'), '83,128,255'],
    [document.getElementById('connection'), '25,211,158'],
    [document.getElementById('features'), '83,128,255'],
    [document.getElementById('demo'), '154,99,255'],
    [document.getElementById('about'), '83,128,255'],
    [document.getElementById('timeline'), '154,99,255'],
    [document.getElementById('pricing'), '25,211,158'],
    [document.getElementById('lead-magnet'), '25,211,158'],
    [document.getElementById('feedback'), '83,128,255'],
  ].filter(([element]) => element);

  const syncAmbience = () => {
    const marker = window.scrollY + window.innerHeight * 0.46;
    let active = ambience[0];
    for (const item of ambience) {
      const top = window.scrollY + item[0].getBoundingClientRect().top;
      if (top <= marker) active = item;
      else break;
    }
    if (active) body.style.setProperty('--section-rgb', active[1]);
  };

  window.addEventListener('scroll', syncAmbience, { passive: true });
  window.addEventListener('resize', syncAmbience, { passive: true });
  syncAmbience();

  body.classList.add('phase13-landing-refinement');
})();
