(() => {
  'use strict';

  const stylesheet = document.querySelector('link[href="landing-final-polish.css"]');
  if (stylesheet) document.head.appendChild(stylesheet);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const trackedSections = navLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((item) => item.section);

  const setScrollProgress = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
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

  let ticking = false;
  const refreshScrollUI = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      setScrollProgress();
      setActiveNavigation();
      ticking = false;
    });
  };

  window.addEventListener('scroll', refreshScrollUI, { passive: true });
  window.addEventListener('resize', refreshScrollUI, { passive: true });
  setScrollProgress();
  setActiveNavigation();

  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
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
    const cards = [...connectionBoard.querySelectorAll('.connection-item')];
    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 25}ms`;
    });
  }
})();
