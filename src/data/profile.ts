import type { L } from '@/i18n';

/**
 * Identity and contact data — single source of truth.
 * Source: docs/01-identidade-profissional.md §1 and docs/cv.pdf.
 */
export const profile = {
  name: 'Juan Leite',
  fullName: 'Juan Lucas Souza Leite',
  /** Name parts and the variants people search for (structured data only). */
  givenName: 'Juan',
  additionalName: 'Lucas',
  familyName: 'Souza Leite',
  alternateNames: ['Juan Leite', 'Juan Lucas Leite', 'Juan Lucas'],
  url: 'https://juanleitedev.com',
  /** Stable JSON-LD id so every page points at the same Person. */
  personId: 'https://juanleitedev.com/#person',
  /** Public profiles of the same person (schema.org sameAs). */
  sameAs: [
    'https://github.com/JuanLeiteDev',
    'https://www.linkedin.com/in/juan-leite/',
    'https://www.instagram.com/juannlucas._/',
  ],
  location: { pt: 'Barcelos, Portugal', en: 'Barcelos, Portugal' } satisfies L,
  field: {
    pt: 'Software, automação e IA aplicada',
    en: 'Software, automation and applied AI',
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
