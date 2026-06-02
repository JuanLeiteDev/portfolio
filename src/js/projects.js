const projects = [
    {
        title: "FinTrack — Gestor de Finanças Pessoais",
        description: "Aplicação web para registo e acompanhamento de transações financeiras com CRUD completo.",
        tags: ["Flask", "JavaScript", "Docker"],
        links: [
            {
                label: "Código",
                href: "https://github.com/JuanLeiteDev/fintrack",
                icon: "code",
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
                icon: "code",
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
                icon: "code",
            },
        ],
    },
];

function createProjectLink(link) {
    const anchor = document.createElement("a");
    anchor.className = "link-projeto";
    anchor.href = link.href;
    anchor.target = "_blank";
    anchor.rel = "noopener";

    const icon = document.createElement("span");
    icon.className = "material-icons";
    icon.textContent = link.icon;

    anchor.append(icon, document.createTextNode(link.label));
    return anchor;
}

function createProjectCard(project) {
    const article = document.createElement("article");
    article.className = "projeto-card";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const description = document.createElement("p");
    description.textContent = project.description;

    const tags = document.createElement("div");
    tags.className = "tags";
    project.tags.forEach((tagName) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = tagName;
        tags.append(tag);
    });

    const links = document.createElement("div");
    links.className = "projeto-links";
    project.links.forEach((link) => {
        links.append(createProjectLink(link));
    });

    article.append(title, description, tags, links);
    return article;
}

export function renderProjects(container) {
    if (!container) {
        return;
    }

    container.replaceChildren(...projects.map(createProjectCard));
}
