(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.getElementById("primaryNav");
  const languageButton = document.getElementById("languageButton");
  const languageMenu = document.getElementById("languageMenu");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hideLoader = () => {
    const loader = document.getElementById("loader");
    if (!loader || loader.classList.contains("hidden")) return;
    loader.classList.add("hidden");
    window.setTimeout(() => loader.remove(), prefersReducedMotion ? 0 : 450);
  };

  window.addEventListener(
    "load",
    () => window.setTimeout(hideLoader, prefersReducedMotion ? 0 : 380),
    { once: true }
  );
  window.setTimeout(hideLoader, 2600);

  const closeMobileMenu = ({ restoreFocus = false } = {}) => {
    if (!header || !menuToggle) return;
    header.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-locked");
    if (restoreFocus) menuToggle.focus();
  };

  if (header && menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      body.classList.toggle("menu-locked", isOpen);
    });

    primaryNav?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMobileMenu());
    });
  }

  const closeLanguageMenu = ({ restoreFocus = false } = {}) => {
    if (!languageButton || !languageMenu) return;
    languageMenu.classList.remove("open");
    languageButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) languageButton.focus();
  };

  if (languageButton && languageMenu) {
    const languageOptions = [...languageMenu.querySelectorAll("a")];

    languageButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = languageMenu.classList.toggle("open");
      languageButton.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) languageOptions[0]?.focus();
    });

    languageButton.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
      event.preventDefault();
      languageMenu.classList.add("open");
      languageButton.setAttribute("aria-expanded", "true");
      languageOptions[0]?.focus();
    });

    languageMenu.addEventListener("keydown", (event) => {
      const currentIndex = languageOptions.indexOf(document.activeElement);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        languageOptions[(currentIndex + 1) % languageOptions.length]?.focus();
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        languageOptions[(currentIndex - 1 + languageOptions.length) % languageOptions.length]?.focus();
      }
      if (event.key === "Escape") closeLanguageMenu({ restoreFocus: true });
    });
  }

  document.addEventListener("click", (event) => {
    if (
      languageMenu &&
      languageButton &&
      !languageMenu.contains(event.target) &&
      !languageButton.contains(event.target)
    ) {
      closeLanguageMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeLanguageMenu({ restoreFocus: languageMenu?.classList.contains("open") });
    closeMobileMenu({ restoreFocus: header?.classList.contains("menu-open") });
  });

  const revealElements = [...document.querySelectorAll(".reveal")];
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          activeObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    revealElements.forEach((element) => observer.observe(element));
  }

  const capture = (eventName, properties = {}) => {
    if (!eventName || !window.posthog?.capture) return;
    window.posthog.capture(eventName, {
      page_language: root.lang || "unknown",
      page_path: window.location.pathname,
      ...properties,
    });
  };

  document.querySelectorAll("[data-ph-event]").forEach((element) => {
    element.addEventListener("click", () => {
      capture(element.dataset.phEvent, {
        interaction_location: element.dataset.phLocation || "unknown",
        interaction_label: element.textContent.trim().replace(/\s+/g, " ").slice(0, 120),
        destination: element.getAttribute("href") || undefined,
      });
    });
  });

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
