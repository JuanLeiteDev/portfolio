const projects = [
    {
        title: "FinTrack — Gestor de Finanças Pessoais",
        description: "Aplicação web para registo e acompanhamento de transações financeiras com CRUD completo.",
        tags: ["Flask", "JavaScript", "Docker"],
        links: [
            {
                label: "Código",
                href: "https://github.com/JuanLeiteDev/fintrack",
                icon: "fa-solid fa-code",
            },
        ],
    },
    {
        title: "Mini-shell",
        description: "Sistema de gestão de ficheiros com interpretador e comandos totalmente personalizados.",
        tags: ["C", "Docker", "Makefile"],
        links: [
            {
                label: "Código",
                href: "https://github.com/JuanLeiteDev/mini-shell-file-system",
                icon: "fa-solid fa-code",
            },
        ],
    },
    {
        title: "Análise de Ficheiros PS2",
        description: "Gera arquivos PS2 através de dados em ficheiros e os analisa em uma Dashboard.",
        tags: ["Python", "C", "Makefile"],
        links: [
            {
                label: "Código",
                href: "https://github.com/JuanLeiteDev/ProjetoPS2",
                icon: "fa-solid fa-code",
            },
        ],
    },
];

function createProjectLink({ label, href, icon }) {
    const link = document.createElement("a");
    const linkIcon = document.createElement("i");

    link.className = "link-projeto";
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener";

    linkIcon.className = icon;
    linkIcon.setAttribute("aria-hidden", "true");

    link.append(linkIcon, document.createTextNode(label));

    return link;
}

function createProjectCard(project) {
    const card = document.createElement("article");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const tags = document.createElement("div");
    const links = document.createElement("div");

    card.className = "projeto-card";
    tags.className = "tags";
    links.className = "projeto-links";

    title.textContent = project.title;
    description.textContent = project.description;

    project.tags.forEach((tag) => {
        const tagElement = document.createElement("span");

        tagElement.className = "tag";
        tagElement.textContent = tag;
        tags.append(tagElement);
    });

    project.links.forEach((link) => {
        links.append(createProjectLink(link));
    });

    card.append(title, description, tags, links);

    return card;
}

export function initProjects() {
    const projectsList = document.querySelector("[data-projects-list]");

    if (!projectsList) return;

    const fragment = document.createDocumentFragment();

    projects.forEach((project) => {
        fragment.append(createProjectCard(project));
    });

    projectsList.replaceChildren(fragment);
}
