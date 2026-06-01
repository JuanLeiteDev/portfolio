import { setupActiveNavigation } from "./animation.js";
import { getElement } from "./dom.js";
import { renderProjects } from "./projects.js";
import { setupThemePreference } from "./theme.js";
import { getCurrentYear } from "./utils.js";

function setupFooterYear() {
    const yearElement = getElement("#ano-atual");

    if (yearElement) {
        yearElement.textContent = getCurrentYear();
    }
}

function init() {
    setupThemePreference();
    renderProjects(getElement("[data-projects-list]"));
    setupActiveNavigation();
    setupFooterYear();
}

document.addEventListener("DOMContentLoaded", init);
