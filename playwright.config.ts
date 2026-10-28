import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  webServer: {
    command: 'node mock-server.js',
    port: 5000,
    reuseExistingServer: true,
  },
  use: {
   baseURL: 'http://localhost:5000/api/',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'api',
      testMatch: '**/*.api.spec.ts'
    },
    {
      name: 'ui',
      testMatch: '**/*.ui.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173'
      }
    },
    {
      name: 'pom',
      testMatch: '**/*.pom.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173'
      }
    }
  ]
});