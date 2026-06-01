import { getElements } from "./dom.js";

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
