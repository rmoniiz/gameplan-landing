(() => {
  'use strict';

  if (document.getElementById('lead-magnet')) return;

  const locale = document.documentElement.lang === 'en' ? 'en' : 'pt-BR';
  const isEnglish = locale === 'en';
  const leadMagnetId = 'game_model_checklist_v1';
  const analyticsConsentKey = 'gameplan:privacy:analytics-consent:v1';
  const auditedPreviewHost = 'gameplan-landing-git-phase-12-lead-magnet-mvp-rmoniizs-projects.vercel.app';
  const auditedRehearsalRef = 'dyhkhnjmnmktpjlqcqej';
  const auditedRehearsalEndpoint = `https://${auditedRehearsalRef}.${['supabase', 'co'].join('.')}/functions/v1/${['capture', 'marketing', 'lead'].join('-')}`;
  const isAuditedPreview = window.location.hostname === auditedPreviewHost;
  const runtimeConfig = window.__GAMEPLAN_LEAD_CAPTURE_CONFIG__ || (isAuditedPreview
    ? { enabled: true, endpoint: auditedRehearsalEndpoint }
    : {});
  const testAdapter = window.__GAMEPLAN_PHASE12_CAPTURE_TEST_ADAPTER__;
  const captureConfig = Object.freeze({
    enabled: runtimeConfig.enabled === true,
    endpoint: typeof runtimeConfig.endpoint === 'string' ? runtimeConfig.endpoint.trim() : '',
  });
  const hasLiveAdapter = captureConfig.enabled && /^https:\/\/[^\s]+$/.test(captureConfig.endpoint);
  const canSubmit = hasLiveAdapter || typeof testAdapter === 'function';
  const checklistUrl = isEnglish ? 'game-model-checklist.html' : 'checklist-modelo-de-jogo.html';
  const privacyUrl = isEnglish ? 'privacy-en.html' : 'privacy.html';
  const trialUrl = isEnglish
    ? 'https://gameplan-app-zeta.vercel.app/signup?trial=7&lang=en'
    : 'https://gameplan-app-zeta.vercel.app/signup?trial=7&lang=pt-BR';

  const copy = isEnglish ? {
    eyebrow: 'Free coaching resource',
    title: 'Is your Game Model clear enough to reach the pitch?',
    text: 'Use a practical 10-point checklist to review whether your idea connects to observable behaviours, training decisions and match evidence.',
    bullets: ['Game idea and priorities', 'With and without the ball', 'Transitions and observable behaviours', 'Training connection and match evidence'],
    name: 'Name',
    email: 'Email',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@example.com',
    consent: 'I agree that GamePlan may process my name, email, language and request source only to record this request and unlock the checklist, as described in the',
    privacy: 'Privacy Policy',
    submit: 'Get the free checklist',
    submitting: 'Unlocking checklist…',
    unavailable: 'Secure checklist delivery is still being validated. No details have been sent.',
    successTitle: 'Checklist unlocked',
    successText: 'Your request was recorded. No GamePlan account was created.',
    open: 'Open checklist',
    trial: 'Try GamePlan free for 7 days',
    consentError: 'Please confirm the consent required to request the checklist.',
    requestError: 'We could not process your request. Please review the fields and try again.',
    note: 'No payment required. Analytics is optional and is not required to receive the checklist.',
  } : {
    eyebrow: 'Material gratuito para treinadores',
    title: 'Seu Modelo de Jogo está claro o suficiente para chegar ao campo?',
    text: 'Use um checklist prático de 10 pontos para revisar se sua ideia se conecta a comportamentos observáveis, decisões de treino e evidências da partida.',
    bullets: ['Ideia de jogo e prioridades', 'Com bola e sem bola', 'Transições e comportamentos observáveis', 'Conexão com treino e evidências da partida'],
    name: 'Nome',
    email: 'E-mail',
    namePlaceholder: 'Seu nome',
    emailPlaceholder: 'voce@exemplo.com',
    consent: 'Concordo que o GamePlan trate meu nome, e-mail, idioma e origem da solicitação somente para registrar este pedido e liberar o checklist, conforme a',
    privacy: 'Política de Privacidade',
    submit: 'Receber checklist gratuito',
    submitting: 'Liberando checklist…',
    unavailable: 'A entrega segura do checklist ainda está em validação. Nenhum dado foi enviado.',
    successTitle: 'Checklist liberado',
    successText: 'Sua solicitação foi registrada. Nenhuma conta do GamePlan foi criada.',
    open: 'Abrir checklist',
    trial: 'Testar o GamePlan por 7 dias',
    consentError: 'Confirme o consentimento necessário para solicitar o checklist.',
    requestError: 'Não foi possível processar sua solicitação. Revise os campos e tente novamente.',
    note: 'Nenhum pagamento é necessário. Analytics é opcional e não é necessário para receber o checklist.',
  };

  const safeErrorTypes = new Set([
    'invalid_name',
    'invalid_email',
    'invalid_language',
    'consent_required',
    'origin_not_allowed',
    'rate_limited',
    'storage_error',
    'request_timeout',
    'request_failed',
    'integration_unavailable',
    'rejected',
  ]);

  const capture = (eventName, properties = {}) => {
    try {
      if (localStorage.getItem(analyticsConsentKey) !== 'granted') return;
      const safeProperties = {
        page_language: locale,
        lead_magnet_id: leadMagnetId,
        source: 'landing',
      };
      if (eventName === 'landing_lead_capture_succeeded') {
        safeProperties.duplicate = Boolean(properties.duplicate);
      }
      if (eventName === 'landing_lead_capture_failed') {
        safeProperties.error_type = safeErrorTypes.has(properties.error_type)
          ? properties.error_type
          : 'request_failed';
      }
      window.posthog?.capture?.(eventName, safeProperties);
    } catch {
      // Optional analytics must never block access to the page.
    }
  };

  const section = document.createElement('section');
  section.id = 'lead-magnet';
  section.className = 'section lead-magnet-section';
  section.setAttribute('aria-labelledby', 'leadMagnetTitle');
  section.innerHTML = `
    <div class="lead-magnet-shell glass">
      <div class="lead-magnet-copy">
        <div class="eyebrow">${copy.eyebrow}</div>
        <h2 id="leadMagnetTitle">${copy.title}</h2>
        <p>${copy.text}</p>
        <ul class="lead-magnet-benefits">${copy.bullets.map((item) => `<li>${item}</li>`).join('')}</ul>
      </div>
      <div class="lead-magnet-form-wrap">
        <form class="lead-magnet-form" novalidate aria-describedby="leadFormNote leadFormStatus">
          <div class="lead-field">
            <label for="leadName">${copy.name}</label>
            <input id="leadName" name="name" type="text" autocomplete="name" minlength="2" maxlength="120" required placeholder="${copy.namePlaceholder}" />
          </div>
          <div class="lead-field">
            <label for="leadEmail">${copy.email}</label>
            <input id="leadEmail" name="email" type="email" autocomplete="email" maxlength="320" required placeholder="${copy.emailPlaceholder}" />
          </div>
          <div class="lead-honeypot" aria-hidden="true">
            <label for="leadCompany">Company</label>
            <input id="leadCompany" name="company" type="text" tabindex="-1" autocomplete="off" />
          </div>
          <label class="lead-consent">
            <input name="consent" type="checkbox" required />
            <span>${copy.consent} <a href="${privacyUrl}">${copy.privacy}</a>.</span>
          </label>
          <button class="btn btn-primary btn-large lead-submit" type="submit">${copy.submit}</button>
          <p id="leadFormNote" class="lead-magnet-note">${copy.note}</p>
          <p id="leadFormStatus" class="lead-form-status" role="status" aria-live="polite"></p>
        </form>
        <div class="lead-success" hidden tabindex="-1">
          <span class="lead-success-mark" aria-hidden="true">✓</span>
          <h3>${copy.successTitle}</h3>
          <p>${copy.successText}</p>
          <a class="btn btn-primary btn-large lead-open" href="${checklistUrl}">${copy.open}</a>
          <a class="btn btn-ghost lead-trial" href="${trialUrl}">${copy.trial}</a>
        </div>
      </div>
    </div>`;

  const feedback = document.getElementById('feedback');
  const main = document.querySelector('main');
  if (feedback?.parentNode) feedback.parentNode.insertBefore(section, feedback);
  else main?.appendChild(section);

  const form = section.querySelector('.lead-magnet-form');
  const success = section.querySelector('.lead-success');
  const submit = section.querySelector('.lead-submit');
  const status = section.querySelector('.lead-form-status');
  const open = section.querySelector('.lead-open');
  const trial = section.querySelector('.lead-trial');

  const statusMessage = (message, state = 'error') => {
    status.textContent = message;
    status.dataset.state = state;
  };
  const setBusy = (busy) => {
    submit.disabled = busy || !canSubmit;
    submit.textContent = busy ? copy.submitting : copy.submit;
    form.setAttribute('aria-busy', String(busy));
  };
  const campaignValue = (key) => {
    const value = new URLSearchParams(window.location.search).get(key);
    if (!value) return null;
    return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 120) || null;
  };
  const requestCapture = async (payload) => {
    if (typeof testAdapter === 'function') return testAdapter(payload);
    if (!hasLiveAdapter) throw new Error('integration_unavailable');

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(captureConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'request_failed');
      return result;
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error('request_timeout');
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  if ('IntersectionObserver' in window) {
    let viewed = false;
    const observer = new IntersectionObserver((entries) => {
      if (!viewed && entries.some((entry) => entry.isIntersecting)) {
        viewed = true;
        capture('landing_lead_magnet_viewed');
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(section);
  } else {
    capture('landing_lead_magnet_viewed');
  }

  form?.addEventListener('focusin', () => capture('landing_lead_capture_started'), { once: true });
  open?.addEventListener('click', () => capture('landing_lead_magnet_opened'));
  trial?.addEventListener('click', () => capture('landing_lead_magnet_trial_clicked'));

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusMessage('', 'info');

    if (!form.checkValidity()) {
      form.reportValidity();
      if (!form.elements.consent.checked) statusMessage(copy.consentError);
      return;
    }

    if (form.elements.company.value) {
      statusMessage(copy.requestError);
      capture('landing_lead_capture_failed', { error_type: 'rejected' });
      return;
    }

    if (!canSubmit) {
      statusMessage(copy.unavailable, 'info');
      capture('landing_lead_capture_failed', { error_type: 'integration_unavailable' });
      return;
    }

    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      company: '',
      language: locale,
      consentCapture: form.elements.consent.checked,
      utmSource: campaignValue('utm_source'),
      utmMedium: campaignValue('utm_medium'),
      utmCampaign: campaignValue('utm_campaign'),
    };

    capture('landing_lead_capture_submitted');
    setBusy(true);

    try {
      const result = await requestCapture(payload);
      capture('landing_lead_capture_succeeded', { duplicate: Boolean(result.duplicate) });
      form.hidden = true;
      success.hidden = false;
      success.focus({ preventScroll: true });
    } catch (error) {
      const safeType = safeErrorTypes.has(error?.message) ? error.message : 'request_failed';
      capture('landing_lead_capture_failed', { error_type: safeType });
      statusMessage(copy.requestError);
      setBusy(false);
    }
  });

  if (!canSubmit) statusMessage(copy.unavailable, 'info');
  setBusy(false);
})();
