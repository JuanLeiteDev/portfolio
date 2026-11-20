import type { Page, TestInfo } from '@playwright/test';

export const isMobileProject = (info: TestInfo) => info.project.name.startsWith('mobile');

/** Collects console errors and uncaught exceptions for the lifetime of the page. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

export const PAGES = {
  pt: ['/', '/projetos/xi-repair/', '/projetos/log-analyzer/', '/projetos/xi-support/', '/projetos/mini-shell/', '/projetos/ps2/'],
  en: ['/en/', '/en/projects/xi-repair/', '/en/projects/log-analyzer/', '/en/projects/xi-support/', '/en/projects/mini-shell/', '/en/projects/ps2/'],
};
