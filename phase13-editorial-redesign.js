(() => {
  'use strict';

  const stylesheet = document.querySelector('link[href="phase13-editorial-redesign.css"]');
  if (stylesheet) document.head.appendChild(stylesheet);

  const accessibilityStyles = document.createElement('style');
  accessibilityStyles.setAttribute('data-gameplan-editorial-a11y', 'true');
  accessibilityStyles.textContent = [
    '.light-section .step-number{color:#0b745a!important}',
    '.product-shot-light figcaption{color:#606a6f!important}',
    '.lead-field input::placeholder{color:#606a6f!important}',
    '.final-cta .dark-code{color:#06362a!important}',
  ].join('');
  document.head.appendChild(accessibilityStyles);

  document.querySelectorAll('.hero-foot, .return-loop').forEach((region) => {
    if (!region.hasAttribute('tabindex')) region.setAttribute('tabindex', '0');
  });

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
