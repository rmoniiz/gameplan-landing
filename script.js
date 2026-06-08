window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;
  setTimeout(() => loader.classList.add("hidden"), 650);
});

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.14 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("visible"));
}

const languageButton = document.getElementById("languageButton");
const languageMenu = document.getElementById("languageMenu");

if (languageButton && languageMenu) {
  languageButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = languageMenu.classList.toggle("open");
    languageButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    if (!languageMenu.contains(event.target) && !languageButton.contains(event.target)) {
      languageMenu.classList.remove("open");
      languageButton.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      languageMenu.classList.remove("open");
      languageButton.setAttribute("aria-expanded", "false");
    }
  });
}
