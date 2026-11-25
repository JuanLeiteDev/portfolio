import type { L } from '@/i18n';
import type { TechLogoKey } from './tech-icons';

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
    pt: 'Desenvolvo software para solução de problemas reais.',
    en: 'I build software that solves real problems.',
  },
  ctaPrimary: { pt: 'Ver projetos', en: 'See projects' },
  ctaSecondary: { pt: 'Vamos falar', en: "Let's talk" },
  photoAlt: {
    pt: 'Retrato de Juan Leite, de camisa azul-escura, a sorrir.',
    en: 'Portrait of Juan Leite in a dark blue shirt, smiling.',
  },
  /** Back of the portrait (flip card). Facts only: doc 01, journey, projects. */
  about: {
    title: { pt: 'Sobre mim', en: 'About me' },
    text: {
      pt: 'Sou o Juan Leite, tenho 20 anos e foi a curiosidade pela tecnologia que me levou à engenharia informática. Gosto de compreender sistemas, procuro aperfeiçoar constantemente as minhas competências e aplicar a tecnologia à resolução de problemas.',
      en: "I'm Juan Leite, I'm 20, and it was curiosity about technology that led me to computer engineering. I like understanding how systems work, I keep working to sharpen my skills, and I apply technology to solving problems.",
    },
    place: { pt: 'Barcelos, PT', en: 'Barcelos, PT' },
    flip: { pt: 'Ver sobre mim', en: 'Show about me' },
    hint: { pt: 'Clica na foto para saber mais sobre mim', en: 'Click the photo to read about me' },
    hintTouch: { pt: 'Toca na foto para saber mais sobre mim', en: 'Tap the photo to read about me' },
  },
};

export interface RevealItem {
  title: L;
  hint: L;
}

/* --------------------------------------------------------------- projects */

/**
 * Projects: one accordion gallery; the log analyser (`featured`) opens first.
 */
export const projectsSection = {
  title: { pt: 'Projetos.', en: 'Projects.' },
  featured: {
    slug: 'log-analyzer',
    /**
     * Documented figures (case study + CV: "more than 10 000 files and
     * 5 million lines"), kept for the Odometer counter (not on the page
     * right now). `value` is the real figure (read by screen readers);
     * `compact` + `abbr` is how it is drawn: 10K+, 5M+.
     */
    stats: [
      { value: 10_000, compact: 10, abbr: 'K', unit: { pt: 'ficheiros', en: 'files' } },
      { value: 5_000_000, compact: 5, abbr: 'M', unit: { pt: 'linhas', en: 'lines' } },
    ],
  },
  code: {
    label: { pt: 'código', en: 'code' },
    public: { pt: 'GitHub', en: 'GitHub' },
    private: { pt: 'privado', en: 'private' },
    ongoing: { pt: 'em desenvolvimento', en: 'in development' },
  },
};

/* --------------------------------------------------------------- approach */

export interface ApproachStep {
  id: 'problem' | 'diagnosis' | 'build' | 'test';
  title: L;
  /** The general practice (one line). */
  body: L;
  /** Small technical indicator shown as a mono tag. */
  tag: L;
}

