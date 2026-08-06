(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const locale = root.lang === "en" ? "en" : "pt-BR";
  const isEnglish = locale === "en";
  const copy = isEnglish
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

  if (!window.posthog?.__SV) {
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init("phc_nXxHwxXeVWRu49opsXZx67RBD8hdCxCJSJqpPmTR36fY", {
      api_host: "https://eu.i.posthog.com",
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }

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

  const flagMarkup = {
    br: '<svg class="flag-svg" viewBox="0 0 28 20" aria-hidden="true" focusable="false"><rect width="28" height="20" fill="#009c3b"></rect><polygon points="14,2 25,10 14,18 3,10" fill="#ffdf00"></polygon><circle cx="14" cy="10" r="4.2" fill="#002776"></circle><path d="M10.1 10.3c1.9-1.2 5.8-1.3 7.9-.1" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round"></path></svg>',
    us: '<svg class="flag-svg" viewBox="0 0 28 20" aria-hidden="true" focusable="false"><rect width="28" height="20" fill="#ffffff"></rect><path d="M0 0h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28V20H0z" fill="#b22234"></path><rect width="12" height="10.8" fill="#3c3b6e"></rect></svg>'
  };
  const replaceFlag = (element, key) => {
    if (!element) return;
    const template = document.createElement("template");
    template.innerHTML = flagMarkup[key].trim();
    const current = element.querySelector(".flag, .flag-svg");
    if (current) current.replaceWith(template.content.firstElementChild);
  };

  const updateFeatureDescription = (matcher, text) => {
    document.querySelectorAll(".features-grid .feature-card").forEach((card) => {
      const title = card.querySelector("h3")?.textContent?.trim() || "";
      const description = card.querySelector("p");
      if (matcher.test(title) && description) description.textContent = text;
    });
  };

  const applyContentRefinements = () => {
    const connectionCopy = isEnglish
      ? {
          eyebrow: "From the game model to the pitch",
          title: "One connected path for the coach’s decisions",
          description: "GamePlan links the coaching process without imposing one methodology: define the game idea, turn priorities into exercises, organize the plan, follow players and review what appeared in the match.",
          boardLabel: "GamePlan connected coaching process: game model, exercises, planning, players, match and reflection",
          centerAlt: "GamePlan logo",
          centerName: "GamePlan",
          centerLabel: "Connected process",
          cards: {
            a: { number: "01", title: "Game model", text: "Record your idea, principles and observable behaviours." },
            b: { number: "02", title: "Exercises", text: "Turn priorities into your own tasks or ready-made exercises." },
            c: { number: "03", title: "Planning", text: "Distribute objectives and sessions across the week and month." },
            d: { number: "04", title: "Players", text: "Organize the squad and follow development evidence." },
            e: { number: "05", title: "Match", text: "Compare what was planned with what appeared on the pitch." },
          },
          featureText: "Create, save and reuse your own tasks, with a ready-made library to support your planning.",
          aboutTitle: "Built by a coach to give structure to the path from an idea to the pitch."
        }
      : {
          eyebrow: "Do modelo de jogo ao campo",
          title: "Um caminho conectado para as decisões do treinador",
          description: "O GamePlan conecta o processo sem impor uma metodologia: defina a ideia de jogo, transforme prioridades em exercícios, organize o planejamento, acompanhe os atletas e revise o que apareceu na partida.",
          boardLabel: "Processo conectado do GamePlan: modelo de jogo, exercícios, planejamento, atletas, partida e reflexão",
          centerAlt: "Logo do GamePlan",
          centerName: "GamePlan",
          centerLabel: "Processo conectado",
          cards: {
            a: { number: "01", title: "Modelo de jogo", text: "Registre sua ideia, princípios e comportamentos observáveis." },
            b: { number: "02", title: "Exercícios", text: "Transforme prioridades em tarefas próprias ou exercícios prontos." },
            c: { number: "03", title: "Planejamento", text: "Distribua objetivos e sessões na semana e no mês." },
            d: { number: "04", title: "Atletas", text: "Organize o elenco e acompanhe evidências de desenvolvimento." },
            e: { number: "05", title: "Partida", text: "Compare o que foi planejado com o que apareceu em campo." },
          },
          featureText: "Crie, salve e reutilize tarefas próprias, com uma biblioteca pronta para apoiar o planejamento.",
          aboutTitle: "Criado por um treinador para dar estrutura ao caminho entre a ideia e o campo."
        };

    const board = document.querySelector(".connection-board");
    const eyebrow = document.querySelector("#connection .eyebrow");
    const title = document.querySelector("#connection .section-heading h2");
    const description = document.querySelector("#connection .section-heading p");
    if (board) board.setAttribute("aria-label", connectionCopy.boardLabel);
    if (eyebrow) eyebrow.textContent = connectionCopy.eyebrow;
    if (title) title.textContent = connectionCopy.title;
    if (description) description.textContent = connectionCopy.description;

    const center = document.querySelector(".connection-center");
    if (center) {
      center.innerHTML = `<span>${connectionCopy.centerLabel}</span><img class="connection-logo" src="assets/images/gameplan-logo.png" alt="${connectionCopy.centerAlt}" width="72" height="72" /><strong>${connectionCopy.centerName}</strong>`;
    }

    const links = document.querySelector(".connection-links");
    if (links) {
      links.innerHTML = `
        <defs><marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z"></path></marker></defs>
        <path class="flow-main" d="M16 35 H24" marker-end="url(#flow-arrow)"></path>
        <path class="flow-main" d="M36 35 H44" marker-end="url(#flow-arrow)"></path>
        <path class="flow-main" d="M56 35 H64" marker-end="url(#flow-arrow)"></path>
        <path class="flow-main" d="M76 35 H84" marker-end="url(#flow-arrow)"></path>
        <path class="flow-hub" d="M50 47 V66" marker-end="url(#flow-arrow)"></path>
        <path class="flow-feedback" d="M89 47 C86 72 70 78 59 78" marker-end="url(#flow-arrow)"></path>
        <path class="flow-feedback" d="M41 78 C27 78 15 68 11 48" marker-end="url(#flow-arrow)"></path>`;
    }

    Object.entries(connectionCopy.cards).forEach(([key, card]) => {
      const item = document.querySelector(`.item-${key}`);
      if (item) item.innerHTML = `<small>${card.number}</small><strong>${card.title}</strong><span>${card.text}</span>`;
    });

    updateFeatureDescription(isEnglish ? /exercise database|exercises/i : /banco de exercícios/i, connectionCopy.featureText);
    const aboutTitle = document.querySelector("#about .about-copy h2");
    if (aboutTitle) aboutTitle.textContent = connectionCopy.aboutTitle;

    replaceFlag(languageButton, isEnglish ? "us" : "br");
    languageMenu?.querySelectorAll(".language-option").forEach((option) => replaceFlag(option, (option.getAttribute("href") || "").includes("en") ? "us" : "br"));
  };

  const replaceListItems = (list, items) => {
    if (!list) return;
    list.replaceChildren(...items.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }));
  };

  const applyPlanCopy = () => {
    const [starterCard, proCard] = document.querySelectorAll("#pricing .price-card");
    if (!starterCard || !proCard) return;
    const planCopy = isEnglish
      ? {
          starterPrice: "€9.99", starterInterval: "/ month",
          starterDescription: "For coaches who want to organize exercises, squad information and planning in one reliable routine.",
          starterFeatures: ["Weekly planning", "Monthly planning", "Exercise database", "Player registration and squad organization"],
          proPrice: "€19.99", proInterval: "/ month",
          proDescription: "For coaches who want the complete connection between methodology, player development and match review.",
          proFeatures: ["Everything in Starter", "Game Model & Methodology", "Player development", "Tactical test", "Match statistics", "AI-assisted insights reviewed by the coach"],
        }
      : {
          starterPrice: "€9,99", starterInterval: "/ mês",
          starterDescription: "Para treinadores que querem organizar exercícios, elenco e planejamento em uma rotina confiável.",
          starterFeatures: ["Planejamento semanal", "Planejamento mensal", "Banco de exercícios", "Cadastro e organização do elenco"],
          proPrice: "€19,99", proInterval: "/ mês",
          proDescription: "Para treinadores que querem conectar metodologia, desenvolvimento dos atletas e revisão da partida.",
          proFeatures: ["Tudo do Starter", "Modelo de Jogo & Metodologia", "Desenvolvimento dos atletas", "Teste tático", "Estatísticas da partida", "Insights com apoio de IA revisados pelo treinador"],
        };
    const starterPrice = starterCard.querySelector("h3");
    const starterDescription = starterCard.querySelector(":scope > p");
    const proPrice = proCard.querySelector("h3");
    const proDescription = proCard.querySelector(":scope > p");
    if (starterPrice) starterPrice.innerHTML = `${planCopy.starterPrice} <span>${planCopy.starterInterval}</span>`;
    if (starterDescription) starterDescription.textContent = planCopy.starterDescription;
    if (proPrice) proPrice.innerHTML = `${planCopy.proPrice} <span>${planCopy.proInterval}</span>`;
    if (proDescription) proDescription.textContent = planCopy.proDescription;
    replaceListItems(starterCard.querySelector("ul"), planCopy.starterFeatures);
    replaceListItems(proCard.querySelector("ul"), planCopy.proFeatures);
  };

  applyContentRefinements();
  applyPlanCopy();

  const eventFor = (href) => {
    if (href.includes("signup?trial=7") || href.includes("lang=pt-BR") || href.includes("lang=en")) return ["landing_try_platform_clicked", "cta"];
    if (href.includes("/login")) return ["landing_login_clicked", "login"];
    if (href.startsWith("mailto:") || href.includes("wa.me")) return ["landing_contact_clicked", "contact"];
    if (href.endsWith("index.html") || href.endsWith("en.html")) return ["landing_language_selected", "language"];
    return null;
  };
  document.querySelectorAll("a").forEach((link) => {
    const event = eventFor(link.getAttribute("href") || "");
    if (!event) return;
    link.addEventListener("click", () => window.posthog?.capture?.(event[0], {
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