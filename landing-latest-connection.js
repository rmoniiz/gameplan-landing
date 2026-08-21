(() => {
  'use strict';

  const isEnglish = document.documentElement.lang === 'en';
  const copy = isEnglish
    ? {
        eyebrow: 'How it connects',
        title: 'Five areas, one connected coaching routine',
        description: 'Game model, exercises, planning, players and match review stop working as separate pieces. All five connect directly to GamePlan, making the path from the idea to the pitch easier to follow.',
        boardLabel: 'GamePlan connected coaching process: game model, exercises, planning, players and match',
        centerAlt: 'GamePlan logo',
        centerLabel: 'Connected process',
        cards: {
          a: ['01', 'Game model', 'Principles and behaviours behind your game idea.'],
          b: ['02', 'Exercises', 'Your own tasks plus ready-made exercises.'],
          c: ['03', 'Planning', 'Weekly and monthly goals and sessions.'],
          d: ['04', 'Players', 'Observations, evaluations and individual progress.'],
          e: ['05', 'Match', 'Indicators to review what appeared on the pitch.'],
        },
      }
    : {
        eyebrow: 'Como tudo se conecta',
        title: 'Cinco áreas, uma rotina conectada',
        description: 'Modelo de jogo, exercícios, planejamento, atletas e partida deixam de funcionar como partes separadas. Os cinco pontos se conectam diretamente ao GamePlan, deixando mais claro o caminho entre a ideia, o treino e o que aparece em campo.',
        boardLabel: 'Processo conectado do GamePlan: modelo de jogo, exercícios, planejamento, atletas e partida',
        centerAlt: 'Logo do GamePlan',
        centerLabel: 'Processo conectado',
        cards: {
          a: ['01', 'Modelo de jogo', 'Princípios e comportamentos da sua ideia de jogo.'],
          b: ['02', 'Exercícios', 'Tarefas próprias e exercícios prontos para usar.'],
          c: ['03', 'Planejamento', 'Objetivos e sessões da semana e do mês.'],
          d: ['04', 'Atletas', 'Observações, avaliações e evolução individual.'],
          e: ['05', 'Partida', 'Indicadores para revisar o que apareceu em campo.'],
        },
      };

  const board = document.querySelector('.connection-board');
  const eyebrow = document.querySelector('#connection .eyebrow');
  const title = document.querySelector('#connection .section-heading h2');
  const description = document.querySelector('#connection .section-heading p');
  const center = document.querySelector('.connection-center');
  const links = document.querySelector('.connection-links');

  if (board && center && links) {
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
  }

  const demoVideo = document.querySelector('#demo video');
  if (!demoVideo) return;

  const START_VOLUME = 0.12;
  const TARGET_VOLUME = 0.68;
  const FADE_SECONDS = 7;
  let fadeFrame = 0;
  let fadeStartedAt = 0;
  let fadeComplete = false;
  let internalVolumeChange = false;

  const setVolume = (value) => {
    internalVolumeChange = true;
    demoVideo.volume = Math.max(0, Math.min(1, value));
    queueMicrotask(() => { internalVolumeChange = false; });
  };

  const stopFade = () => {
    if (fadeFrame) cancelAnimationFrame(fadeFrame);
    fadeFrame = 0;
  };

  const runFade = (timestamp) => {
    if (!fadeStartedAt) fadeStartedAt = timestamp;
    const progress = Math.min(1, (timestamp - fadeStartedAt) / (FADE_SECONDS * 1000));
    const eased = progress * progress * (3 - 2 * progress);
    setVolume(START_VOLUME + (TARGET_VOLUME - START_VOLUME) * eased);
    if (progress < 1 && !demoVideo.paused) {
      fadeFrame = requestAnimationFrame(runFade);
    } else if (progress >= 1) {
      fadeComplete = true;
      fadeFrame = 0;
    }
  };

  demoVideo.addEventListener('play', () => {
    if (fadeComplete || demoVideo.currentTime > FADE_SECONDS + 0.5) return;
    stopFade();
    fadeStartedAt = 0;
    setVolume(START_VOLUME);
    fadeFrame = requestAnimationFrame(runFade);
  });

  demoVideo.addEventListener('pause', stopFade);
  demoVideo.addEventListener('seeking', () => {
    if (demoVideo.currentTime > FADE_SECONDS + 0.5) {
      stopFade();
      fadeComplete = true;
    }
  });

  demoVideo.addEventListener('volumechange', () => {
    if (internalVolumeChange || !fadeFrame) return;
    stopFade();
    fadeComplete = true;
  });
})();