export const approach = {
  title: { pt: 'Como trabalho.', en: 'How I work.' },
  /** Overview of the four stages. */
  intro: {
    pt: 'Identifico a necessidade, avalio possibilidades e desenvolvo soluções práticas, com foco na resolução do problema.',
    en: 'I identify the need, assess possibilities and develop practical solutions, focusing on solving the problem.',
  },
  /**
   * Beside each step, one blueprint that evolves card by card (rev. A → D):
   * the need, the plan, the built solution, the delivery. Schematic only.
   */
  blueprint: {
    name: { pt: 'blueprint', en: 'blueprint' },
    labels: {
      context: { pt: 'contexto', en: 'context' },
      problem: { pt: 'problema', en: 'problem' },
      plan: { pt: 'plano', en: 'plan' },
      solution: { pt: 'solução', en: 'solution' },
    },
    /** What a click switches to. */
    toPlan: { pt: 'planta', en: 'plan' },
    to3d: { pt: '3D', en: '3D' },
    /** Read before it by screen readers: "… para planta" / "… to plan". */
    switchTo: { pt: 'Mudar o blueprint para ', en: 'Switch the blueprint to ' },
  },
  steps: [
    {
      id: 'problem',
      title: { pt: 'Necessidade', en: 'Need' },
      body: {
        pt: 'Identifico o problema e procuro compreender o contexto e as necessidades reais.',
        en: 'I identify the problem and seek to understand the context and the real needs.',
      },
      tag: { pt: 'contexto · requisitos', en: 'context · requirements' },
    },
    {
      id: 'diagnosis',
      title: { pt: 'Planeamento', en: 'Planning' },
      body: {
        pt: 'Analiso as possibilidades, avalio a viabilidade e defino a abordagem mais adequada.',
        en: 'I analyse the possibilities, assess feasibility and define the most suitable approach.',
      },
      tag: { pt: 'opções · viabilidade', en: 'options · feasibility' },
    },
    {
      id: 'build',
      title: { pt: 'Solução', en: 'Solution' },
      body: {
        pt: 'Desenvolvo a solução escolhida, privilegiando a simplicidade, a eficiência e a qualidade.',
        en: 'I develop the chosen solution, prioritising simplicity, efficiency and quality.',
      },
      tag: { pt: 'implementação', en: 'implementation' },
    },
    {
      id: 'test',
      title: { pt: 'Entrega', en: 'Delivery' },
      body: {
        pt: 'Valido o resultado e garanto que a solução responde à necessidade inicial.',
        en: 'I validate the result and ensure the solution meets the original need.',
      },
      tag: { pt: 'testes · validação', en: 'tests · validation' },
    },
  ] satisfies ApproachStep[],
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

export interface SkillArea {
  id: string;
  title: L;
  /** The area's text, shown beside the wheel. */
  hint: L;
}

export const skills = {
  title: { pt: 'Competências.', en: 'Skills.' },
  areas: [
    {
      id: 'software',
      title: { pt: 'Software', en: 'Software' },
      hint: { pt: 'Desenvolvimento de aplicações desktop, web e soluções empresariais.', en: 'Development of desktop and web applications and business software solutions.' },
    },
    {
      id: 'automation',
      title: { pt: 'Automação', en: 'Automation' },
      hint: { pt: 'Simplificação de processos e redução de tarefas manuais através de engenharia de software.', en: 'Simplifying processes and reducing manual tasks through software engineering.' },
    },
    {
      id: 'quality',
      title: { pt: 'Qualidade', en: 'Quality' },
      hint: { pt: 'Estruturação, validação e manutenção de soluções de software.', en: 'Structuring, validating and maintaining software solutions.' },
    },
    {
      id: 'ai',
      title: { pt: 'IA aplicada', en: 'Applied AI' },
      hint: { pt: 'Utilização de IA para acelerar o desenvolvimento, estruturar soluções e elevar a qualidade do código.', en: 'Using AI to accelerate development, structure solutions and improve code quality.' },
    },
    {
      id: 'autonomy',
      title: { pt: 'Autonomia', en: 'Autonomy' },
      hint: { pt: 'Capacidade de trabalhar de forma independente, tomar decisões e procurar soluções por iniciativa própria.', en: 'The ability to work independently, make decisions and take the initiative to find solutions.' },
    },
    {
      id: 'communication',
      title: { pt: 'Comunicação', en: 'Communication' },
      hint: { pt: 'Facilidade em partilhar ideias, ouvir diferentes perspetivas e trabalhar em equipa.', en: 'Being comfortable sharing ideas, listening to different perspectives and working in a team.' },
    },
    {
      id: 'adaptability',
      title: { pt: 'Adaptabilidade', en: 'Adaptability' },
      hint: { pt: 'Facilidade em aprender, lidar com mudanças e adaptar-me a novos ambientes e desafios.', en: 'Being comfortable learning, handling change and adapting to new environments and challenges.' },
    },
  ] satisfies SkillArea[],
};

/* ---------------------------------------------------------------- journey */

export interface JourneyEntry {
  period: L;
  title: L;
  org: L;
  upcoming?: boolean;
  /** What Juan is doing now (the job; the degree in progress). */
  current?: boolean;
}

export const journey = {
  title: { pt: 'Percurso.', en: 'Journey.' },
  experience: [
    {
      period: { pt: '2026', en: '2026' },
      title: { pt: 'Desenvolvedor de Software & Suporte de TI', en: 'Software Developer & IT Support' },
      org: { pt: 'Eleven Systems · Braga', en: 'Eleven Systems · Braga' },
      current: true,
    },
  ] satisfies JourneyEntry[],
  education: [
    {
      period: { pt: '2022—25', en: '2022—25' },
      title: { pt: 'Técnico de Eletrotecnia', en: 'Electrical Technician' },
      org: { pt: 'Curso profissional', en: 'Vocational diploma' },
    },
    {
      period: { pt: '2025—28', en: '2025—28' },
      title: { pt: 'Eng. de Sistemas Informáticos', en: 'Computer Systems Engineering' },
      org: { pt: 'UPCA · licenciatura em curso', en: 'UPCA · BSc in progress' },
      current: true,
    },
    // supplementary training (doc 01 §5), grouped by year so the timeline
    // doesn't repeat the same year
    {
      period: { pt: '2023', en: '2023' },
      title: { pt: 'Formação complementar', en: 'Supplementary training' },
      org: { pt: 'Algoritmos · Curso em Vídeo · 40 h', en: 'Algorithms · Curso em Vídeo · 40 h' },
    },
    {
      period: { pt: '2026', en: '2026' },
      title: { pt: 'Formação complementar', en: 'Supplementary training' },
      org: {
        pt: 'Python (160 h), Python POO (140 h), HTML5 e CSS3 (200 h)',
        en: 'Python (160 h), Python OOP (140 h), HTML5 and CSS3 (200 h)',
      },
    },
    {
      period: { pt: '2027', en: '2027' },
      title: { pt: 'AI Engineer Intermediate', en: 'AI Engineer Intermediate' },
      org: { pt: 'Bélgica · 5 meses', en: 'Belgium · 5 months' },
      upcoming: true,
    },
  ] satisfies JourneyEntry[],
};

/* ---------------------------------------------------------------- contact */

export const contact = {
  title: { pt: 'Vamos falar.', en: "Let's talk." },
  body: {
    pt: 'Procuro trabalho remoto em desenvolvimento de software e programação.',
    en: "I'm looking for remote work in software development and programming.",
  },
  emailLabel: { pt: 'email', en: 'email' },
  /**
   * "Stack": the technologies as physical objects in a minimalist frame
   * (stack-physics.ts): brand-coloured pills with the original logo. Only tools that appear in
   * `skills`, the journey, the projects or this site's own stack.
   */
  stack: {
    title: { pt: 'Stack', en: 'Stack' },
    items: [
      { name: 'Python', icon: 'python', color: '#3776AB', ink: 'light' },
      { name: 'FastAPI', icon: 'fastapi', color: '#009688', ink: 'light' },
      { name: 'PostgreSQL', icon: 'postgresql', color: '#336791', ink: 'light' },
      { name: 'Docker', icon: 'docker', color: '#2496ED', ink: 'light' },
      { name: 'Git', icon: 'git', color: '#F05032', ink: 'light' },
      { name: 'SQL', color: '#334155', ink: 'light' },
      { name: 'Linux', icon: 'linux', color: '#FCC624', ink: 'dark' },
      { name: 'C', icon: 'c', color: '#A8B9CC', ink: 'dark' },
      { name: 'HTML5', icon: 'html5', color: '#E34F26', ink: 'light' },
      { name: 'CSS', icon: 'css', color: '#1572B6', ink: 'light' },
      { name: 'TypeScript', icon: 'typescript', color: '#3178C6', ink: 'light' },
      { name: 'Redis', icon: 'redis', color: '#DC382D', ink: 'light' },
    ] satisfies StackItem[],
  },
};

export interface StackItem {
  /** Technology name (not translated): the label of the pill. */
  name: string;
  /** Logo; without one (SQL) a generic database glyph is drawn. */
  icon?: TechLogoKey;
  /** Brand colour of the pill. */
  color: string;
  /** Text colour on that brand colour: light (white) or dark. */
  ink: 'light' | 'dark';
}

/* --------------------------------------------------------------- colophon */

export const colophon = {
  built: {
    pt: 'Desenhado e construído do zero com Astro, TypeScript e React.',
    en: 'Designed and built from scratch with Astro, TypeScript and React.',
  },
  rights: { pt: 'Todos os direitos reservados.', en: 'All rights reserved.' },
};
