import { test, expect } from '@playwright/test';

test.describe('Login page UI', () => {
  test('page loads with email, password and login button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByPlaceholder('Email').or(page.locator('input[name="email"]'))).toBeVisible();
    await expect(
      page.locator('input[type="password"]')
        .or(page.getByPlaceholder('Password'))
        .or(page.locator('input[name="password"]'))
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Email').or(page.locator('input[name="email"]')).fill(
      process.env.TEST_USER_EMAIL ?? 'test@example.com'
    );
    await page.locator('input[type="password"]')
      .or(page.getByPlaceholder('Password'))
      .or(page.locator('input[name="password"]'))
      .fill(process.env.TEST_USER_PASSWORD ?? 'Test123!');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/?$/);
  });

  test('wrong password displays an error message', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Email').or(page.locator('input[name="email"]')).fill(
      process.env.TEST_USER_EMAIL ?? 'test@example.com'
    );
    await page.locator('input[type="password"]')
      .or(page.getByPlaceholder('Password'))
      .or(page.locator('input[name="password"]'))
      .fill('wrong-password');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page.getByText(/invalid credentials|incorrect/i)).toBeVisible();
  });

  test('empty form does not navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page).not.toHaveURL(/\/dashboard\/?$/);
  });

  test('shows loading state while login request is in flight', async ({ page }) => {
    // Hold the login response so the loading state can be observed reliably.
    let releaseResponse!: () => void;
    const responseGate = new Promise<void>(resolve => { releaseResponse = resolve; });
    await page.route('**/auth/login', async route => {
      await responseGate;
      await route.continue();
    });

    await page.goto('/');
    await page.getByPlaceholder('Email').or(page.locator('input[name="email"]')).fill(
      process.env.TEST_USER_EMAIL ?? 'test@example.com'
    );
    await page.locator('input[type="password"]')
      .or(page.getByPlaceholder('Password'))
      .or(page.locator('input[name="password"]'))
      .fill(process.env.TEST_USER_PASSWORD ?? 'Test123!');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    try {
      const button = page.getByRole('button', { name: /login|sign in/i });
      const disabled = await button.isDisabled().catch(() => false);
      const spinner = await page
        .getByRole('progressbar')
        .or(page.locator('.spinner, [aria-busy="true"], .loading, [data-testid*="loading"], [data-testid*="spinner"]'))
        .isVisible()
        .catch(() => false);
      expect(disabled || spinner).toBe(true);
    } finally {
      releaseResponse();
    }
  });
});