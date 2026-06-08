import { initAnimation } from "./animation.js";

function initLoader() {
    const loader = document.querySelector("#page-loader");
  
    if (!loader) return;
  
    setTimeout(() => {
      loader.classList.add("hide");
      document.body.classList.remove("loading");
    }, 1200);
}

function initAboutCardsAccordion() {
    const cards = document.querySelectorAll(".sobre-card");

    if (!cards.length) return;

    cards.forEach((card) => {
        const button = card.querySelector(".sobre-card-toggle");
        const title = card.querySelector("h3")?.textContent?.trim() || "card";

        if (!button) return;

        button.addEventListener("click", () => {
            const isOpen = card.classList.toggle("is-open");
            const icon = button.querySelector("i");

            button.setAttribute("aria-expanded", String(isOpen));
            button.setAttribute("aria-label", `${isOpen ? "Fechar" : "Abrir"} descrição: ${title}`);

            if (!icon) return;

            icon.classList.toggle("fa-chevron-down", !isOpen);
            icon.classList.toggle("fa-chevron-up", isOpen);
        });
    });
}
  
function init() {
    initAnimation();
    initAboutCardsAccordion();
}
  
window.addEventListener("DOMContentLoaded", init);
window.addEventListener("load", initLoader);
