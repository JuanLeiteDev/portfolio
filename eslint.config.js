import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';

export default defineConfig(
  {
    ignores: ['dist/', '.astro/', 'node_modules/', 'test-results/', 'playwright-report/', 'reports/', 'docs/'],
  },
  tseslint.configs.recommended,
  astro.configs.recommended,
  astro.configs['jsx-a11y-strict'],
  {
    files: ['**/*.tsx'],
    plugins: { 'jsx-a11y-x': jsxA11y },
    rules: {
      ...jsxA11y.configs.strict.rules,
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // role="list" is intentional: Safari/VoiceOver drops list semantics when list-style is none.
      'astro/jsx-a11y/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
    },
  },
);
