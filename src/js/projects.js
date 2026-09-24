const projects = [
    {
        title: "Analisador de Logs",
        category: "Profissional",
        status: "Ferramenta interna",
        description:
            "Ferramenta desenvolvida em Python para processar e organizar grandes volumes de logs. Uma dashboard apresenta os resultados para apoiar a investigação do comportamento de equipamentos e a tomada de decisão.",
        highlight: "Mais de 10.000 ficheiros e 5.000.000 de linhas processados em minutos.",
        tags: ["Python", "Automação", "Análise de dados", "Troubleshooting"],
        availability: "Código interno · não disponibilizado",
        links: [],
    },
    {
        title: "XI.Support",
        category: "Pessoal",
        status: "Em desenvolvimento",
        description:
            "Projeto pessoal de um sistema de tickets para estudar e aplicar arquitetura de APIs, gestão de utilizadores, autenticação e persistência relacional. O desenvolvimento explora JWT, 2FA/TOTP, passkeys e gestão de anexos.",
        tags: [
            "Python",
            "FastAPI",
            "SQLAlchemy",
            "Pydantic",
            "Alembic",
            "PostgreSQL",
            "Redis",
            "MinIO",
            "Docker",
            "pytest",
        ],
        availability: "Repositório privado",
        links: [],
    },
    {
        title: "Sistema Interno de Gestão de Reparações",
        category: "Profissional",
        status: "Em desenvolvimento",
        description:
            "Sistema interno em desenvolvimento para centralizar registos de reparações e manutenção. Trabalha a organização de estados, intervenções e checklists, com o objetivo de tornar o processo mais organizado e rastreável.",
        tags: ["Python", "FastAPI", "SQLAlchemy", "Pydantic", "PostgreSQL", "Docker"],
        availability: "Sistema interno · código não disponibilizado",
        links: [],
    },
    {
        title: "Mini Shell & File System",
        category: "Académico",
        status: "Repositório público",
        description:
            "Projeto de Sistemas Operativos em C com comandos de manipulação de ficheiros e chamadas POSIX. Inclui gestão de processos com fork, exec e wait, redirecionamento de entrada e saída e pipes.",
        tags: ["C", "POSIX API", "Makefile", "Docker"],
        links: [{ label: "Ver código", href: "https://github.com/JuanLeiteDev/mini-shell-file-system" }],
    },
];

const archive = [
    {
        title: "FastAPI — estudo de autenticação",
        category: "Estudo",
        status: "Repositório público",
        description:
            "Estudo público com API e interface para registo, início de sessão e configuração de 2FA com códigos de recuperação, conforme descrito no README do projeto.",
        tags: ["Python", "FastAPI", "Autenticação", "2FA"],
        links: [{ label: "Ver código", href: "https://github.com/JuanLeiteDev/FastAPI" }],
    },
    {
        title: "FinTrack — Finanças Pessoais",
        category: "Pessoal",
        status: "Projeto anterior",
        description:
            "Aplicação web para registo e acompanhamento de transações financeiras. Faz parte do meu percurso anterior em desenvolvimento web com Python.",
        tags: ["Python", "Flask", "JavaScript", "Docker"],
        links: [{ label: "Ver código", href: "https://github.com/JuanLeiteDev/fintrack" }],
    },
    {
        title: "Análise de Ficheiros PS2",
        category: "Académico",
        status: "Repositório público",
        description:
            "Projeto académico de geração de ficheiros PS2 em C, com validação de dados e visualização de métricas em Python.",
        tags: ["Python", "C", "Makefile"],
        links: [{ label: "Ver código", href: "https://github.com/JuanLeiteDev/ProjetoPS2" }],
    },
];

function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
}

function createProjectCard(project) {
    const card = element("article", "projeto-card");
    const meta = element("div", "projeto-meta");
    meta.append(
        element("span", "projeto-categoria", project.category),
        element("span", "projeto-status", project.status),
    );
    card.append(
        meta,
        element("h3", "", project.title),
        element("p", "projeto-descricao", project.description),
    );

    if (project.highlight) card.append(element("p", "projeto-destaque", project.highlight));

    const tags = element("div", "tags");
    project.tags.forEach((tag) => tags.append(element("span", "tag", tag)));
    card.append(tags);

    const links = element("div", "projeto-links");
    project.links.forEach(({ label, href }) => {
        const link = element("a", "link-projeto");
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `${label}: ${project.title}`);
        const icon = element("i", "fa-brands fa-github");
        icon.setAttribute("aria-hidden", "true");
        link.append(icon, document.createTextNode(label));
        links.append(link);
    });
    if (project.availability) links.append(element("span", "projeto-disponibilidade", project.availability));
    card.append(links);
    return card;
}

export function initProjects() {
    document.querySelectorAll("[data-projects-list]").forEach((list) => {
        const entries = list.dataset.projectsList === "archive" ? archive : projects;
        list.replaceChildren(...entries.map(createProjectCard));
    });
}
