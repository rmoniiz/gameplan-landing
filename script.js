window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;
  setTimeout(() => loader.classList.add("hidden"), 650);
});

const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.14 }
);
revealElements.forEach((el) => observer.observe(el));

const tabButtons = document.querySelectorAll(".tab-btn");
const previewImage = document.getElementById("preview-image");
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetImage = button.dataset.image;
    if (!previewImage || !targetImage) return;
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    previewImage.style.opacity = "0";
    setTimeout(() => {
      previewImage.src = targetImage;
      previewImage.style.opacity = "1";
    }, 180);
  });
});

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
}
