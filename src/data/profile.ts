import type { L } from '@/i18n';

/**
 * Identity and contact data — single source of truth.
 * Source: docs/01-identidade-profissional.md §1 and docs/cv.pdf.
 */
export const profile = {
  name: 'Juan Leite',
  fullName: 'Juan Lucas Souza Leite',
  url: 'https://juanleitedev.com',
  location: { pt: 'Barcelos, Portugal', en: 'Barcelos, Portugal' } satisfies L,
  field: {
    pt: 'Engenharia de software & automação inteligente',
    en: 'Software engineering & intelligent automation',
  } satisfies L,
  email: 'leite.souza.juan@gmail.com',
} as const;

export type ContactKey = 'whatsapp' | 'linkedin' | 'github' | 'cv';

export interface ContactAction {
  key: ContactKey;
  /** Two-letter typographic "key" shown instead of a brand logo. */
  glyph: string;
  label: L;
  /** Accessible description appended to the visible label. */
  detail: L;
  href: string;
  external: boolean;
  download?: string;
}

/** The four mandatory contact actions (doc 01 §1, doc 03 §2). */
export const contactActions: ContactAction[] = [
  {
    key: 'whatsapp',
    glyph: 'wa',
    label: { pt: 'WhatsApp', en: 'WhatsApp' },
    detail: { pt: 'Conversar no WhatsApp', en: 'Chat on WhatsApp' },
    // International code + digits only, no "+" or separators (doc 03 §2).
    href: 'https://wa.me/351914095001',
    external: true,
  },
  {
    key: 'linkedin',
    glyph: 'in',
    label: { pt: 'LinkedIn', en: 'LinkedIn' },
    detail: { pt: 'Perfil no LinkedIn', en: 'LinkedIn profile' },
    href: 'https://www.linkedin.com/in/juan-leite/',
    external: true,
  },
  {
    key: 'github',
    glyph: 'gh',
    label: { pt: 'GitHub', en: 'GitHub' },
    detail: { pt: 'Perfil no GitHub', en: 'GitHub profile' },
    href: 'https://github.com/JuanLeiteDev',
    external: true,
  },
  {
    key: 'cv',
    glyph: 'cv',
    label: { pt: 'Descarregar CV', en: 'Download CV' },
    // Only one authorised CV exists (Portuguese) — say so in both languages.
    detail: { pt: 'PDF em português', en: 'PDF in Portuguese' },
    href: '/cv/juan-leite-cv-pt.pdf',
    external: false,
    download: 'Juan-Leite-CV-PT.pdf',
  },
];
