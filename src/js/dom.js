export function getElement(selector, parent = document) {
    return parent.querySelector(selector);
}

export function getElements(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}
