
import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Login page using Page Object Model', () => {
  test('page loads correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.expectLoginFormVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(
      process.env.TEST_USER_EMAIL ?? 'test@example.com',
      process.env.TEST_USER_PASSWORD ?? 'Test123!'
    );
    await loginPage.expectDashboard();
  });

  test('wrong password displays an error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(
      process.env.TEST_USER_EMAIL ?? 'test@example.com',
      'wrong-password'
    );
    await loginPage.expectLoginError();
  });

  test('empty form does not redirect to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.submit();
    await loginPage.expectNotOnDashboard();
  });

  test('loading state is visible while request is in flight', async ({ page }) => {
    let releaseResponse!: () => void;

    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });

    await page.route('**/auth/login', async (route) => {
      await responseGate;
      await route.continue();
    });

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.enterEmail(
      process.env.TEST_USER_EMAIL ?? 'test@example.com'
    );
    await loginPage.enterPassword(
      process.env.TEST_USER_PASSWORD ?? 'Test123!'
    );

    const submitPromise = loginPage.submit();

    try {
      await loginPage.expectLoadingState();
    } finally {
      releaseResponse();
    }

    await submitPromise;
  });
});