import type { L } from '@/i18n';

/**
 * Editorial content for the home page.
 * Sources: docs/01-identidade-profissional.md, docs/cv.pdf.
 *
 * Content model (revised after Juan's review, 20/11/2026): little text on
 * screen. Every item has a short visible keyword/title and, at most, a
 * one-line summary (`hint`) that is revealed on hover/focus (desktop) or tap
 * (touch). Depth lives in the case-study pages.
 * Every number shown is a documented fact; nothing is decorative.
 */

/* ------------------------------------------------------------------- hero */

export const hero = {
  eyebrow: {
    pt: 'Software · Automação · IA aplicada',
    en: 'Software · Automation · Applied AI',
  },
  statement: {
    pt: 'Construo ferramentas em Python que automatizam processos e ajudam a diagnosticar incidentes.',
    en: 'I build Python tools that automate processes and help diagnose incidents.',
  },
  keywords: [
    { pt: 'Python', en: 'Python' },
    { pt: 'Backend', en: 'Backend' },
    { pt: 'Dados', en: 'Data' },
  ] satisfies L[],
  ctaPrimary: { pt: 'Ver projetos', en: 'See projects' },
  ctaSecondary: { pt: 'Vamos falar', en: "Let's talk" },
  meta: [
    { k: { pt: 'base', en: 'based' }, v: { pt: 'Barcelos, PT', en: 'Barcelos, PT' } },
    { k: { pt: 'estudo', en: 'study' }, v: { pt: 'Eng. Sistemas Informáticos · IPCA', en: 'Computer Systems Eng. · IPCA' } },
    { k: { pt: 'agora', en: 'now' }, v: { pt: 'Suporte Técnico N1 · Eleven Systems', en: 'L1 Technical Support · Eleven Systems' } },
  ] satisfies { k: L; v: L }[],
  photoAlt: {
    pt: 'Retrato de Juan Leite, de camisa azul-escura, a sorrir.',
    en: 'Portrait of Juan Leite in a dark blue shirt, smiling.',
  },
};

export interface RevealItem {
  title: L;
  hint: L;
}

/* --------------------------------------------------------------- projects */

/**
 * Projects = the former "Impact" + "Projects" sections. The log analyser is
 * the featured card (its two documented figures carry it); the other projects
 * follow as rows.
 */
export const projectsSection = {
  title: { pt: 'Projetos.', en: 'Projects.' },
  featured: {
    slug: 'log-analyzer',
    where: { pt: 'Python · Eleven Systems · 2026', en: 'Python · Eleven Systems · 2026' },
    stats: [
      { value: 10000, suffix: '+', unit: { pt: 'ficheiros', en: 'files' } },
      { value: 5000000, suffix: '+', unit: { pt: 'linhas', en: 'lines' } },
    ],
    timing: { pt: 'processados em minutos', en: 'processed in minutes' },
  },
  code: {
    label: { pt: 'código', en: 'code' },
    public: { pt: 'GitHub', en: 'GitHub' },
    private: { pt: 'privado', en: 'private' },
  },
};

/* --------------------------------------------------------------- approach */

export const approach = {
  title: { pt: 'Como trabalho.', en: 'How I work.' },
  /** The former five-step pipeline, condensed into one line. */
  intro: {
    pt: 'Começo pelo problema, confirmo a causa com dados e escolho a solução mais simples que o resolve.',
    en: 'I start from the problem, confirm the cause with data and pick the simplest solution that fixes it.',
  },
  ai: {
    title: { pt: 'IA como ferramenta de engenharia', en: 'AI as an engineering tool' },
    practices: [
      {
        title: { pt: 'Contexto', en: 'Context' },
        hint: { pt: 'Defino objetivos e restrições antes de pedir código.', en: 'I set goals and constraints before asking for code.' },
      },
      {
        title: { pt: 'Agentes', en: 'Agents' },
        hint: { pt: 'Divido o trabalho em tarefas e distribuo-as por agentes.', en: 'I split the work into tasks and hand them to agents.' },
      },
      {
        title: { pt: 'Revisão', en: 'Review' },
        hint: { pt: 'Avalio cada proposta e revejo o código antes de o aceitar.', en: 'I weigh each proposal and review the code before I accept it.' },
      },
      {
        title: { pt: 'Testes', en: 'Tests' },
        hint: { pt: 'Testo o resultado e assumo a responsabilidade por ele.', en: 'I test the result, and I own it.' },
      },
    ] satisfies RevealItem[],
  },
};

