(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const locale = root.lang === "en" ? "en" : "pt-BR";
  const copy = locale === "en"
    ? { skip: "Skip to main content", open: "Open navigation menu", close: "Close navigation menu", copyright: "All rights reserved." }
    : { skip: "Pular para o conteúdo principal", open: "Abrir menu de navegação", close: "Fechar menu de navegação", copyright: "Todos os direitos reservados." };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const loadCss = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  };
  loadCss("landing-audit.css");
  loadCss("landing-requested.css");
  loadCss("privacy-consent.css");

  const ensureMeta = (selector, tag, attrs) => {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement(tag);
      document.head.appendChild(element);
    }
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  };
  ensureMeta('meta[name="robots"]', "meta", { name: "robots", content: "index, follow" });
  ensureMeta('meta[name="theme-color"]', "meta", { name: "theme-color", content: "#050b22" });
  ensureMeta('meta[property="og:type"]', "meta", { property: "og:type", content: "website" });
  ensureMeta('meta[property="og:title"]', "meta", { property: "og:title", content: document.title });
  ensureMeta('meta[property="og:description"]', "meta", { property: "og:description", content: document.querySelector('meta[name="description"]')?.content || "GamePlan" });
  ensureMeta('link[rel="icon"]', "link", { rel: "icon", type: "image/png", href: "assets/images/gameplan-logo.png" });

  const CONSENT_KEY = "gameplan:privacy:analytics-consent:v1";
  const CONSENT_GRANTED = "granted";
  const CONSENT_DENIED = "denied";
  const consentCopy = locale === "en"
    ? {
        title: "Privacy choices",
        text: "GamePlan uses essential storage for site preferences. Optional analytics is activated only after your consent and helps us understand how this page is used.",
        accept: "Accept analytics",
        necessary: "Necessary only",
        privacy: "Read the Privacy Policy",
        preferences: "Privacy preferences",
      }
    : {
        title: "Preferências de privacidade",
        text: "O GamePlan usa armazenamento essencial para preferências do site. Analytics opcional só é ativado após o seu consentimento e nos ajuda a entender como esta página é utilizada.",
        accept: "Aceitar analytics",
        necessary: "Somente necessários",
        privacy: "Leia a Política de Privacidade",
        preferences: "Preferências de privacidade",
      };
  const privacyUrl = locale === "en" ? "privacy-en.html" : "privacy.html";
  let consentBanner = null;
  let analyticsLoaded = false;

  const readConsent = () => {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch { return null; }
  };
  const saveConsent = (value) => {
    try { window.localStorage.setItem(CONSENT_KEY, value); } catch { /* preference may remain session-only */ }
  };

  const installPostHog = () => {
    if (analyticsLoaded || window.posthog?.__SV) {
      analyticsLoaded = true;
      return;
    }
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init("phc_nXxHwxXeVWRu49opsXZx67RBD8hdCxCJSJqpPmTR36fY", {
      api_host: "https://eu.i.posthog.com",
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
    });
    analyticsLoaded = true;
  };

  const captureAnalytics = (eventName, properties) => {
    if (readConsent() !== CONSENT_GRANTED || !analyticsLoaded) return;
    window.posthog?.capture?.(eventName, properties);
  };

  const renderConsentBanner = () => {
    if (consentBanner) return consentBanner;
    consentBanner = document.createElement("section");
    consentBanner.className = "privacy-consent";
    consentBanner.setAttribute("role", "dialog");
    consentBanner.setAttribute("aria-modal", "false");
    consentBanner.setAttribute("aria-labelledby", "privacyConsentTitle");
    consentBanner.innerHTML = `
      <h2 id="privacyConsentTitle" class="privacy-consent__title">${consentCopy.title}</h2>
      <p class="privacy-consent__text">${consentCopy.text} <a href="${privacyUrl}">${consentCopy.privacy}</a>.</p>
      <div class="privacy-consent__actions">
        <button type="button" class="privacy-consent__button privacy-consent__button--accept" data-analytics-consent="accept">${consentCopy.accept}</button>
        <button type="button" class="privacy-consent__button privacy-consent__button--necessary" data-analytics-consent="deny">${consentCopy.necessary}</button>
      </div>`;
    body.appendChild(consentBanner);
    return consentBanner;
  };
  const showConsentBanner = () => {
    const banner = renderConsentBanner();
    banner.hidden = false;
    banner.querySelector("button")?.focus({ preventScroll: true });
  };
  const hideConsentBanner = () => { if (consentBanner) consentBanner.hidden = true; };
  const setConsent = (value) => {
    saveConsent(value);
    if (value === CONSENT_GRANTED) {
      installPostHog();
      window.posthog?.opt_in_capturing?.();
    } else if (analyticsLoaded) {
      window.posthog?.reset?.();
      window.posthog?.opt_out_capturing?.();
    }
    hideConsentBanner();
  };

  body.addEventListener("click", (event) => {
    const action = event.target.closest?.("[data-analytics-consent]")?.dataset.analyticsConsent;
    if (action === "accept") setConsent(CONSENT_GRANTED);
    if (action === "deny") setConsent(CONSENT_DENIED);
  });
  if (readConsent() === CONSENT_GRANTED) installPostHog();

  const skip = document.createElement("a");
  skip.className = "skip-link";
  skip.href = "#top";
  skip.textContent = copy.skip;
  body.prepend(skip);

  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav");
  if (nav) nav.id = "primaryNav";
  let menuToggle = document.getElementById("menuToggle");
  if (header && nav && !menuToggle) {
    menuToggle = document.createElement("button");
    menuToggle.id = "menuToggle";
    menuToggle.type = "button";
    menuToggle.className = "menu-toggle";
    menuToggle.setAttribute("aria-controls", "primaryNav");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", copy.open);
    menuToggle.innerHTML = '<span class="menu-toggle-box" aria-hidden="true"><span></span><span></span><span></span></span>';
    header.querySelector(".brand")?.after(menuToggle);
  }

  const closeMenu = (focus = false) => {
    if (!header || !menuToggle) return;
    header.classList.remove("menu-open");
    body.classList.remove("menu-locked");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", copy.open);
    if (focus) menuToggle.focus();
  };
  menuToggle?.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    body.classList.toggle("menu-locked", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? copy.close : copy.open);
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));

  const languageButton = document.getElementById("languageButton");
  const languageMenu = document.getElementById("languageMenu");
  if (languageButton && languageMenu) {
    languageButton.setAttribute("aria-controls", "languageMenu");
    languageMenu.setAttribute("role", "menu");
    const options = [...languageMenu.querySelectorAll("a")];
    options.forEach((option) => option.setAttribute("role", "menuitem"));
    languageButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = languageMenu.classList.toggle("open");
      languageButton.setAttribute("aria-expanded", String(open));
      if (open) options[0]?.focus();
    });
    languageMenu.addEventListener("keydown", (event) => {
      const current = options.indexOf(document.activeElement);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        options[(current + step + options.length) % options.length]?.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!languageMenu.contains(event.target) && !languageButton.contains(event.target)) {
        languageMenu.classList.remove("open");
        languageButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    languageMenu?.classList.remove("open");
    languageButton?.setAttribute("aria-expanded", "false");
    closeMenu(header?.classList.contains("menu-open"));
    if (consentBanner && !consentBanner.hidden) hideConsentBanner();
  });

  document.querySelectorAll("img").forEach((image) => {
    image.decoding = "async";
    if (!image.closest(".hero") && !image.closest("#loader")) image.loading = "lazy";
  });
  document.querySelectorAll(".timeline h4").forEach((heading) => {
    const replacement = document.createElement("h3");
    replacement.innerHTML = heading.innerHTML;
    heading.replaceWith(replacement);
  });
  document.querySelectorAll('a[target="_blank"]').forEach((link) => { link.rel = "noopener noreferrer"; });

  const svgMarkup = {
    br: '<svg class="flag-svg" viewBox="0 0 28 20" aria-hidden="true" focusable="false"><rect width="28" height="20" fill="#009c3b"></rect><polygon points="14,2 25,10 14,18 3,10" fill="#ffdf00"></polygon><circle cx="14" cy="10" r="4.2" fill="#002776"></circle><path d="M10.1 10.3c1.9-1.2 5.8-1.3 7.9-.1" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round"></path></svg>',
    us: '<svg class="flag-svg" viewBox="0 0 28 20" aria-hidden="true" focusable="false"><rect width="28" height="20" fill="#ffffff"></rect><path d="M0 0h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28V20H0z" fill="#b22234"></path><rect width="12" height="10.8" fill="#3c3b6e"></rect><g fill="#ffffff"><circle cx="2" cy="2" r="0.6"></circle><circle cx="4.4" cy="2" r="0.6"></circle><circle cx="6.8" cy="2" r="0.6"></circle><circle cx="9.2" cy="2" r="0.6"></circle><circle cx="11" cy="3.6" r="0.6"></circle><circle cx="8.6" cy="3.6" r="0.6"></circle><circle cx="6.2" cy="3.6" r="0.6"></circle><circle cx="3.8" cy="3.6" r="0.6"></circle><circle cx="2" cy="5.2" r="0.6"></circle><circle cx="4.4" cy="5.2" r="0.6"></circle><circle cx="6.8" cy="5.2" r="0.6"></circle><circle cx="9.2" cy="5.2" r="0.6"></circle><circle cx="11" cy="6.8" r="0.6"></circle><circle cx="8.6" cy="6.8" r="0.6"></circle><circle cx="6.2" cy="6.8" r="0.6"></circle><circle cx="3.8" cy="6.8" r="0.6"></circle><circle cx="2" cy="8.4" r="0.6"></circle><circle cx="4.4" cy="8.4" r="0.6"></circle><circle cx="6.8" cy="8.4" r="0.6"></circle><circle cx="9.2" cy="8.4" r="0.6"></circle></g></svg>'
  };
  const createFlagSvg = (key) => {
    const template = document.createElement("template");
    template.innerHTML = svgMarkup[key].trim();
    return template.content.firstElementChild;
  };
  const replaceFlag = (element, key) => {
    if (!element) return;
    const current = element.querySelector(".flag, .flag-svg");
    const nextFlag = createFlagSvg(key);
    if (current) current.replaceWith(nextFlag);
    else element.prepend(nextFlag);
  };
  const updateFeatureDescription = (matcher, text) => {
    document.querySelectorAll(".features-grid .feature-card").forEach((card) => {
      const title = card.querySelector("h3")?.textContent?.trim() || "";
      if (!matcher.test(title)) return;
      const description = card.querySelector("p");
      if (description) description.textContent = text;
    });
  };

  const applyRequestedContentRefinements = () => {
    const isEnglish = locale === "en";
    const connectionCopy = isEnglish
      ? {
          eyebrow: "How it connects",
          title: "Five areas, one connected coaching routine",
          description: "Game model, exercises, planning, players and match review stop working as separate pieces. All five connect directly to GamePlan, making the path from the idea to the pitch easier to follow.",
          centerAlt: "GamePlan logo",
          centerName: "GamePlan",
          cards: {
            a: { number: "01", title: "Game model", text: "Principles and behaviours behind your game idea." },
            b: { number: "02", title: "Exercises", text: "Your own tasks plus ready-made exercises." },
            c: { number: "03", title: "Planning", text: "Weekly and monthly goals and sessions." },
            d: { number: "04", title: "Players", text: "Observations, evaluations and individual progress." },
            e: { number: "05", title: "Match", text: "Indicators to review what appeared on the pitch." },
          },
          featureText: "Create, save and reuse tasks with a library of ready-made exercises.",
          aboutTitle: "Built to help coaches turn their game idea into a clear process."
        }
      : {
          eyebrow: "Como tudo se conecta",
          title: "Cinco áreas, uma rotina conectada",
          description: "Modelo de jogo, exercícios, planejamento, atletas e partida deixam de funcionar como partes separadas. Os cinco pontos se conectam diretamente ao GamePlan, deixando mais claro o caminho entre a ideia, o treino e o que aparece em campo.",
          centerAlt: "Logo do GamePlan",
          centerName: "GamePlan",
          cards: {
            a: { number: "01", title: "Modelo de jogo", text: "Princípios e comportamentos da sua ideia de jogo." },
            b: { number: "02", title: "Exercícios", text: "Tarefas próprias e exercícios prontos para usar." },
            c: { number: "03", title: "Planejamento", text: "Objetivos e sessões da semana e do mês." },
            d: { number: "04", title: "Atletas", text: "Observações, avaliações e evolução individual." },
            e: { number: "05", title: "Partida", text: "Indicadores para revisar o que apareceu em campo." },
          },
          featureText: "Crie, salve e reutilize tarefas com uma biblioteca de exercícios prontos.",
          aboutTitle: "Criado para ajudar o treinador a transformar sua ideia de jogo em um processo claro."
        };

    const eyebrow = document.querySelector("#connection .eyebrow");
    const connectionTitle = document.querySelector("#connection .section-heading h2");
    const connectionDescription = document.querySelector("#connection .section-heading p");
    if (eyebrow) eyebrow.textContent = connectionCopy.eyebrow;
    if (connectionTitle) connectionTitle.textContent = connectionCopy.title;
    if (connectionDescription) connectionDescription.textContent = connectionCopy.description;

    const center = document.querySelector(".connection-center");
    if (center) center.innerHTML = `<img class="connection-logo" src="assets/images/gameplan-logo.png" alt="${connectionCopy.centerAlt}" width="72" height="72" /><strong>${connectionCopy.centerName}</strong>`;
    const links = document.querySelector(".connection-links");
    if (links) links.innerHTML = `<line x1="50" y1="50" x2="50" y2="18"></line><line x1="50" y1="50" x2="12.5" y2="82"></line><line x1="50" y1="50" x2="37.5" y2="82"></line><line x1="50" y1="50" x2="62.5" y2="82"></line><line x1="50" y1="50" x2="87.5" y2="82"></line><circle cx="50" cy="50" r="1.25"></circle>`;

    Object.entries(connectionCopy.cards).forEach(([key, card]) => {
      const item = document.querySelector(`.item-${key}`);
      if (item) item.innerHTML = `<small>${card.number}</small><strong>${card.title}</strong><span>${card.text}</span>`;
    });
    updateFeatureDescription(isEnglish ? /exercise database|exercises/i : /banco de exercícios/i, connectionCopy.featureText);
    const aboutTitle = document.querySelector("#about .about-copy h2");
    if (aboutTitle) aboutTitle.textContent = connectionCopy.aboutTitle;
    replaceFlag(languageButton, isEnglish ? "us" : "br");
    languageMenu?.querySelectorAll(".language-option").forEach((option) => {
      replaceFlag(option, (option.getAttribute("href") || "").includes("en") ? "us" : "br");
    });
  };
  applyRequestedContentRefinements();

  const eventFor = (href) => {
    if (href.includes("signup?trial=7")) return ["landing_try_platform_clicked", "cta"];
    if (href.includes("/login")) return ["landing_login_clicked", "login"];
    if (href.startsWith("mailto:") || href.includes("wa.me")) return ["landing_contact_clicked", "contact"];
    if (href.endsWith("index.html") || href.endsWith("en.html")) return ["landing_language_selected", "language"];
    return null;
  };
  document.querySelectorAll("a").forEach((link) => {
    const event = eventFor(link.getAttribute("href") || "");
    if (!event) return;
    link.addEventListener("click", () => captureAnalytics(event[0], {
      page_language: locale,
      page_path: location.pathname,
      interaction_type: event[1],
      interaction_label: link.textContent.trim().replace(/\s+/g, " ").slice(0, 120),
      destination: link.href,
    }));
  });

  const footer = document.querySelector(".site-footer");
  if (footer && !footer.querySelector(".footer-meta")) {
    const meta = document.createElement("p");
    meta.className = "footer-meta";
    meta.textContent = `© ${new Date().getFullYear()} GamePlan. ${copy.copyright}`;
    footer.appendChild(meta);
  }
  const footerLinks = document.querySelector(".footer-links");
  if (footerLinks && !footerLinks.querySelector(".privacy-preferences-link")) {
    const preferences = document.createElement("button");
    preferences.type = "button";
    preferences.className = "privacy-preferences-link";
    preferences.textContent = consentCopy.preferences;
    preferences.addEventListener("click", showConsentBanner);
    footerLinks.appendChild(preferences);
  }

  if (readConsent() !== CONSENT_GRANTED && readConsent() !== CONSENT_DENIED) showConsentBanner();

  const revealElements = [...document.querySelectorAll(".reveal")];
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver((entries, activeObserver) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      activeObserver.unobserve(entry.target);
    }), { threshold: .08, rootMargin: "0px 0px -6% 0px" });
    revealElements.forEach((element) => observer.observe(element));
  }

  const hideLoader = () => {
    const loader = document.getElementById("loader");
    if (!loader || loader.classList.contains("hidden")) return;
    loader.classList.add("hidden");
    window.setTimeout(() => loader.remove(), reducedMotion ? 0 : 450);
  };
  window.addEventListener("load", () => window.setTimeout(hideLoader, reducedMotion ? 0 : 380), { once: true });
  window.setTimeout(hideLoader, 2600);
})();