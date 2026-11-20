import { defineConfig, devices } from '@playwright/test';

/**
 * E2E against the production build (`astro build` + `astro preview`).
 * Desktop: Chromium, Firefox, WebKit. Mobile: emulated Pixel 7 and iPhone 13.
 * Emulation does not replace physical Safari iOS / Chrome Android (see README).
 */
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  // Several concurrent Chromium processes stall on localhost on this Windows machine
  // (subresources never finish; 1 browser with many pages is fine) — see README.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && node scripts/serve.mjs 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
});
