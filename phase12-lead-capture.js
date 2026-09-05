(() => {
  'use strict';
  if (document.getElementById('lead-magnet')) return;

  const locale = document.documentElement.lang === 'en' ? 'en' : 'pt-BR';
  const isEnglish = locale === 'en';
  const leadMagnetId = 'game_model_checklist_v1';
  const analyticsConsentKey = 'gameplan:privacy:analytics-consent:v1';
  // Deliberately disabled until the Rehearsal endpoint, access controls, and anti-abuse controls are audited.
  const captureConfig = Object.freeze({ enabled: false, endpoint: null });
  const testAdapter = window.__GAMEPLAN_PHASE12_CAPTURE_TEST_ADAPTER__;
  const checklistUrl = isEnglish ? 'game-model-checklist.html' : 'checklist-modelo-de-jogo.html';
  const privacyUrl = isEnglish ? 'privacy-en.html' : 'privacy.html';
  const trialUrl = isEnglish ? 'https://gameplan-app-zeta.vercel.app/signup?trial=7&lang=en' : 'https://gameplan-app-zeta.vercel.app/signup?trial=7&lang=pt-BR';
  const copy = isEnglish ? {
    eyebrow:'Free coaching resource', title:'Is your Game Model clear enough to reach the pitch?', text:'Use a practical 10-point checklist to review whether your idea connects to observable behaviours, training decisions and match evidence.', bullets:['Game idea and priorities','With and without the ball','Transitions and observable behaviours','Training connection and match evidence'], name:'Name', email:'Email', namePlaceholder:'Your name', emailPlaceholder:'you@example.com', consent:'I agree that GamePlan may process my name, email and language only to deliver this checklist request, as described in the', privacy:'Privacy Policy', submit:'Get the free checklist', started:'Checklist request started.', unavailable:'Checklist delivery is being validated. Please try again later.', successTitle:'Checklist unlocked', successText:'Your request was received. You can open the checklist now.', open:'Open checklist', trial:'Try GamePlan free for 7 days', consentError:'Please confirm the consent required to request the checklist.', note:'No payment required. Analytics is optional and is not required to receive the checklist.'
  } : {
    eyebrow:'Material gratuito para treinadores', title:'Seu Modelo de Jogo está claro o suficiente para chegar ao campo?', text:'Use um checklist prático de 10 pontos para revisar se sua ideia se conecta a comportamentos observáveis, decisões de treino e evidências da partida.', bullets:['Ideia de jogo e prioridades','Com bola e sem bola','Transições e comportamentos observáveis','Conexão com treino e evidências da partida'], name:'Nome', email:'E-mail', namePlaceholder:'Seu nome', emailPlaceholder:'voce@exemplo.com', consent:'Concordo que o GamePlan trate meu nome, e-mail e idioma somente para entregar esta solicitação do checklist, conforme a', privacy:'Política de Privacidade', submit:'Receber checklist gratuito', started:'Solicitação do checklist iniciada.', unavailable:'A entrega do checklist está em validação. Tente novamente mais tarde.', successTitle:'Checklist liberado', successText:'Sua solicitação foi recebida. Você já pode abrir o checklist.', open:'Abrir checklist', trial:'Testar o GamePlan por 7 dias', consentError:'Confirme o consentimento necessário para solicitar o checklist.', note:'Nenhum pagamento é necessário. Analytics é opcional e não é necessário para receber o checklist.'
  };

  const capture = (eventName, properties = {}) => {
    try {
      if (localStorage.getItem(analyticsConsentKey) !== 'granted') return;
      const safe = { page_language: locale, lead_magnet_id: leadMagnetId, source: 'landing', ...properties };
      window.posthog?.capture?.(eventName, safe);
    } catch { /* optional analytics must never block the resource */ }
  };
  const section = document.createElement('section');
  section.id = 'lead-magnet'; section.className = 'section lead-magnet-section';
  section.innerHTML = `<div class="lead-magnet-shell glass"><div class="lead-magnet-copy"><div class="eyebrow">${copy.eyebrow}</div><h2>${copy.title}</h2><p>${copy.text}</p><ul class="lead-magnet-benefits">${copy.bullets.map((item) => `<li>${item}</li>`).join('')}</ul><p class="lead-magnet-note">${copy.note}</p></div><div class="lead-magnet-form-wrap"><form class="lead-magnet-form" novalidate><div class="lead-field"><label for="leadName">${copy.name}</label><input id="leadName" name="name" type="text" autocomplete="name" minlength="2" maxlength="120" required placeholder="${copy.namePlaceholder}"></div><div class="lead-field"><label for="leadEmail">${copy.email}</label><input id="leadEmail" name="email" type="email" autocomplete="email" maxlength="320" required placeholder="${copy.emailPlaceholder}"></div><div class="lead-honeypot" aria-hidden="true"><label for="leadCompany">Company</label><input id="leadCompany" name="company" type="text" tabindex="-1" autocomplete="off"></div><label class="lead-consent"><input name="consent" type="checkbox" required><span>${copy.consent} <a href="${privacyUrl}">${copy.privacy}</a>.</span></label><button class="btn btn-primary btn-large lead-submit" type="submit">${copy.submit}</button><p class="lead-form-status" role="status" aria-live="polite"></p></form><div class="lead-success" hidden><span class="lead-success-mark" aria-hidden="true">✓</span><h3>${copy.successTitle}</h3><p>${copy.successText}</p><a class="btn btn-primary btn-large lead-open" href="${checklistUrl}">${copy.open}</a><a class="btn btn-ghost" href="${trialUrl}">${copy.trial}</a></div></div></div>`;
  const feedback = document.getElementById('feedback');
  if (feedback?.parentNode) feedback.parentNode.insertBefore(section, feedback); else document.querySelector('main')?.appendChild(section);
  let viewed = false;
  const observer = new IntersectionObserver((entries) => { if (!viewed && entries.some((entry) => entry.isIntersecting)) { viewed = true; capture('landing_lead_magnet_viewed'); observer.disconnect(); } }, { threshold: .35 });
  observer.observe(section);
  const form = section.querySelector('.lead-magnet-form'); const status = section.querySelector('.lead-form-status'); const success = section.querySelector('.lead-success');
  const statusMessage = (message, info = false) => { status.textContent = message; status.dataset.state = info ? 'info' : 'error'; };
  form.addEventListener('focusin', () => capture('landing_lead_capture_started'), { once:true });
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); statusMessage('', true);
    if (!form.checkValidity()) { form.reportValidity(); if (!form.elements.consent.checked) statusMessage(copy.consentError); return; }
    if (form.elements.company.value) { statusMessage(copy.unavailable); capture('landing_lead_capture_failed', { error_type:'rejected' }); return; }
    capture('landing_lead_capture_submitted');
    if (!captureConfig.enabled && typeof testAdapter !== 'function') { statusMessage(copy.unavailable, true); capture('landing_lead_capture_failed', { error_type:'integration_unavailable' }); return; }
    try {
      // No production endpoint exists in this branch. The adapter is test-only and receives synthetic data in tests.
      const result = await testAdapter({ name:form.elements.name.value.trim(), email:form.elements.email.value.trim(), language:locale, consentCapture:true });
      if (!result || result.ok !== true) throw new Error('request_failed');
      capture('landing_lead_capture_succeeded', { duplicate:Boolean(result.duplicate) }); form.hidden = true; success.hidden = false; success.querySelector('.lead-open').focus({ preventScroll:true });
    } catch { statusMessage(copy.unavailable); capture('landing_lead_capture_failed', { error_type:'request_failed' }); }
  });
  section.querySelector('.lead-open').addEventListener('click', () => capture('landing_lead_magnet_opened'));
  section.querySelector(`a[href="${trialUrl}"]`).addEventListener('click', () => capture('landing_lead_magnet_trial_clicked'));
})();
