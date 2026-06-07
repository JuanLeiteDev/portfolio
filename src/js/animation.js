const selectorsReveal = [
    ["#menu-navegacao li", "reveal-header"],
    ["#hero", "reveal section-observer"],
    ["#sobre", "reveal section-observer"],
    ["#skills", "reveal section-observer"],
    ["#formacoes", "reveal section-observer"],
    ["#projetos", "reveal section-observer"],
    ["#contato", "reveal section-observer"],
    [".hero-tagline", "reveal-tagline"],
    [".skill-item", "reveal-skill"],
];
  
function getElements(arrSelector, parent = document) {
    if (!arrSelector || arrSelector.length === 0) return [];

    const elements = arrSelector.map((selector) => {
        return [...parent.querySelectorAll(selector)];
    });

    return elements;
}
  
function addClass(arrElements, arrClasses) {
    if (!arrElements || arrElements.length === 0) return [];
    if (!arrClasses || arrClasses.length === 0) return [];
    if (arrElements.length !== arrClasses.length) return [];

    arrElements.forEach((elementList, index) => {
        const classes = arrClasses[index].split(" ").filter(Boolean);

        elementList.forEach((element) => {
        element.classList.add(...classes);
        });
    });

    return arrElements;
}
  
function createObserverAnimation() {
    const observerOptions = {
        root: null,
        threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("active");
        });
    }, observerOptions);

    return observer;
}
  
function createObserverSections() {
    const observerOptions = {
        root: null,
        rootMargin: "-35% 0px -50% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const sectionID = entry.target.id;
        const links = document.querySelectorAll("#menu-navegacao a");

        links.forEach((link) => {
            const isCurrentLink = link.getAttribute("href") === `#${sectionID}`;
            link.classList.toggle("active", isCurrentLink);
            });
        });
    }, observerOptions);

    return observer;
}
  
export function initAnimation() {
    const selectors = selectorsReveal.map((item) => item[0] ?? "");
    const animations = selectorsReveal.map((item) => item[1] ?? "");

    const elementsReveal = addClass(getElements(selectors), animations);

    const sections = document.querySelectorAll(".section-observer");

    const observerAnimation = createObserverAnimation();
    const observerSections = createObserverSections();

    setTimeout(() => {
        elementsReveal.forEach((elementList) => {
            elementList.forEach((element) => {
                observerAnimation.observe(element);
            });
        });

        sections.forEach((section) => {
            observerSections.observe(section);
        });
    }, 2500);
}