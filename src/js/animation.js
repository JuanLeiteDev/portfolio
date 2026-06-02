import { getElements } from "./dom.js";

const revealSelectors = [
    "main.container > section > .titulo-secao",
    ".sobre-card",
    ".skill-group",
    ".formacao-card",
    ".projeto-card",
    ".contato-intro",
    ".btn-contato",
];

const revealDuration = 560;
const revealDelayStep = 55;
const revealDelayLimit = 260;

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getRevealElements() {
    return getElements(revealSelectors.join(", "));
}

function setupRevealDelay(elements) {
    const sectionIndexes = new Map();

    elements.forEach((element) => {
        const section = element.closest("section");
        const sectionId = section?.id ?? "global";
        const currentIndex = sectionIndexes.get(sectionId) ?? 0;
        const delay = Math.min(currentIndex * revealDelayStep, revealDelayLimit);

        element.style.setProperty("--reveal-delay", `${delay}ms`);
        element.classList.add("reveal-item");
        sectionIndexes.set(sectionId, currentIndex + 1);
    });
}

function clearRevealState(element) {
    window.setTimeout(() => {
        element.classList.remove("reveal-item", "is-visible");
        element.style.removeProperty("--reveal-delay");
    }, revealDuration + parseFloat(element.style.getPropertyValue("--reveal-delay") || 0));
}

function revealElement(element) {
    window.requestAnimationFrame(() => {
        element.classList.add("is-visible");
        clearRevealState(element);
    });
}

export function setupActiveNavigation() {
    const navLinks = getElements("#menu-navegacao a[href^='#']");
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if (!navLinks.length || !sections.length || !("IntersectionObserver" in window)) {
        return;
    }

    const setActiveLink = (sectionId) => {
        navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${sectionId}`);
        });
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        },
        {
            rootMargin: "-35% 0px -55% 0px",
            threshold: 0,
        },
    );

    sections.forEach((section) => observer.observe(section));
}

export function setupScrollReveal() {
    const elements = getRevealElements();

    if (!elements.length || prefersReducedMotion()) {
        return;
    }

    setupRevealDelay(elements);

    if (!("IntersectionObserver" in window)) {
        elements.forEach((element) => clearRevealState(element));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                revealElement(entry.target);
                observer.unobserve(entry.target);
            });
        },
        {
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.15,
        },
    );

    elements.forEach((element) => observer.observe(element));
}
