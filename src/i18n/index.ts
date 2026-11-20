/**
 * Internationalisation primitives.
 *
 * Every user-facing string lives in a `L` pair so TypeScript guarantees that
 * both languages exist for each piece of content (no partial translations).
 */
export const LANGS = ['pt', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'pt';

/** A localised value. */
export type L<T = string> = Record<Lang, T>;

export const t = <T>(value: L<T>, lang: Lang): T => value[lang];

export const otherLang = (lang: Lang): Lang => (lang === 'pt' ? 'en' : 'pt');

export const htmlLang: L = { pt: 'pt-PT', en: 'en' };
export const ogLocale: L = { pt: 'pt_PT', en: 'en_GB' };

/* ------------------------------------------------------------------ routes */

export const routes = {
  home: { pt: '/', en: '/en/' } satisfies L,
  project: (slug: string): L => ({ pt: `/projetos/${slug}/`, en: `/en/projects/${slug}/` }),
};

/** Anchor ids per language. */
export const sectionIds = {
  about: { pt: 'sobre', en: 'about' },
  projects: { pt: 'projetos', en: 'projects' },
  journey: { pt: 'percurso', en: 'journey' },
  skills: { pt: 'competencias', en: 'skills' },
  approach: { pt: 'abordagem', en: 'approach' },
  contact: { pt: 'contacto', en: 'contact' },
} satisfies Record<string, L>;

/**
 * Retired anchors kept as invisible aliases so links already shared outside
 * the site still land on the right section. Nothing on the site links to them.
 */
export const legacyIds: Partial<Record<SectionKey, L<string[]>>> = {
  projects: { pt: ['impacto'], en: ['impact'] },
  skills: { pt: ['skills'], en: [] },
  contact: { pt: ['contato'], en: [] },
};

export type SectionKey = keyof typeof sectionIds;

export const sectionLabels: Record<SectionKey, L> = {
  about: { pt: 'Início', en: 'Intro' },
  projects: { pt: 'Projetos', en: 'Projects' },
  journey: { pt: 'Percurso', en: 'Journey' },
  skills: { pt: 'Competências', en: 'Skills' },
  approach: { pt: 'Como trabalho', en: 'How I work' },
  contact: { pt: 'Contacto', en: 'Contact' },
};

export const sectionOrder: SectionKey[] = ['about', 'projects', 'journey', 'skills', 'approach', 'contact'];

export const sectionHref = (key: SectionKey, lang: Lang, onHome = true): string =>
  `${onHome ? '' : routes.home[lang]}#${sectionIds[key][lang]}`;

/* ------------------------------------------------------------- UI strings */

export const ui = {
  skip: { pt: 'Saltar para o conteúdo', en: 'Skip to content' },
  primaryNav: { pt: 'Navegação principal', en: 'Main navigation' },
  langSwitch: { pt: 'Idioma', en: 'Language' },
  langCurrent: { pt: 'Idioma atual', en: 'Current language' },
  langName: { pt: 'Português', en: 'English' },
  switchTo: { pt: 'Ver em English', en: 'Ver em Português' },
  menu: { pt: 'Menu', en: 'Menu' },
  openMenu: { pt: 'Abrir menu e atalhos', en: 'Open menu and shortcuts' },
  close: { pt: 'Fechar', en: 'Close' },
  themeToggle: { pt: 'Alternar tema claro/escuro', en: 'Toggle light/dark theme' },
  newTab: { pt: '(abre num novo separador)', en: '(opens in a new tab)' },
  back: { pt: 'Voltar aos projetos', en: 'Back to projects' },
  viewProject: { pt: 'Ver estudo de caso', en: 'View case study' },
  allProjects: { pt: 'Todos os projetos', en: 'All projects' },
  nextProject: { pt: 'Próximo projeto', en: 'Next project' },
  copyEmail: { pt: 'Copiar email', en: 'Copy email' },
  copied: { pt: 'Copiado', en: 'Copied' },
  copyFailed: { pt: 'Não foi possível copiar', en: 'Could not copy' },
  // Command menu
  cmdPlaceholder: { pt: 'Ir para… (secções, projetos, contactos)', en: 'Go to… (sections, projects, contacts)' },
  cmdLabel: { pt: 'Menu de comandos', en: 'Command menu' },
  cmdEmpty: { pt: 'Sem resultados.', en: 'No results.' },
  cmdSections: { pt: 'Secções', en: 'Sections' },
  cmdProjects: { pt: 'Projetos', en: 'Projects' },
  cmdContact: { pt: 'Contacto', en: 'Contact' },
  cmdSettings: { pt: 'Preferências', en: 'Preferences' },
  cmdHint: { pt: 'navegar', en: 'navigate' },
  cmdSelect: { pt: 'abrir', en: 'open' },
  cmdClose: { pt: 'fechar', en: 'close' },
} satisfies Record<string, L>;
