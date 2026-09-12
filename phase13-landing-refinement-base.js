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
          title: 'GamePlan started with a need.',
          paragraphs: [
            'My relationship with football began with my grandfather, Adão, an amateur coach. He taught me early to look at the game through intelligence, cooperation and purpose. I started coaching in the United States in 2017 and later worked across different clubs, countries and football cultures before arriving in the Netherlands.',
            'Across those environments, the same practical problem kept showing up in my own work. Part of the thinking lived in the game model, part in planning, part in training notes and part in the match review. Coming back to a decision often meant rebuilding the context around it.',
            'One question kept returning: did what we worked on during the week actually show up in the match? When it did not, where should that observation live so it could shape the following week?',
            'That need is where GamePlan started to take shape: one place to keep the game model, exercises, planning, players and match analysis connected. The platform gives the process structure, but the methodology, the reading of the game and the technical decisions stay with the coach.',
          ],
        },
        finalCta: 'Bring your week into GamePlan.',
        heroDemo: 'Watch demo',
        previewLeadNote: 'In this review version, the checklist is unlocked without sending your details.',
        previewLeadSuccess: 'Checklist unlocked for review. No data was sent or recorded.',
        days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
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
          title: 'O GamePlan nasceu de uma necessidade.',
          paragraphs: [
            'Minha relação com o futebol começou com meu avô, Adão, treinador amador. Foi com ele que aprendi cedo a olhar o jogo como um problema de inteligência, cooperação e propósito. Em 2017, comecei minha trajetória como treinador nos Estados Unidos e, depois, passei por clubes, países e culturas diferentes até chegar à Holanda.',
            'Ao longo desse caminho, eu encontrava no meu próprio trabalho o mesmo problema: uma parte do raciocínio ficava no modelo de jogo, outra no planejamento, outra nas anotações do treino e outra na revisão da partida. Quando eu precisava voltar a uma decisão, muitas vezes precisava reconstruir o contexto.',
            'Uma pergunta voltava sempre: o que trabalhamos durante a semana apareceu de fato no jogo? Quando não aparecia, onde registrar essa observação para levar para a semana seguinte?',
            'Foi dessa necessidade que o GamePlan começou a tomar forma: um lugar para manter modelo de jogo, exercícios, planejamento, atletas e análise da partida conectados. A plataforma dá estrutura ao processo, mas a metodologia, a leitura do jogo e a decisão técnica continuam com o treinador.',
          ],
        },
        finalCta: 'Leve sua semana para dentro do GamePlan.',
        heroDemo: 'Ver demonstração',
        previewLeadNote: 'Nesta versão de revisão, o checklist é liberado sem enviar seus dados.',
        previewLeadSuccess: 'Checklist liberado para revisão. Nenhum dado foi enviado ou registrado.',
        days: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'],
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
  if (aboutCopy) {
    const title = aboutCopy.querySelector('h2');
    const paragraphs = [...aboutCopy.querySelectorAll(':scope > p')];
    if (title) title.textContent = copy.about.title;
    copy.about.paragraphs.forEach((text, index) => {
      if (!paragraphs[index]) return;
      paragraphs[index].textContent = text;
    });
    const last = paragraphs[copy.about.paragraphs.length - 1];
    if (last) {
      const emphasis = isEnglish ? 'stay with the coach' : 'continuam com o treinador';
      const fullText = copy.about.paragraphs.at(-1);
      const splitAt = fullText.lastIndexOf(emphasis);
      if (splitAt >= 0) {
        last.textContent = fullText.slice(0, splitAt);
        const strong = document.createElement('strong');
        strong.textContent = emphasis;
        last.append(strong, document.createTextNode(fullText.slice(splitAt + emphasis.length)));
      }
    }
  }

  const finalCta = document.querySelector('#feedback .cta-copy h2');
  if (finalCta) finalCta.textContent = copy.finalCta;

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

  document.querySelector('.tactical-journey')?.remove();

  const heroTactics = document.querySelector('.hero-tactics svg');
  if (heroTactics) {
    heroTactics.setAttribute('viewBox', '0 0 1180 620');
    heroTactics.innerHTML = `
      <defs>
        <linearGradient id="hero-route-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#19d39e" />
          <stop offset="0.55" stop-color="#5380ff" />
          <stop offset="1" stop-color="#9a63ff" />
        </linearGradient>
        <marker id="hero-tactic-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,4 L0,8 z" fill="#7fdcc5" opacity="0.92" />
        </marker>
      </defs>
      <rect class="tactic-pitch" x="126" y="72" width="928" height="470" rx="26" />
      <line class="tactic-pitch" x1="590" y1="72" x2="590" y2="542" />
      <circle class="tactic-pitch" cx="590" cy="307" r="74" />
      <path class="tactic-pitch" d="M126 190h106v234H126M1054 190H948v234h106" />
      <g aria-hidden="true" opacity="0.92">
        <circle class="tactic-player" cx="250" cy="185" r="8" /><circle class="tactic-player" cx="250" cy="270" r="8" /><circle class="tactic-player" cx="250" cy="355" r="8" /><circle class="tactic-player" cx="250" cy="440" r="8" />
        <circle class="tactic-player blue" cx="430" cy="225" r="8" /><circle class="tactic-player blue" cx="430" cy="307" r="8" /><circle class="tactic-player blue" cx="430" cy="390" r="8" />
        <circle class="tactic-player" cx="650" cy="190" r="8" /><circle class="tactic-player" cx="675" cy="307" r="8" /><circle class="tactic-player" cx="650" cy="425" r="8" />
      </g>
      <path class="tactic-route" data-route="central-progression" d="M430 307 L515 307 L565 260" marker-end="url(#hero-tactic-arrow)" />
      <path class="tactic-route" data-route="wide-run" d="M650 190 L735 150 L820 150" marker-end="url(#hero-tactic-arrow)" />
      <path class="tactic-route" data-route="inside-run" d="M675 307 L755 307 L825 255" marker-end="url(#hero-tactic-arrow)" />
      <path class="tactic-route" data-route="support-run" d="M650 425 L735 465 L815 465" marker-end="url(#hero-tactic-arrow)" />
      <circle cx="430" cy="307" r="3.4" fill="#f5f7fb" opacity="0.95" />`;
  }

  const labelStyle = 'font-family: Lato, sans-serif; font-size: 5.5px; font-weight: 700; letter-spacing: 0.04em; fill: currentColor; opacity: .78;';
  const dayStyle = 'font-family: Lato, sans-serif; font-size: 4.7px; font-weight: 700; fill: currentColor; opacity: .72;';

  const footballVisuals = [
    `<svg data-visual="game-model-structure" viewBox="0 0 220 94" focusable="false" aria-hidden="true"><rect class="mini-grid" x="25" y="10" width="170" height="74" rx="9"/><line class="mini-line" x1="25" y1="34" x2="195" y2="34"/><line class="mini-line" x1="25" y1="60" x2="195" y2="60"/><path class="mini-line" d="M25 28h19v38H25M195 28h-19v38h19"/><g class="mini-fill" opacity=".22"><rect x="44" y="13" width="132" height="18" rx="5"/><rect x="44" y="37" width="132" height="20" rx="5"/><rect x="44" y="63" width="132" height="18" rx="5"/></g><path class="mini-path" d="M54 68H86M67 47H100M96 24H128M134 47H166M142 68H174"/><g class="mini-node"><circle cx="54" cy="68" r="4"/><circle cx="86" cy="68" r="4"/><circle cx="67" cy="47" r="4"/><circle cx="100" cy="47" r="4"/><circle cx="134" cy="47" r="4"/><circle cx="166" cy="47" r="4"/><circle cx="96" cy="24" r="4"/><circle cx="128" cy="24" r="4"/><circle cx="142" cy="68" r="4"/><circle cx="174" cy="68" r="4"/></g><text x="31" y="21" style="${labelStyle}">${isEnglish ? 'ATTACK' : 'ATAQUE'}</text><text x="31" y="48" style="${labelStyle}">${isEnglish ? 'MID' : 'MEIO'}</text><text x="31" y="75" style="${labelStyle}">${isEnglish ? 'DEFENCE' : 'DEFESA'}</text></svg>`,
    `<svg data-visual="weekly-plan" viewBox="0 0 220 94" focusable="false" aria-hidden="true"><rect class="mini-grid" x="14" y="14" width="192" height="66" rx="9"/><line class="mini-line" x1="14" y1="29" x2="206" y2="29"/>${copy.days.map((day, index) => `<line class="mini-line" x1="${41 + index * 27.4}" y1="14" x2="${41 + index * 27.4}" y2="80"/><text x="${27 + index * 27.4}" y="24" text-anchor="middle" style="${dayStyle}">${day}</text>`).join('')}<rect class="mini-fill" x="45" y="40" width="20" height="10" rx="3"/><rect class="mini-fill" x="72" y="54" width="20" height="14" rx="3"/><rect class="mini-fill" x="100" y="38" width="20" height="18" rx="3"/><rect class="mini-fill" x="127" y="50" width="20" height="10" rx="3"/><rect class="mini-fill" x="155" y="35" width="20" height="28" rx="4"/><circle class="mini-node" cx="183" cy="50" r="7"/><path class="mini-line" d="M179 50h8M183 46v8"/></svg>`,
    `<svg data-visual="exercise-task" viewBox="0 0 220 94" focusable="false" aria-hidden="true"><rect class="mini-grid" x="30" y="12" width="160" height="70" rx="9"/><path class="mini-fill" d="M48 24l5 10h-10zM172 24l5 10h-10zM48 62l5 10h-10zM172 62l5 10h-10z"/><circle class="mini-node" cx="72" cy="34" r="5"/><circle class="mini-node" cx="72" cy="61" r="5"/><circle class="mini-node" cx="148" cy="34" r="5"/><circle class="mini-node" cx="148" cy="61" r="5"/><circle cx="108" cy="47" r="3" fill="currentColor" opacity=".9"/><path class="mini-path" d="M77 34L102 44M77 61L102 50M113 47L143 34M113 47L143 61"/><path class="mini-line" d="M102 42l5 5-5 5M138 29l5 5-7 1M138 60l5 1-4 5"/></svg>`,
    `<svg data-visual="player-development" viewBox="0 0 220 94" focusable="false" aria-hidden="true"><circle class="mini-fill" cx="62" cy="41" r="18"/><circle class="mini-node" cx="62" cy="34" r="6"/><path class="mini-line" d="M51 56c3-10 19-10 22 0"/><rect class="mini-grid" x="101" y="14" width="91" height="55" rx="8"/><circle class="mini-node" cx="113" cy="27" r="3.2"/><path class="mini-line" d="M122 27h53"/><circle class="mini-node" cx="113" cy="40" r="3.2"/><path class="mini-line" d="M122 40h44"/><circle class="mini-node" cx="113" cy="53" r="3.2"/><path class="mini-line" d="M122 53h58"/><path class="mini-path" d="M39 78H181"/><circle class="mini-node" cx="55" cy="78" r="3"/><circle class="mini-node" cx="94" cy="78" r="3"/><circle class="mini-node" cx="133" cy="78" r="3"/><circle class="mini-node" cx="172" cy="78" r="3"/></svg>`,
    `<svg data-visual="tactical-decision" viewBox="0 0 220 94" focusable="false" aria-hidden="true"><rect class="mini-grid" x="28" y="10" width="164" height="74" rx="9"/><line class="mini-line" x1="110" y1="10" x2="110" y2="84"/><circle class="mini-node" cx="73" cy="47" r="7"/><circle cx="84" cy="47" r="3" fill="currentColor" opacity=".95"/><circle class="mini-node" cx="142" cy="28" r="6"/><circle class="mini-node" cx="148" cy="66" r="6"/><path class="mini-path" d="M84 45L125 30M84 49L130 63"/><path class="mini-line" d="M120 26l6 3-5 4M125 59l6 4-6 3"/><circle class="mini-grid" cx="111" cy="47" r="11"/><text x="111" y="51" text-anchor="middle" style="font-family:Lato,sans-serif;font-size:12px;font-weight:900;fill:currentColor;opacity:.9">?</text></svg>`,
    `<svg data-visual="match-events" viewBox="0 0 220 94" focusable="false" aria-hidden="true"><rect class="mini-grid" x="24" y="10" width="172" height="74" rx="9"/><line class="mini-line" x1="110" y1="10" x2="110" y2="84"/><circle class="mini-grid" cx="110" cy="47" r="15"/><path class="mini-line" d="M24 28h22v38H24M196 28h-22v38h22"/><circle class="mini-node" cx="62" cy="31" r="4"/><circle class="mini-node" cx="81" cy="59" r="4"/><circle class="mini-node" cx="137" cy="35" r="4"/><circle class="mini-node" cx="158" cy="60" r="4"/><path class="mini-line" d="M56 66l6-6 6 6M132 62l10-10M137 52h5v5M154 26l8 8M162 26l-8 8"/><circle cx="118" cy="29" r="2.8" fill="currentColor" opacity=".9"/><circle cx="97" cy="67" r="2.8" fill="currentColor" opacity=".9"/></svg>`,
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
        demoVideo.volume = 0.08;
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