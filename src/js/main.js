import { setupActiveNavigation } from "./animation.js";
import { getElement } from "./dom.js";
import { loadHtmlPartials } from "./html.js";
import { renderProjects } from "./projects.js";
import { setupThemePreference } from "./theme.js";
import { getCurrentYear } from "./utils.js";

function setupFooterYear() {
    const yearElement = getElement("#ano-atual");

    if (yearElement) {
        yearElement.textContent = getCurrentYear();
    }
}

function scrollToInitialHash() {
    if (!window.location.hash) {
        return;
    }

    getElement(window.location.hash)?.scrollIntoView();
}

async function init() {
    setupThemePreference();
    await loadHtmlPartials();
    renderProjects(getElement("[data-projects-list]"));
    setupActiveNavigation();
    setupFooterYear();
    scrollToInitialHash();
}

document.addEventListener("DOMContentLoaded", () => {
    init().catch((error) => {
        console.error(error);
    });
});
