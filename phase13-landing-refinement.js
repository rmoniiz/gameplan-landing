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
        about: {
          title: 'GamePlan grew out of a question that kept coming back.',
          paragraphs: [
            'My relationship with football began with my grandfather, Adão, an amateur coach. He taught me early to see the game through intelligence, cooperation and purpose. I started coaching in the United States in 2017, then worked across different clubs, countries and football cultures before arriving in the Netherlands.',
            'Along the way, I kept running into the same practical problem in my own work. Part of the thinking lived in the game model, part in planning, part in training notes and part in the match review. Returning to a decision often meant rebuilding the context around it.',
            'And one question kept coming back: did what we worked on during the week actually show up in the match? When it didn’t, where should that observation live so it could shape the following week?',
            'That need is where GamePlan started to take shape: one place to keep the game model, exercises, planning, players and match analysis connected. GamePlan gives the process structure; the methodology, the reading of the game and the technical decisions stay with the coach.',
          ],
        },
        heroDemo: 'Watch demo',
        previewLeadNote: 'In this review version, the checklist is unlocked without sending your details.',
        previewLeadSuccess: 'Checklist unlocked for review. No data was sent or recorded.',
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
        about: {
          title: 'O GamePlan nasceu de uma pergunta que continuava voltando.',
          paragraphs: [
            'Minha relação com o futebol começou com meu avô, Adão, treinador amador. Foi com ele que aprendi cedo a olhar o jogo como um problema de inteligência, cooperação e propósito. Em 2017, comecei minha trajetória como treinador nos Estados Unidos. Depois vieram outros clubes, países e culturas, até chegar à Holanda.',
            'Nesse caminho, uma fricção se repetia no meu próprio trabalho: uma parte do raciocínio ficava no modelo de jogo, outra no planejamento, outra nas anotações do treino e outra na revisão da partida. Quando eu precisava voltar a uma decisão, também precisava reconstruir o contexto.',
            'E uma pergunta continuava voltando: o que trabalhamos durante a semana apareceu de fato no jogo? Quando não aparecia, onde registrar essa observação para que ela chegasse à semana seguinte?',
            'Foi dessa necessidade que o GamePlan começou a tomar forma: um lugar para manter modelo de jogo, exercícios, planejamento, atletas e análise da partida conectados. A plataforma organiza o processo; a metodologia, a leitura do jogo e a decisão técnica continuam com o treinador.',
          ],
        },
        heroDemo: 'Ver demonstração',
        previewLeadNote: 'Nesta versão de revisão, o checklist é liberado sem enviar seus dados.',
        previewLeadSuccess: 'Checklist liberado para revisão. Nenhum dado foi enviado ou registrado.',
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

  const aboutCopy = document.querySelector('#about .about-copy');
  const aboutTitle = aboutCopy?.querySelector('h2');
  const aboutParagraphs = aboutCopy ? [...aboutCopy.querySelectorAll(':scope > p')] : [];
  if (aboutTitle) aboutTitle.textContent = copy.about.title;
  copy.about.paragraphs.forEach((paragraph, index) => {
    if (!aboutParagraphs[index]) return;
    aboutParagraphs[index].textContent = paragraph;
  });
  const aboutLast = aboutParagraphs[copy.about.paragraphs.length - 1];
  if (aboutLast) {
    const emphasis = isEnglish ? 'with the coach' : 'com o treinador';
    const [before, after = ''] = copy.about.paragraphs.at(-1).split(emphasis);
    aboutLast.textContent = before;
    const strong = document.createElement('strong');
    strong.textContent = emphasis;
    aboutLast.append(strong, document.createTextNode(after));
  }

  const heroActions = document.querySelector('.hero-actions');
  if (heroActions) {
    heroActions.querySelector('a[href*="signup?trial=7"]')?.remove();
    const demoAction = heroActions.querySelector('a[href="#demo"]');
    if (demoAction) {
      demoAction.textContent = copy.heroDemo;
      demoAction.classList.remove('btn-ghost');
      demoAction.classList.add('btn-primary');
    }
  }

  const journey = document.querySelector('.tactical-journey');
  journey?.remove();

  const heroTactics = document.querySelector('.hero-tactics svg');
  if (heroTactics) {
    heroTactics.innerHTML = `
      <defs>
        <linearGradient id="hero-route-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#19d39e" />
          <stop offset="0.55" stop-color="#5380ff" />
          <stop offset="1" stop-color="#9a63ff" />
        </linearGradient>
        <marker id="hero-tactic-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,4 L0,8 z" fill="#7fdcc5" opacity="0.9" />
        </marker>
      </defs>
      <rect class="tactic-pitch" x="126" y="72" width="928" height="470" rx="26" />
      <line class="tactic-pitch" x1="590" y1="72" x2="590" y2="542" />
      <circle class="tactic-pitch" cx="590" cy="307" r="74" />
      <path class="tactic-pitch" d="M126 190h106v234H126M1054 190H948v234h106" />
      <path class="tactic-route" data-route="left-progression" d="M270 388 L348 338 L430 286" marker-end="url(#hero-tactic-arrow)" />
      <path class="tactic-route" data-route="central-support" d="M515 392 L602 346 L682 312 L760 286" marker-end="url(#hero-tactic-arrow)" />
      <path class="tactic-route" data-route="wide-run" d="M742 410 L820 354 L900 316 L942 260" marker-end="url(#hero-tactic-arrow)" />
      <circle class="tactic-player" cx="270" cy="388" r="8" />
      <circle class="tactic-player blue" cx="318" cy="214" r="8" />
      <circle class="tactic-player" cx="430" cy="286" r="8" />
      <circle class="tactic-player blue" cx="515" cy="392" r="8" />
      <circle class="tactic-player" cx="590" cy="307" r="8" />
      <circle class="tactic-player blue" cx="682" cy="312" r="8" />
      <circle class="tactic-player" cx="742" cy="410" r="8" />
      <circle class="tactic-player blue" cx="760" cy="286" r="8" />
      <circle class="tactic-player" cx="900" cy="316" r="8" />
      <circle class="tactic-player blue" cx="942" cy="260" r="8" />
      <circle cx="608" cy="331" r="3.2" fill="#f5f7fb" opacity="0.9" />`;
  }

  const footballVisuals = [
    `<svg data-visual="game-model" viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="18" y="8" width="184" height="78" rx="10"/><line class="mini-line" x1="110" y1="8" x2="110" y2="86"/><circle class="mini-grid" cx="110" cy="47" r="15"/><path class="mini-line" d="M18 29h22v36H18M202 29h-22v36h22"/><circle class="mini-node" cx="48" cy="64" r="5"/><circle class="mini-node" cx="77" cy="49" r="5"/><circle class="mini-node" cx="108" cy="44" r="5"/><circle class="mini-node" cx="141" cy="36" r="5"/><circle class="mini-node" cx="174" cy="27" r="5"/><path class="mini-path" d="M48 64 L77 49 L108 44 L141 36 L174 27"/></svg>`,
    `<svg data-visual="microcycle" viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="18" y="13" width="184" height="68" rx="10"/><path class="mini-line" d="M18 30H202M44 30v51M70 30v51M96 30v51M122 30v51M148 30v51M174 30v51"/><circle class="mini-node" cx="32" cy="21" r="3.2"/><circle class="mini-node" cx="188" cy="21" r="3.2"/><rect class="mini-fill" x="48" y="40" width="18" height="12" rx="3"/><rect class="mini-fill" x="100" y="54" width="18" height="16" rx="3"/><rect class="mini-fill" x="126" y="37" width="18" height="19" rx="3"/><rect class="mini-fill" x="177" y="39" width="20" height="29" rx="4"/><path class="mini-line" d="M181 48h12M181 54h12M181 60h8"/></svg>`,
    `<svg data-visual="exercise" viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="26" y="12" width="168" height="70" rx="9"/><path class="mini-line" d="M110 12v70"/><path class="mini-fill" d="M48 28 l5 10 h-10 z M165 28 l5 10 h-10 z M48 61 l5 10 h-10 z M165 61 l5 10 h-10 z"/><circle class="mini-node" cx="73" cy="58" r="5"/><circle class="mini-node" cx="92" cy="36" r="5"/><circle class="mini-node" cx="131" cy="58" r="5"/><circle class="mini-node" cx="151" cy="39" r="5"/><circle cx="111" cy="48" r="3" fill="currentColor"/><path class="mini-path" d="M73 58 L92 36 L111 48 L131 58 L151 39"/></svg>`,
    `<svg data-visual="player-development" viewBox="0 0 220 94" focusable="false"><circle class="mini-fill" cx="68" cy="43" r="18"/><circle class="mini-node" cx="68" cy="35" r="7"/><path class="mini-line" d="M55 57c4-11 22-11 26 0"/><rect class="mini-grid" x="106" y="17" width="82" height="57" rx="9"/><circle class="mini-node" cx="119" cy="31" r="3.5"/><path class="mini-line" d="M130 31h43M119 44h54M119 56h38"/><path class="mini-path" d="M108 69 L130 63 L151 66 L178 54"/><circle class="mini-node" cx="178" cy="54" r="4"/></svg>`,
    `<svg data-visual="tactical-test" viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="24" y="10" width="172" height="74" rx="10"/><line class="mini-line" x1="110" y1="10" x2="110" y2="84"/><circle class="mini-node" cx="66" cy="49" r="7"/><circle class="mini-node" cx="130" cy="28" r="6"/><circle class="mini-node" cx="147" cy="64" r="6"/><circle cx="83" cy="49" r="3" fill="currentColor"/><path class="mini-path" d="M74 47 L108 34 L130 28 M74 52 L111 59 L147 64"/><path class="mini-line" d="M154 28h18M171 25l5 3-5 3"/></svg>`,
    `<svg data-visual="match-events" viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="18" y="8" width="184" height="78" rx="10"/><line class="mini-line" x1="110" y1="8" x2="110" y2="86"/><circle class="mini-grid" cx="110" cy="47" r="15"/><path class="mini-line" d="M18 27h25v40H18M202 27h-25v40h25"/><circle class="mini-node" cx="57" cy="62" r="4.5"/><circle class="mini-node" cx="87" cy="52" r="4.5"/><circle class="mini-node" cx="135" cy="39" r="4.5"/><circle class="mini-node" cx="166" cy="29" r="4.5"/><path class="mini-path" d="M57 62 L87 52 M135 39 L166 29 L186 37"/><circle cx="186" cy="37" r="3" fill="currentColor"/></svg>`,
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
        demoVideo.volume = 0.10;
        demoVideo.dataset.phase13VolumeReady = 'true';
      } catch {
        // Some mobile browsers keep media volume under system control.
      }
    };
    if (demoVideo.readyState >= 1) applyInitialVolume();
    else demoVideo.addEventListener('loadedmetadata', applyInitialVolume, { once: true });
  }

  const isPhase13Preview = /^gameplan-landing-git-phase-13-landing-[a-z0-9]+-rmoniizs-projects\.vercel\.app$/i.test(window.location.hostname);
  if (isPhase13Preview) {
    const leadForm = document.querySelector('#lead-magnet .lead-magnet-form');
    const leadSubmit = leadForm?.querySelector('.lead-submit');
    const leadStatus = document.querySelector('#leadFormStatus');
    const leadSuccess = document.querySelector('#lead-magnet .lead-success');
    const leadSuccessText = leadSuccess?.querySelector('p');

    if (leadForm && leadSubmit && leadStatus && leadSuccess) {
      leadForm.dataset.previewSimulation = 'true';
      leadSubmit.disabled = false;
      leadStatus.textContent = copy.previewLeadNote;
      leadStatus.dataset.state = 'info';
      if (leadSuccessText) leadSuccessText.textContent = copy.previewLeadSuccess;

      leadForm.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!leadForm.checkValidity()) {
          leadForm.reportValidity();
          return;
        }
        leadForm.hidden = true;
        leadSuccess.hidden = false;
        leadSuccess.focus({ preventScroll: true });
      }, true);
    }
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