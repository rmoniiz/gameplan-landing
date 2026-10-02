(() => {
  'use strict';

  const stylesheet = document.querySelector('link[href="phase13-editorial-redesign.css"]');
  if (stylesheet) document.head.appendChild(stylesheet);

  document.body.classList.add('editorial-ready');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const steps = [...document.querySelectorAll('[data-flow-step]')];

  if (!steps.length) return;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    steps.forEach((step) => step.classList.add('is-active'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      steps.forEach((step) => step.classList.toggle('is-active', step === entry.target));
    });
  }, { rootMargin: '-30% 0px -45% 0px', threshold: 0.01 });

  steps.forEach((step) => observer.observe(step));
})();
