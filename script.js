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
