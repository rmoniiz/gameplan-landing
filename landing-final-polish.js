(() => {
  'use strict';

  const stylesheet = document.querySelector('link[href="landing-final-polish.css"]');
  if (stylesheet) document.head.appendChild(stylesheet);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const isEnglish = document.documentElement.lang === 'en';
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const trackedSections = navLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((item) => item.section);

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const setScrollProgress = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(window.scrollY / scrollable) * 100;
    root.style.setProperty('--scroll-progress', `${progress}%`);
  };

  const setActiveNavigation = () => {
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const marker = headerHeight + Math.min(180, window.innerHeight * 0.24);
    let active = trackedSections[0] || null;
    for (const item of trackedSections) {
      if (item.section.getBoundingClientRect().top <= marker) active = item;
    }
    navLinks.forEach((link) => {
      const selected = active?.link === link;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const ambientSections = [
    { element: document.querySelector('.hero'), rgb: '83,128,255' },
    { element: document.getElementById('connection'), rgb: '25,211,158' },
    { element: document.getElementById('features'), rgb: '83,128,255' },
    { element: document.getElementById('demo'), rgb: '154,99,255' },
    { element: document.getElementById('pricing'), rgb: '25,211,158' },
    { element: document.getElementById('about'), rgb: '83,128,255' },
    { element: document.getElementById('timeline'), rgb: '154,99,255' },
    { element: document.getElementById('lead-magnet'), rgb: '25,211,158' },
  ].filter((item) => item.element);

  const setSectionAmbience = () => {
    const marker = window.innerHeight * 0.46;
    let active = ambientSections[0];
    ambientSections.forEach((item) => {
      if (item.element.getBoundingClientRect().top <= marker) active = item;
    });
    if (active) root.style.setProperty('--section-rgb', active.rgb);
  };

  const hero = document.querySelector('.hero-centered');
  if (hero && !hero.querySelector('.hero-tactics')) {
    const tactics = document.createElement('div');
    tactics.className = 'hero-tactics';
    tactics.setAttribute('aria-hidden', 'true');
    tactics.innerHTML = `
      <svg viewBox="0 0 1180 620" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id="hero-route-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#19d39e" />
            <stop offset="0.55" stop-color="#5380ff" />
            <stop offset="1" stop-color="#9a63ff" />
          </linearGradient>
        </defs>
        <rect class="tactic-pitch" x="126" y="72" width="928" height="470" rx="26" />
        <line class="tactic-pitch" x1="590" y1="72" x2="590" y2="542" />
        <circle class="tactic-pitch" cx="590" cy="307" r="74" />
        <path class="tactic-pitch" d="M126 190h106v234H126M1054 190H948v234h106" />
        <path class="tactic-route" d="M270 388 C360 330 420 236 523 271 S688 366 786 306 S888 210 938 246" />
        <path class="tactic-route" d="M318 214 C414 180 470 194 527 248 S630 360 720 390 S835 400 900 340" />
        <circle class="tactic-player" cx="270" cy="388" r="8" />
        <circle class="tactic-player blue" cx="523" cy="271" r="8" />
        <circle class="tactic-player" cx="786" cy="306" r="8" />
        <circle class="tactic-player blue" cx="938" cy="246" r="8" />
        <circle class="tactic-player blue" cx="318" cy="214" r="8" />
        <circle class="tactic-player" cx="720" cy="390" r="8" />
        <circle class="tactic-player blue" cx="900" cy="340" r="8" />
      </svg>`;
    hero.prepend(tactics);
    hero.classList.add('hero-cinematic');
    const startHeroSequence = () => {
      if (!hero.classList.contains('hero-cinematic-live')) hero.classList.add('hero-cinematic-live');
    };
    if (reducedMotion) startHeroSequence();
    else if (document.readyState === 'complete') window.setTimeout(startHeroSequence, 430);
    else {
      window.addEventListener('load', () => window.setTimeout(startHeroSequence, 430), { once: true });
      window.setTimeout(startHeroSequence, 1400);
    }
  }

  const journeyCopy = isEnglish
    ? ['Game model', 'Exercise', 'Planning', 'Player', 'Match']
    : ['Modelo', 'Exercício', 'Planejamento', 'Atleta', 'Partida'];
  let journey = null;
  if (document.getElementById('connection') && document.getElementById('demo')) {
    journey = document.createElement('div');
    journey.className = 'tactical-journey';
    journey.setAttribute('aria-hidden', 'true');
    journey.innerHTML = `
      <span class="tactical-journey__track"></span>
      <span class="tactical-journey__fill"></span>
      <div class="tactical-journey__nodes">
        ${journeyCopy.map((label) => `<div class="tactical-journey__node"><span>${label}</span></div>`).join('')}
      </div>`;
    body.appendChild(journey);
  }

  const journeyNodes = journey ? [...journey.querySelectorAll('.tactical-journey__node')] : [];
  const updateJourney = () => {
    if (!journey || !journeyNodes.length) return;
    const startSection = document.getElementById('connection');
    const endSection = document.getElementById('demo');
    if (!startSection || !endSection) return;
    const startY = window.scrollY + startSection.getBoundingClientRect().top;
    const endY = window.scrollY + endSection.getBoundingClientRect().bottom;
    const markerY = window.scrollY + window.innerHeight * 0.5;
    const progress = clamp((markerY - startY) / Math.max(1, endY - startY));
    const visible = markerY >= startY - window.innerHeight * 0.4 && markerY <= endY + window.innerHeight * 0.45;
    journey.classList.toggle('is-visible', visible);
    root.style.setProperty('--journey-progress', `${progress * 100}%`);
    journeyNodes.forEach((node, index) => {
      const threshold = journeyNodes.length === 1 ? 0 : index / (journeyNodes.length - 1);
      node.classList.toggle('is-reached', progress + 0.035 >= threshold);
    });
  };

  const miniVisuals = [
    `<svg viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="10" y="10" width="200" height="74" rx="12"/><path class="mini-line" d="M110 10v74M10 47h200"/><path class="mini-path" d="M40 62 C68 28 91 72 118 39 S166 25 184 53"/><circle class="mini-node" cx="40" cy="62" r="5"/><circle class="mini-node" cx="84" cy="45" r="5"/><circle class="mini-node" cx="118" cy="39" r="5"/><circle class="mini-node" cx="157" cy="31" r="5"/><circle class="mini-node" cx="184" cy="53" r="5"/></svg>`,
    `<svg viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="12" y="13" width="196" height="67" rx="11"/><path class="mini-line" d="M40 13v67M68 13v67M96 13v67M124 13v67M152 13v67M180 13v67"/><rect class="mini-bar" x="18" y="26" width="17" height="9" rx="3"/><rect class="mini-bar active" x="45" y="43" width="18" height="21" rx="4"/><rect class="mini-bar" x="73" y="24" width="18" height="14" rx="4"/><rect class="mini-bar active" x="101" y="30" width="18" height="30" rx="4"/><rect class="mini-bar" x="129" y="48" width="18" height="14" rx="4"/><rect class="mini-bar active" x="157" y="22" width="18" height="24" rx="4"/><rect class="mini-bar" x="185" y="39" width="18" height="15" rx="4"/></svg>`,
    `<svg viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="10" y="10" width="200" height="74" rx="12"/><path class="mini-path" d="M45 65 L78 30 L111 64 L145 28 L178 62"/><circle class="mini-node" cx="45" cy="65" r="5"/><circle class="mini-node" cx="78" cy="30" r="5"/><circle class="mini-node" cx="111" cy="64" r="5"/><circle class="mini-node" cx="145" cy="28" r="5"/><circle class="mini-node" cx="178" cy="62" r="5"/><path class="mini-line" d="M31 28l8 14 8-14M174 23l7 13 7-13M96 23l7 13 7-13"/></svg>`,
    `<svg viewBox="0 0 220 94" focusable="false"><circle class="mini-fill" cx="110" cy="42" r="18"/><circle class="mini-node" cx="110" cy="34" r="7"/><path class="mini-line" d="M97 55c4-10 22-10 26 0"/><path class="mini-path" d="M53 62 C75 54 82 47 92 43 M128 43 C143 48 151 58 170 63"/><circle class="mini-node" cx="53" cy="62" r="4"/><circle class="mini-node" cx="170" cy="63" r="4"/><rect class="mini-bar active" x="36" y="23" width="34" height="5" rx="2.5"/><rect class="mini-bar" x="36" y="33" width="24" height="4" rx="2"/><rect class="mini-bar active" x="155" y="25" width="29" height="5" rx="2.5"/><rect class="mini-bar" x="161" y="35" width="23" height="4" rx="2"/></svg>`,
    `<svg viewBox="0 0 220 94" focusable="false"><circle class="mini-fill" cx="48" cy="47" r="13"/><path class="mini-path" d="M61 47 H102 M102 47 C126 47 130 28 153 28 M102 47 C126 47 130 66 153 66"/><circle class="mini-node" cx="102" cy="47" r="5"/><circle class="mini-node" cx="160" cy="28" r="7"/><circle class="mini-node" cx="160" cy="66" r="7"/><path class="mini-line" d="M180 28h20M180 66h20"/><rect class="mini-bar active" x="180" y="24" width="18" height="8" rx="4"/></svg>`,
    `<svg viewBox="0 0 220 94" focusable="false"><rect class="mini-grid" x="22" y="9" width="176" height="76" rx="11"/><line class="mini-line" x1="110" y1="9" x2="110" y2="85"/><circle class="mini-grid" cx="110" cy="47" r="18"/><rect class="mini-fill" x="26" y="13" width="42" height="68" rx="8"/><rect class="mini-fill" x="152" y="13" width="42" height="68" rx="8"/><path class="mini-path" d="M51 62 C75 35 93 28 112 47 S151 66 176 35"/><circle class="mini-node" cx="51" cy="62" r="5"/><circle class="mini-node" cx="112" cy="47" r="5"/><circle class="mini-node" cx="176" cy="35" r="5"/></svg>`,
  ];

  const featureCards = [...document.querySelectorAll('.features-grid .feature-card')];
  featureCards.forEach((card, index) => {
    if (card.querySelector('.feature-mini-visual')) return;
    const visual = document.createElement('div');
    visual.className = 'feature-mini-visual';
    visual.setAttribute('aria-hidden', 'true');
    visual.innerHTML = miniVisuals[index] || miniVisuals[0];
    const tag = card.querySelector('.feature-tag');
    if (tag) tag.insertAdjacentElement('afterend', visual);
    else card.prepend(visual);
  });

  const timeline = document.querySelector('.timeline');
  const timelineItems = timeline ? [...timeline.querySelectorAll('.timeline-item')] : [];
  const updateTimeline = () => {
    if (!timeline || !timelineItems.length) return;
    const rect = timeline.getBoundingClientRect();
    const trigger = window.innerHeight * 0.76;
    const travel = Math.max(220, rect.height + window.innerHeight * 0.24);
    const progress = clamp((trigger - rect.top) / travel);
    timeline.style.setProperty('--timeline-progress', String(progress));
    timelineItems.forEach((item, index) => {
      const threshold = timelineItems.length === 1 ? 0 : index / (timelineItems.length - 1);
      item.classList.toggle('is-reached', progress + 0.08 >= threshold);
    });
  };

  const setupTilt = (element, strength = 1.2) => {
    if (!element || reducedMotion || !finePointer || window.innerWidth <= 1120) return;
    element.classList.add('motion-tilt');
    let frame = 0;
    const reset = () => {
      element.style.setProperty('--tilt-x', '0deg');
      element.style.setProperty('--tilt-y', '0deg');
    };
    element.addEventListener('pointermove', (event) => {
      if (body.classList.contains('demo-cinema-mode') && element.matches('.demo-shell')) {
        reset();
        return;
      }
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width));
        const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height));
        element.style.setProperty('--tilt-x', `${((0.5 - y) * strength).toFixed(2)}deg`);
        element.style.setProperty('--tilt-y', `${((x - 0.5) * strength).toFixed(2)}deg`);
        frame = 0;
      });
    }, { passive: true });
    element.addEventListener('pointerleave', reset, { passive: true });
  };

  setupTilt(document.querySelector('.connection-board'), 1.25);
  setupTilt(document.querySelector('.demo-shell'), 1.05);
  setupTilt(document.querySelector('.founder-card'), 1.15);

  const demoVideo = document.querySelector('#demo video');
  if (demoVideo) {
    const enterCinema = () => body.classList.add('demo-cinema-mode');
    const exitCinema = () => body.classList.remove('demo-cinema-mode');
    demoVideo.addEventListener('play', enterCinema);
    demoVideo.addEventListener('pause', exitCinema);
    demoVideo.addEventListener('ended', exitCinema);
  }

  let ticking = false;
  const refreshScrollUI = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      setScrollProgress();
      setActiveNavigation();
      setSectionAmbience();
      updateJourney();
      updateTimeline();
      ticking = false;
    });
  };

  window.addEventListener('scroll', refreshScrollUI, { passive: true });
  window.addEventListener('resize', refreshScrollUI, { passive: true });
  setScrollProgress();
  setActiveNavigation();
  setSectionAmbience();
  updateJourney();
  updateTimeline();

  if (!reducedMotion && finePointer) {
    let pointerFrame = 0;
    window.addEventListener('pointermove', (event) => {
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        root.style.setProperty('--pointer-x', `${Math.round((event.clientX / window.innerWidth) * 100)}%`);
        root.style.setProperty('--pointer-y', `${Math.round((event.clientY / window.innerHeight) * 100)}%`);
        pointerFrame = 0;
      });
    }, { passive: true });
  }

  const connectionBoard = document.querySelector('.connection-board');
  if (connectionBoard && !reducedMotion) {
    [...connectionBoard.querySelectorAll('.connection-item')].forEach((card, index) => {
      card.style.transitionDelay = `${index * 25}ms`;
    });
  }

  body.classList.add('final-polish-v2');
})();
