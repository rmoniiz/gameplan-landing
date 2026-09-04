(() => {
  'use strict';

  if (document.getElementById('lead-magnet')) return;

  const locale = document.documentElement.lang === 'en' ? 'en' : 'pt-BR';
  const isEnglish = locale === 'en';
  const endpoint = 'https://dyhkhnjmnmktpjlqcqej.supabase.co/functions/v1/capture-marketing-lead';
  const leadMagnetId = 'game_model_checklist_v1';
  const analyticsConsentKey = 'gameplan:privacy:analytics-consent:v1';
  const checklistUrl = isEnglish ? 'game-model-checklist.html' : 'checklist-modelo-de-jogo.html';
  const privacyUrl = isEnglish ? 'privacy-en.html' : 'privacy.html';

  const copy = isEnglish ? {
    eyebrow: 'Free coaching resource',
    title: 'Is your Game Model clear enough to reach the pitch?',
    text: 'Use a practical 10-point checklist to review whether your idea is connected to observable behaviours, training decisions and match evidence.',
    bullets: ['Game idea and priorities', 'With and without the ball', 'Transitions and observable behaviours', 'Training connection and match evidence'],
    name: 'Name', email: 'Email', namePlaceholder: 'Your name', emailPlaceholder: 'you@example.com',
    consent: 'I agree that GamePlan may store my name, email, language and source information to deliver this checklist. I can withdraw this consent at any time.',
    privacy: 'Privacy Policy', submit: 'Get the free checklist', submitting: 'Releasing checklist…',
    successTitle: 'Checklist unlocked.', successText: 'Your details were saved securely for this request. No GamePlan account was created.', open: 'Open checklist',
    error: 'We could not save your request. Please review the fields and try again.', consentError: 'Please confirm the consent required to receive the checklist.',
    note: 'Immediate access. No payment required.',
  } : {
    eyebrow: 'Material gratuito para treinadores',
    title: 'Seu Modelo de Jogo está claro o suficiente para chegar ao campo?',
    text: 'Use um checklist prático de 10 pontos para revisar se a sua ideia está conectada a comportamentos observáveis, decisões de treino e evidências da partida.',
    bullets: ['Ideia de jogo e prioridades', 'Com bola e sem bola', 'Transições e comportamentos observáveis', 'Conexão com treino e evidências da partida'],
    name: 'Nome', email: 'E-mail', namePlaceholder: 'Seu nome', emailPlaceholder: 'voce@exemplo.com',
    consent: 'Concordo que o GamePlan armazene meu nome, e-mail, idioma e informações de origem para entregar este checklist. Posso retirar esse consentimento a qualquer momento.',
    privacy: 'Política de Privacidade', submit: 'Receber checklist gratuito', submitting: 'Liberando checklist…',
    successTitle: 'Checklist liberado.', successText: 'Seus dados foram armazenados com segurança para esta solicitação. Nenhuma conta do GamePlan foi criada.', open: 'Abrir checklist',
    error: 'Não foi possível salvar sua solicitação. Revise os campos e tente novamente.', consentError: 'Confirme o consentimento necessário para receber o checklist.',
    note: 'Acesso imediato. Nenhum pagamento é necessário.',
  };

  const section = document.createElement('section');
  section.id = 'lead-magnet';
  section.className = 'section lead-magnet-section';
  section.innerHTML = `
    <div class="lead-magnet-shell glass">
      <div class="lead-magnet-copy">
        <div class="eyebrow">${copy.eyebrow}</div>
        <h2>${copy.title}</h2>
        <p>${copy.text}</p>
        <ul class="lead-magnet-benefits">${copy.bullets.map((item) => `<li>${item}</li>`).join('')}</ul>
        <p class="lead-magnet-note">${copy.note}</p>
      </div>
      <div class="lead-magnet-form-wrap">
        <form class="lead-magnet-form" novalidate>
          <div class="lead-field">
            <label for="leadName">${copy.name}</label>
            <input id="leadName" name="name" type="text" autocomplete="name" minlength="2" maxlength="120" required placeholder="${copy.namePlaceholder}" />
          </div>
          <div class="lead-field">
            <label for="leadEmail">${copy.email}</label>
            <input id="leadEmail" name="email" type="email" autocomplete="email" maxlength="320" required placeholder="${copy.emailPlaceholder}" />
          </div>
          <div class="lead-honeypot" aria-hidden="true">
            <label for="leadCompany">Company</label><input id="leadCompany" name="company" type="text" tabindex="-1" autocomplete="off" />
          </div>
          <label class="lead-consent">
            <input name="consent" type="checkbox" required />
            <span>${copy.consent} <a href="${privacyUrl}">${copy.privacy}</a>.</span>
          </label>
          <button class="btn btn-primary btn-large lead-submit" type="submit">${copy.submit}</button>
          <p class="lead-form-status" role="status" aria-live="polite"></p>
        </form>
        <div class="lead-success" hidden>
          <span class="lead-success-mark" aria-hidden="true">✓</span>
          <h3>${copy.successTitle}</h3>
          <p>${copy.successText}</p>
          <a class="btn btn-primary btn-large lead-open" href="${checklistUrl}">${copy.open}</a>
        </div>
      </div>
    </div>`;

  const feedback = document.getElementById('feedback');
  const main = document.querySelector('main');
  if (feedback?.parentNode) feedback.parentNode.insertBefore(section, feedback);
  else main?.appendChild(section);

  const capture = (eventName, properties = {}) => {
    try {
      if (localStorage.getItem(analyticsConsentKey) !== 'granted') return;
      window.posthog?.capture?.(eventName, { language: locale, lead_magnet_id: leadMagnetId, source: 'landing', ...properties });
    } catch { /* analytics is optional */ }
  };

  let viewed = false;
  const observer = new IntersectionObserver((entries) => {
    if (!viewed && entries.some((entry) => entry.isIntersecting)) {
      viewed = true;
      capture('landing_lead_magnet_viewed');
      observer.disconnect();
    }
  }, { threshold: 0.35 });
  observer.observe(section);

  const form = section.querySelector('.lead-magnet-form');
  const success = section.querySelector('.lead-success');
  const submit = section.querySelector('.lead-submit');
  const status = section.querySelector('.lead-form-status');
  const open = section.querySelector('.lead-open');

  open?.addEventListener('click', () => capture('landing_lead_magnet_opened'));

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    if (!form.checkValidity()) {
      form.reportValidity();
      if (!form.elements.consent.checked) status.textContent = copy.consentError;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      company: form.elements.company.value,
      language: locale,
      consentCapture: form.elements.consent.checked,
      utmSource: params.get('utm_source') || null,
      utmMedium: params.get('utm_medium') || null,
      utmCampaign: params.get('utm_campaign') || null,
    };

    capture('landing_lead_capture_submitted');
    submit.disabled = true;
    submit.textContent = copy.submitting;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'request_failed');
      capture('landing_lead_capture_succeeded', { duplicate: Boolean(result.duplicate) });
      form.hidden = true;
      success.hidden = false;
      success.querySelector('a')?.focus({ preventScroll: true });
    } catch (error) {
      const safeType = ['invalid_name', 'invalid_email', 'invalid_language', 'consent_required', 'origin_not_allowed', 'storage_error'].includes(error?.message) ? error.message : 'request_failed';
      capture('landing_lead_capture_failed', { error_type: safeType });
      status.textContent = copy.error;
      submit.disabled = false;
      submit.textContent = copy.submit;
    }
  });
})();