/* ----------------------------------------------------------------- skills */

/** Where a skill is evidenced (doc 01 §6: keep these distinct). */
export type Evidence = 'work' | 'project' | 'academic';

export const evidenceLabel: Record<Evidence, L> = {
  work: { pt: 'profissional', en: 'professional' },
  project: { pt: 'projetos', en: 'projects' },
  academic: { pt: 'académico', en: 'academic' },
};

export interface SkillArea {
  id: string;
  title: L;
  hint: L;
  items: { name: string | L; ev: Evidence }[];
}

export const skills = {
  title: { pt: 'Competências.', en: 'Skills.' },
  legend: { pt: 'Legenda', en: 'Legend' },
  areas: [
    {
      id: 'software',
      title: { pt: 'Software', en: 'Software' },
      hint: { pt: 'Ferramentas internas, desktop, web e APIs.', en: 'Internal tools, desktop, web and APIs.' },
      items: [
        { name: 'Python', ev: 'work' },
        { name: 'Qt', ev: 'work' },
        { name: 'SQLite', ev: 'work' },
        { name: 'C', ev: 'academic' },
        { name: 'HTML · CSS', ev: 'academic' },
      ],
    },
    {
      id: 'automation',
      title: { pt: 'Automação', en: 'Automation' },
      hint: { pt: 'Formulários e tarefas repetitivas passados para Python.', en: 'Forms and repetitive tasks moved into Python.' },
      items: [
        { name: { pt: 'Scripts Python', en: 'Python scripts' }, ev: 'work' },
        { name: { pt: 'Plataformas web', en: 'Web platforms' }, ev: 'work' },
      ],
    },
    {
      id: 'ai',
      title: { pt: 'IA aplicada', en: 'Applied AI' },
      hint: { pt: 'Agentes de código, com revisão e testes.', en: 'Coding agents, with review and tests.' },
      items: [
        { name: { pt: 'Prompts & contexto', en: 'Prompts & context' }, ev: 'project' },
        { name: { pt: 'Agentes de código', en: 'Coding agents' }, ev: 'project' },
        { name: { pt: 'Multiagente', en: 'Multi-agent' }, ev: 'project' },
      ],
    },
    {
      id: 'systems',
      title: { pt: 'Sistemas', en: 'Systems' },
      hint: { pt: 'Incidentes, logs e equipamentos Android em produção.', en: 'Incidents, logs and Android devices in production.' },
      items: [
        { name: 'Windows', ev: 'work' },
        { name: 'Linux', ev: 'academic' },
        { name: 'Android', ev: 'work' },
        { name: { pt: 'Análise de logs', en: 'Log analysis' }, ev: 'work' },
      ],
    },
    {
      id: 'backend',
      title: { pt: 'Backend & dados', en: 'Backend & data' },
      hint: { pt: 'APIs, autenticação e modelação relacional.', en: 'APIs, authentication and relational modelling.' },
      items: [
        { name: 'FastAPI', ev: 'work' },
        { name: 'SQLAlchemy', ev: 'work' },
        { name: 'Pydantic', ev: 'work' },
        { name: 'Alembic', ev: 'work' },
        { name: 'PostgreSQL', ev: 'work' },
        { name: 'Redis', ev: 'work' },
        { name: 'MinIO', ev: 'work' },
        { name: 'SQL', ev: 'academic' },
      ],
    },
    {
      id: 'tooling',
      title: { pt: 'Qualidade', en: 'Quality' },
      hint: { pt: 'Testes, lint, versões e contentores.', en: 'Tests, linting, versioning and containers.' },
      items: [
        { name: 'pytest', ev: 'work' },
        { name: 'Ruff', ev: 'project' },
        { name: 'uv', ev: 'project' },
        { name: 'Git', ev: 'project' },
        { name: 'Docker', ev: 'work' },
      ],
    },
  ] satisfies SkillArea[],
};

/* ---------------------------------------------------------------- journey */

export interface JourneyEntry {
  period: L;
  title: L;
  org: L;
  /** One-line detail revealed on hover/tap. */
  hint?: L;
  /** Short facts shown under the entry (former "Impact" cases without a case study). */
  points?: L<string[]>;
  upcoming?: boolean;
}

