(() => {
  'use strict';

  const isEnglish = document.documentElement.lang === 'en';

  const copy = isEnglish
    ? {
        aboutTitle: 'GamePlan started with a need.',
        aboutParagraphs: [
          'My relationship with football began with my grandfather, Adão, an amateur coach. He taught me early to look at the game through intelligence, cooperation and purpose. I started coaching in the United States in 2017 and later worked across different clubs, countries and football cultures before arriving in the Netherlands.',
          'Across those environments, the same practical problem kept showing up in my own work. Part of the thinking lived in the game model, part in planning, part in training notes and part in the match review. Coming back to a decision often meant rebuilding the context around it.',
          'One question kept returning: did what we worked on during the week actually show up in the match? When it did not, where should that observation live so it could shape the following week?',
          'That need is where GamePlan started to take shape: one place to keep the game model, exercises, planning, players and match analysis connected. The platform gives the process structure, but the methodology, the reading of the game and the technical decisions stay with the coach.',
        ],
        finalCta: 'Bring your week into GamePlan.',
        days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      }
    : {
        aboutTitle: 'O GamePlan nasceu de uma necessidade.',
        aboutParagraphs: [
          'Minha relação com o futebol começou com meu avô, Adão, treinador amador. Foi com ele que aprendi cedo a olhar o jogo como um problema de inteligência, cooperação e propósito. Em 2017, comecei minha trajetória como treinador nos Estados Unidos e, depois, passei por clubes, países e culturas diferentes até chegar à Holanda.',
          'Ao longo desse caminho, eu encontrava no meu próprio trabalho o mesmo problema: uma parte do raciocínio ficava no modelo de jogo, outra no planejamento, outra nas anotações do treino e outra na revisão da partida. Quando eu precisava voltar a uma decisão, muitas vezes precisava reconstruir o contexto.',
          'Uma pergunta voltava sempre: o que trabalhamos durante a semana apareceu de fato no jogo? Quando não aparecia, onde registrar essa observação para levar para a semana seguinte?',
          'Foi dessa necessidade que o GamePlan começou a tomar forma: um lugar para manter modelo de jogo, exercícios, planejamento, atletas e análise da partida conectados. A plataforma dá estrutura ao processo, mas a metodologia, a leitura do jogo e a decisão técnica continuam com o treinador.',
        ],
        finalCta: 'Leve sua semana para dentro do GamePlan.',
        days: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'],
      };

  const aboutCopy = document.querySelector('#about .about-copy');
  if (aboutCopy) {
    const title = aboutCopy.querySelector('h2');
    const paragraphs = [...aboutCopy.querySelectorAll(':scope > p')];
    if (title) title.textContent = copy.aboutTitle;
    copy.aboutParagraphs.forEach((text, index) => {
      if (!paragraphs[index]) return;
      paragraphs[index].textContent = text;
    });
    const last = paragraphs[copy.aboutParagraphs.length - 1];
    if (last) {
      const emphasis = isEnglish ? 'stay with the coach' : 'continuam com o treinador';
      const fullText = copy.aboutParagraphs.at(-1);
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

  const heroTactics = document.querySelector('.hero-tactics svg');
  if (heroTactics) {
    heroTactics.setAttribute('viewBox', '0 0 1180 620');
    heroTactics.innerHTML = `
      <defs>
        <linearGradient id="hero-route-gradient-v2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#19d39e" />
          <stop offset="0.55" stop-color="#5380ff" />
          <stop offset="1" stop-color="#9a63ff" />
        </linearGradient>
        <marker id="hero-arrow-v2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,4 L0,8 z" fill="#7fdcc5" opacity="0.92" />
        </marker>
        <marker id="hero-ball-arrow-v2" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#8bb8ff" opacity="0.9" />
        </marker>
      </defs>
      <rect class="tactic-pitch" x="126" y="72" width="928" height="470" rx="26" />
      <line class="tactic-pitch" x1="590" y1="72" x2="590" y2="542" />
      <circle class="tactic-pitch" cx="590" cy="307" r="74" />
      <path class="tactic-pitch" d="M126 190h106v234H126M1054 190H948v234h106" />

      <g aria-hidden="true" opacity="0.92">
        <circle class="tactic-player" cx="250" cy="185" r="8" />
        <circle class="tactic-player" cx="250" cy="270" r="8" />
        <circle class="tactic-player" cx="250" cy="355" r="8" />
        <circle class="tactic-player" cx="250" cy="440" r="8" />
        <circle class="tactic-player blue" cx="430" cy="225" r="8" />
        <circle class="tactic-player blue" cx="430" cy="307" r="8" />
        <circle class="tactic-player blue" cx="430" cy="390" r="8" />
        <circle class="tactic-player" cx="650" cy="190" r="8" />
        <circle class="tactic-player" cx="675" cy="307" r="8" />
        <circle class="tactic-player" cx="650" cy="425" r="8" />
      </g>

      <path d="M430 307 L515 307 L565 260" fill="none" stroke="url(#hero-route-gradient-v2)" stroke-width="2" stroke-dasharray="9 9" opacity="0.82" marker-end="url(#hero-ball-arrow-v2)" />
      <path d="M650 190 L735 150 L820 150" fill="none" stroke="url(#hero-route-gradient-v2)" stroke-width="2.2" stroke-dasharray="10 8" opacity="0.86" marker-end="url(#hero-arrow-v2)" />
      <path d="M675 307 L755 307 L825 255" fill="none" stroke="url(#hero-route-gradient-v2)" stroke-width="2.2" stroke-dasharray="10 8" opacity="0.86" marker-end="url(#hero-arrow-v2)" />
      <path d="M650 425 L735 465 L815 465" fill="none" stroke="url(#hero-route-gradient-v2)" stroke-width="2.2" stroke-dasharray="10 8" opacity="0.86" marker-end="url(#hero-arrow-v2)" />
      <circle cx="430" cy="307" r="3.4" fill="#f5f7fb" opacity="0.95" />`;
  }

  const labelStyle = 'font-family: Lato, sans-serif; font-size: 5.5px; font-weight: 700; letter-spacing: 0.04em; fill: currentColor; opacity: .78;';
  const dayStyle = 'font-family: Lato, sans-serif; font-size: 4.7px; font-weight: 700; fill: currentColor; opacity: .72;';

  const visuals = [
    `<svg data-visual="game-model-structure" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
      <rect class="mini-grid" x="25" y="10" width="170" height="74" rx="9"/>
      <line class="mini-line" x1="25" y1="34" x2="195" y2="34"/><line class="mini-line" x1="25" y1="60" x2="195" y2="60"/>
      <path class="mini-line" d="M25 28h19v38H25M195 28h-19v38h19"/>
      <g class="mini-fill" opacity=".22"><rect x="44" y="13" width="132" height="18" rx="5"/><rect x="44" y="37" width="132" height="20" rx="5"/><rect x="44" y="63" width="132" height="18" rx="5"/></g>
      <path class="mini-path" d="M54 68H86M67 47H100M96 24H128M134 47H166M142 68H174"/>
      <g class="mini-node"><circle cx="54" cy="68" r="4"/><circle cx="86" cy="68" r="4"/><circle cx="67" cy="47" r="4"/><circle cx="100" cy="47" r="4"/><circle cx="134" cy="47" r="4"/><circle cx="166" cy="47" r="4"/><circle cx="96" cy="24" r="4"/><circle cx="128" cy="24" r="4"/><circle cx="142" cy="68" r="4"/><circle cx="174" cy="68" r="4"/></g>
      <text x="31" y="21" style="${labelStyle}">${isEnglish ? 'ATTACK' : 'ATAQUE'}</text><text x="31" y="48" style="${labelStyle}">${isEnglish ? 'MID' : 'MEIO'}</text><text x="31" y="75" style="${labelStyle}">${isEnglish ? 'DEFENCE' : 'DEFESA'}</text>
    </svg>`,

    `<svg data-visual="weekly-plan" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
      <rect class="mini-grid" x="14" y="14" width="192" height="66" rx="9"/>
      <line class="mini-line" x1="14" y1="29" x2="206" y2="29"/>
      ${copy.days.map((day, index) => `<line class="mini-line" x1="${41 + index * 27.4}" y1="14" x2="${41 + index * 27.4}" y2="80"/><text x="${27 + index * 27.4}" y="24" text-anchor="middle" style="${dayStyle}">${day}</text>`).join('')}
      <rect class="mini-fill" x="45" y="40" width="20" height="10" rx="3"/><rect class="mini-fill" x="72" y="54" width="20" height="14" rx="3"/><rect class="mini-fill" x="100" y="38" width="20" height="18" rx="3"/><rect class="mini-fill" x="127" y="50" width="20" height="10" rx="3"/><rect class="mini-fill" x="155" y="35" width="20" height="28" rx="4"/>
      <circle class="mini-node" cx="183" cy="50" r="7"/><path class="mini-line" d="M179 50h8M183 46v8"/>
    </svg>`,

    `<svg data-visual="exercise-task" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
      <rect class="mini-grid" x="30" y="12" width="160" height="70" rx="9"/>
      <path class="mini-fill" d="M48 24l5 10h-10zM172 24l5 10h-10zM48 62l5 10h-10zM172 62l5 10h-10z"/>
      <circle class="mini-node" cx="72" cy="34" r="5"/><circle class="mini-node" cx="72" cy="61" r="5"/><circle class="mini-node" cx="148" cy="34" r="5"/><circle class="mini-node" cx="148" cy="61" r="5"/>
      <circle cx="108" cy="47" r="3" fill="currentColor" opacity=".9"/>
      <path class="mini-path" d="M77 34L102 44M77 61L102 50M113 47L143 34M113 47L143 61"/>
      <path class="mini-line" d="M102 42l5 5-5 5M138 29l5 5-7 1M138 60l5 1-4 5"/>
    </svg>`,

    `<svg data-visual="player-development" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
      <circle class="mini-fill" cx="62" cy="41" r="18"/><circle class="mini-node" cx="62" cy="34" r="6"/><path class="mini-line" d="M51 56c3-10 19-10 22 0"/>
      <rect class="mini-grid" x="101" y="14" width="91" height="55" rx="8"/>
      <circle class="mini-node" cx="113" cy="27" r="3.2"/><path class="mini-line" d="M122 27h53"/><circle class="mini-node" cx="113" cy="40" r="3.2"/><path class="mini-line" d="M122 40h44"/><circle class="mini-node" cx="113" cy="53" r="3.2"/><path class="mini-line" d="M122 53h58"/>
      <path class="mini-path" d="M39 78H181"/><circle class="mini-node" cx="55" cy="78" r="3"/><circle class="mini-node" cx="94" cy="78" r="3"/><circle class="mini-node" cx="133" cy="78" r="3"/><circle class="mini-node" cx="172" cy="78" r="3"/>
    </svg>`,

    `<svg data-visual="tactical-decision" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
      <rect class="mini-grid" x="28" y="10" width="164" height="74" rx="9"/><line class="mini-line" x1="110" y1="10" x2="110" y2="84"/>
      <circle class="mini-node" cx="73" cy="47" r="7"/><circle cx="84" cy="47" r="3" fill="currentColor" opacity=".95"/>
      <circle class="mini-node" cx="142" cy="28" r="6"/><circle class="mini-node" cx="148" cy="66" r="6"/>
      <path class="mini-path" d="M84 45L125 30M84 49L130 63"/><path class="mini-line" d="M120 26l6 3-5 4M125 59l6 4-6 3"/>
      <circle class="mini-grid" cx="111" cy="47" r="11"/><text x="111" y="51" text-anchor="middle" style="font-family:Lato,sans-serif;font-size:12px;font-weight:900;fill:currentColor;opacity:.9">?</text>
    </svg>`,

    `<svg data-visual="match-events" viewBox="0 0 220 94" focusable="false" aria-hidden="true">
      <rect class="mini-grid" x="24" y="10" width="172" height="74" rx="9"/><line class="mini-line" x1="110" y1="10" x2="110" y2="84"/><circle class="mini-grid" cx="110" cy="47" r="15"/><path class="mini-line" d="M24 28h22v38H24M196 28h-22v38h22"/>
      <circle class="mini-node" cx="62" cy="31" r="4"/><circle class="mini-node" cx="81" cy="59" r="4"/><circle class="mini-node" cx="137" cy="35" r="4"/><circle class="mini-node" cx="158" cy="60" r="4"/>
      <path class="mini-line" d="M56 66l6-6 6 6M132 62l10-10M137 52h5v5M154 26l8 8M162 26l-8 8"/>
      <circle cx="118" cy="29" r="2.8" fill="currentColor" opacity=".9"/><circle cx="97" cy="67" r="2.8" fill="currentColor" opacity=".9"/>
    </svg>`,
  ];

  const miniVisuals = [...document.querySelectorAll('.feature-mini-visual')];
  miniVisuals.forEach((visual, index) => {
    if (visuals[index]) visual.innerHTML = visuals[index];
  });

  const demoVideo = document.querySelector('#demo video');
  if (demoVideo) {
    const applyQuietVolume = () => {
      try {
        demoVideo.volume = 0.08;
      } catch {
        // Some mobile browsers keep volume under OS control.
      }
    };
    if (demoVideo.readyState >= 1) applyQuietVolume();
    else demoVideo.addEventListener('loadedmetadata', applyQuietVolume, { once: true });
  }
})();