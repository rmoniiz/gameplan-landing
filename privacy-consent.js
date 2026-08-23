(() => {
  'use strict';

  const CONSENT_KEY = 'gameplan:privacy:analytics-consent:v1';
  const GRANTED = 'granted';
  const DENIED = 'denied';
  const locale = document.documentElement.lang === 'en' ? 'en' : 'pt-BR';
  const privacyUrl = locale === 'en' ? 'privacy-en.html' : 'privacy.html';
  const copy = locale === 'en'
    ? {
        title: 'Privacy choices',
        text: 'GamePlan uses essential storage for site preferences. Optional analytics is only activated after your consent and helps us understand how the landing page is used.',
        accept: 'Accept analytics',
        necessary: 'Necessary only',
        preferences: 'Privacy preferences',
      }
    : {
        title: 'Preferências de privacidade',
        text: 'O GamePlan usa armazenamento essencial para preferências do site. Analytics opcional só é ativado após o seu consentimento e nos ajuda a entender como a landing page é utilizada.',
        accept: 'Aceitar analytics',
        necessary: 'Somente necessários',
        preferences: 'Preferências de privacidade',
      };

  const readChoice = () => {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch { return null; }
  };
  const saveChoice = (choice) => {
    try { window.localStorage.setItem(CONSENT_KEY, choice); } catch { /* preference remains session-only */ }
  };

  const installNoopPostHog = () => {
    if (window.posthog?.__SV) return;
    window.posthog = {
      __SV: 1,
      capture() {},
      identify() {},
      reset() {},
      opt_out_capturing() {},
      opt_in_capturing() {},
    };
  };

  const loadPostHog = () => {
    if (window.__gameplanPostHogLoaded) return;
    window.__gameplanPostHogLoaded = true;
    delete window.posthog;
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split('.');2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement('script')).type='text/javascript',p.crossOrigin='anonymous',p.async=!0,p.src=s.api_host+'/static/array.js',(r=t.getElementsByTagName('script')[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a='posthog',u.people=u.people||[],u.toString=function(t){var e='posthog';return'posthog'!==a&&(e+='.'+a),t||(e+=' (stub)'),e},u.people.toString=function(){return u.toString(1)+'.people (stub)'},o='capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group'.split(' '),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init('phc_nXxHwxXeVWRu49opsXZx67RBD8hdCxCJSJqpPmTR36fY', {
      api_host: 'https://eu.i.posthog.com',
      ui_host: 'https://eu.posthog.com',
      person_profiles: 'identified_only',
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
    });
  };

  const createBanner = () => {
    const banner = document.createElement('section');
    banner.className = 'privacy-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'privacyConsentTitle');
    banner.innerHTML = `
      <h2 id="privacyConsentTitle" class="privacy-consent__title">${copy.title}</h2>
      <p class="privacy-consent__text">${copy.text} <a href="${privacyUrl}">${locale === 'en' ? 'Read the Privacy Policy' : 'Leia a Política de Privacidade'}</a>.</p>
      <div class="privacy-consent__actions">
        <button type="button" class="privacy-consent__button privacy-consent__button--accept" data-consent="accept">${copy.accept}</button>
        <button type="button" class="privacy-consent__button privacy-consent__button--necessary" data-consent="deny">${copy.necessary}</button>
      </div>`;
    document.body.appendChild(banner);
    return banner;
  };

  let banner;
  const showBanner = () => {
    if (!banner) banner = createBanner();
    banner.hidden = false;
    banner.querySelector('button')?.focus({ preventScroll: true });
  };
  const hideBanner = () => { if (banner) banner.hidden = true; };

  const applyChoice = (choice) => {
    saveChoice(choice);
    if (choice === GRANTED) {
      loadPostHog();
      window.posthog?.opt_in_capturing?.();
    } else {
      window.posthog?.opt_out_capturing?.();
      window.posthog?.reset?.();
      installNoopPostHog();
    }
    hideBanner();
  };

  document.addEventListener('click', (event) => {
    const action = event.target.closest?.('[data-consent]')?.dataset.consent;
    if (action === 'accept') applyChoice(GRANTED);
    if (action === 'deny') applyChoice(DENIED);
  });

  const addPreferenceControl = () => {
    const footerLinks = document.querySelector('.footer-links');
    if (!footerLinks || footerLinks.querySelector('.privacy-preferences-link')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'privacy-preferences-link';
    button.textContent = copy.preferences;
    button.addEventListener('click', showBanner);
    footerLinks.appendChild(button);
  };

  const choice = readChoice();
  if (choice === GRANTED) loadPostHog();
  else installNoopPostHog();

  const initializeUi = () => {
    addPreferenceControl();
    if (choice !== GRANTED && choice !== DENIED) showBanner();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeUi, { once: true });
  else initializeUi();
})();