export const journey = {
  title: { pt: 'Percurso.', en: 'Journey.' },
  experienceLabel: { pt: 'Experiência', en: 'Experience' },
  educationLabel: { pt: 'Formação', en: 'Education' },
  experience: [
    {
      period: { pt: '2027', en: '2027' },
      title: { pt: 'Erasmus · Bélgica', en: 'Erasmus · Belgium' },
      org: { pt: '5 meses', en: '5 months' },
      hint: {
        pt: 'Cinco meses na Bélgica, em 2027, para continuar a licenciatura e melhorar o inglês.',
        en: 'Five months in Belgium in 2027, continuing my degree and improving my English.',
      },
      upcoming: true,
    },
    {
      period: { pt: '2026', en: '2026' },
      title: { pt: 'Suporte Técnico N1', en: 'L1 Technical Support' },
      org: { pt: 'Eleven Systems · Braga', en: 'Eleven Systems · Braga' },
      hint: {
        pt: 'Resolvo incidentes de software e hardware e desenvolvo ferramentas internas em Python.',
        en: 'I resolve software and hardware incidents and build internal tools in Python.',
      },
      points: {
        pt: [
          'Diagnostiquei crashes em produção causados por armazenamento cheio e resolvi o problema.',
          'Automatizei em Python o preenchimento de formulários e tarefas repetitivas numa plataforma web interna.',
        ],
        en: [
          'Traced production crashes to full storage and fixed the problem.',
          'Automated form filling and repetitive tasks on an internal web platform with Python.',
        ],
      },
    },
  ] satisfies JourneyEntry[],
  education: [
    {
      period: { pt: '2025—28', en: '2025—28' },
      title: { pt: 'Eng. de Sistemas Informáticos', en: 'Computer Systems Engineering' },
      org: { pt: 'IPCA · licenciatura em curso, pós-laboral', en: 'IPCA · BSc in progress, evening classes' },
      hint: { pt: 'Disciplinas de programação, bases de dados e sistemas operativos.', en: 'Courses in programming, databases and operating systems.' },
    },
    {
      period: { pt: '2022—25', en: '2022—25' },
      title: { pt: 'Técnico de Eletrotecnia', en: 'Electrical Technician' },
      org: { pt: 'Curso profissional · média final 18/20', en: 'Vocational diploma · final grade 18/20' },
      hint: {
        pt: 'PAP com 20/20 (junho de 2025): uma máquina automática de cocktails.',
        en: 'Final project graded 20/20 (June 2025): an automatic cocktail machine.',
      },
    },
  ] satisfies JourneyEntry[],
  courses: {
    label: { pt: 'Formação complementar', en: 'Additional courses' },
    items: [
      { name: 'HTML5 & CSS3', by: 'Curso em Vídeo', hours: 200, year: 2026 },
      { name: 'Python 3+ POO', by: 'Udemy · Luiz Miranda', hours: 140, year: 2026 },
      { name: 'Python', by: 'Curso em Vídeo', hours: 160, year: 2026 },
      { name: { pt: 'Algoritmos', en: 'Algorithms' }, by: 'Curso em Vídeo', hours: 40, year: 2023 },
    ] satisfies { name: string | L; by: string; hours: number; year: number }[],
  },
  languages: {
    label: { pt: 'Idiomas', en: 'Languages' },
    items: [
      { name: { pt: 'Português', en: 'Portuguese' }, level: { pt: 'nativo', en: 'native' } },
      {
        name: { pt: 'Inglês', en: 'English' },
        level: {
          pt: 'leitura avançada · oral em desenvolvimento',
          en: 'advanced reading · spoken in progress',
        },
      },
    ] satisfies { name: L; level: L }[],
  },
};

/* ---------------------------------------------------------------- contact */

export const contact = {
  title: { pt: 'Vamos falar.', en: "Let's talk." },
  body: {
    pt: 'Procuro oportunidades em backend, dados e automação com Python.',
    en: "I'm looking for opportunities in backend, data and automation with Python.",
  },
  emailLabel: { pt: 'email', en: 'email' },
};

/* --------------------------------------------------------------- colophon */

export const colophon = {
  built: {
    pt: 'Desenhado e construído do zero com Astro, TypeScript e React.',
    en: 'Designed and built from scratch with Astro, TypeScript and React.',
  },
  rights: { pt: 'Todos os direitos reservados.', en: 'All rights reserved.' },
};
