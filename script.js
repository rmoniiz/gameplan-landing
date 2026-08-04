(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js", "landing-audited");

  const locale = root.lang === "en" ? "en" : "pt-BR";
  const text = locale === "en"
    ? {
        skip: "Skip to main content",
        menuOpen: "Open navigation menu",
        menuClose: "Close navigation menu",
        flow: ["Game model", "Exercise", "Weekly plan", "Match review"],
        preview: "Platform preview",
        copyright: "All rights reserved.",
        demoEyebrow: "Visual walkthrough",
        demoTitle: "See how GamePlan organizes the coaching process",
        demoIntro: "Explore the visual structure that connects the core parts of a coach’s work in one experience.",
        demoAlt: "Preview of the GamePlan main menu",
      }
    : {
        skip: "Pular para o conteúdo principal",
        menuOpen: "Abrir menu de navegação",
        menuClose: "Fechar menu de navegação",
        flow: ["Modelo de jogo", "Exercício", "Plano da semana", "Análise do jogo"],
        preview: "Prévia da plataforma",
        copyright: "Todos os direitos reservados.",
        demoEyebrow: "Demonstração visual",
        demoTitle: "Veja como o GamePlan organiza o processo",
        demoIntro: "Conheça a estrutura visual que reúne as principais partes do trabalho do treinador em uma única experiência.",
        demoAlt: "Prévia do menu principal do GamePlan",
      };

  const addStylesheet = () => {
    if (document.querySelector('link[href="landing-audit.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "landing-audit.css";
    document.head.appendChild(link);
  };

  const ensureMeta = (selector, attributes) => {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement(attributes.tag || "meta");
      document.head.appendChild(element);
    }
    Object.entries(attributes).forEach(([key, value]) => {
      if (key !== "tag") element.setAttribute(key, value);
    });
  };

  const addMetadata = () => {
    ensureMeta('meta[name="robots"]', { name: "robots", content: "index, follow" });
    ensureMeta('meta[name="theme-color"]', { name: "theme-color", content: "#050b22" });
    ensureMeta('meta[name="color-scheme"]', { name: "color-scheme", content: "dark" });
    ensureMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    ensureMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "GamePlan" });
    ensureMeta('meta[property="og:title"]', { property: "og:title", content: document.title });
    ensureMeta('meta[property="og:description"]', {
      property: "og:description",
      content: document.querySelector('meta[name="description"]')?.content || "GamePlan",
    });
    ensureMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary" });
    ensureMeta('link[rel="canonical"]', { tag: "link", rel: "canonical", href: "./" });
    ensureMeta('link[rel="icon"]', { tag: "link", rel: "icon", type: "image/png", href: "assets/images/gameplan-logo.png" });
  };

  const initPostHog = () => {
    if (window.posthog?.__SV) return;
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init("phc_nXxHwxXeVWRu49opsXZx67RBD8hdCxCJSJqpPmTR36fY", {
      api_host: "https://eu.i.posthog.com",
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
    });
  };

  addStylesheet();
  addMetadata();
  initPostHog();

  const body = document.body;
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav");
  const languageButton = document.getElementById("languageButton");
  const languageMenu = document.getElementById("languageMenu");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const skip = document.createElement("a");
  skip.className = "skip-link";
  skip.href = "#top";
  skip.textContent = text.skip;
  body.prepend(skip);

  if (nav) nav.id = "primaryNav";
  let menuToggle = document.getElementById("menuToggle");
  if (header && nav && !menuToggle) {
    menuToggle = document.createElement("button");
    menuToggle.id = "menuToggle";
    menuToggle.type = "button";
    menuToggle.className = "menu-toggle";
    menuToggle.setAttribute("aria-controls", "primaryNav");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", text.menuOpen);
    menuToggle.innerHTML = '<span class="menu-toggle-box" aria-hidden="true"><span></span><span></span><span></span></span>';
    header.querySelector(".brand")?.after(menuToggle);
  }

  const closeMobileMenu = (restoreFocus = false) => {
    if (!header || !menuToggle) return;
    header.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", text.menuOpen);
    body.classList.remove("menu-locked");
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle?.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? text.menuClose : text.menuOpen);
    body.classList.toggle("menu-locked", open);
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMobileMenu()));

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
      const index = options.indexOf(document.activeElement);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        options[(index + 1) % options.length]?.focus();
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        options[(index - 1 + options.length) % options.length]?.focus();
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (languageMenu && languageButton && !languageMenu.contains(event.target) && !languageButton.contains(event.target)) {
      languageMenu.classList.remove("open");
      languageButton.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const languageWasOpen = languageMenu?.classList.contains("open");
    languageMenu?.classList.remove("open");
    languageButton?.setAttribute("aria-expanded", "false");
    if (languageWasOpen) languageButton?.focus();
    closeMobileMenu(header?.classList.contains("menu-open"));
  });

  const heroCopy = document.querySelector(".hero-copy");
  if (heroCopy && !heroCopy.querySelector(".coach-flow")) {
    const flow = document.createElement("div");
    flow.className = "coach-flow";
    flow.setAttribute("aria-label", locale === "en" ? "Coach workflow" : "Fluxo do treinador");
    flow.innerHTML = text.flow.map((item) => `<span>${item}</span>`).join("");
    heroCopy.appendChild(flow);
  }

  const founderImage = document.querySelector(".founder-card img");
  if (founderImage) {
    founderImage.src = "assets/images/renan-founder-updated.png";
    founderImage.loading = "lazy";
    founderImage.decoding = "async";
    founderImage.width = 1122;
    founderImage.height = 1402;
  }

  document.querySelectorAll("img").forEach((image) => {
    image.decoding = "async";
    if (!image.closest(".hero") && !image.closest("#loader")) image.loading = "lazy";
  });

  const demo = document.getElementById("demo");
  if (demo) {
    const eyebrow = demo.querySelector(".eyebrow");
    const title = demo.querySelector("h2");
    const intro = demo.querySelector(".section-heading p");
    if (eyebrow) eyebrow.textContent = text.demoEyebrow;
    if (title) title.textContent = text.demoTitle;
    if (intro) intro.textContent = text.demoIntro;
    const frame = demo.querySelector(".video-frame");
    if (frame) {
      frame.classList.add("demo-visual");
      frame.innerHTML = `<img src="assets/images/home.png" alt="${text.demoAlt}" loading="lazy" decoding="async"><span>${text.preview}</span>`;
    }
  }

  document.querySelectorAll(".timeline h4").forEach((heading) => {
    const replacement = document.createElement("h3");
    replacement.innerHTML = heading.innerHTML;
    heading.replaceWith(replacement);
  });

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.rel = "noopener noreferrer";
  });

  const classifyLink = (link) => {
    const href = link.getAttribute("href") || "";
    if (href.includes("signup?trial=7")) return ["landing_try_platform_clicked", "cta"];
    if (href.includes("/login")) return ["landing_login_clicked", "login"];
    if (href.startsWith("mailto:") || href.includes("wa.me")) return ["landing_contact_clicked", "contact"];
    if (href === "index.html" || href === "en.html") return ["landing_language_selected", "language"];
    return null;
  };

  document.querySelectorAll("a").forEach((link) => {
    const classification = classifyLink(link);
    if (!classification) return;
    link.addEventListener("click", () => {
      window.posthog?.capture?.(classification[0], {
        page_language: locale,
        page_path: window.location.pathname,
        interaction_type: classification[1],
        interaction_label: link.textContent.trim().replace(/\s+/g, " ").slice(0, 120),
        destination: link.href,
      });
    });
  });

  const footer = document.querySelector(".site-footer");
  if (footer && !footer.querySelector(".footer-meta")) {
    const meta = document.createElement("p");
    meta.className = "footer-meta";
    meta.textContent = `© ${new Date().getFullYear()} GamePlan. ${text.copyright}`;
    footer.appendChild(meta);
  }

  const revealElements = [...document.querySelectorAll(".reveal")];
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        activeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    revealElements.forEach((element) => observer.observe(element));
  }

  const hideLoader = () => {
    const loader = document.getElementById("loader");
    if (!loader || loader.classList.contains("hidden")) return;
    loader.classList.add("hidden");
    window.setTimeout(() => loader.remove(), prefersReducedMotion ? 0 : 450);
  };
  window.addEventListener("load", () => window.setTimeout(hideLoader, prefersReducedMotion ? 0 : 380), { once: true });
  window.setTimeout(hideLoader, 2600);
})();
