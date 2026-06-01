import { getElements } from "./dom.js";

async function fetchPartial(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Não foi possível carregar o partial: ${path}`);
    }

    return response.text();
}

function createFragment(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.cloneNode(true);
}

export async function loadHtmlPartials() {
    const placeholders = getElements("[data-include]");

    await Promise.all(
        placeholders.map(async (placeholder) => {
            const partialPath = placeholder.dataset.include;
            const partialHtml = await fetchPartial(partialPath);
            placeholder.replaceWith(createFragment(partialHtml));
        }),
    );
}
