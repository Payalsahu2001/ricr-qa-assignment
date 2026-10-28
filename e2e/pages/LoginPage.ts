import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page
      .getByPlaceholder('Email')
      .or(page.locator('input[name="email"]'));

    this.passwordInput = page
      .locator('input[type="password"]')
      .or(page.getByPlaceholder('Password'))
      .or(page.locator('input[name="password"]'));

    this.loginButton = page.getByRole('button', {
      name: /login|sign in/i
    });

    this.errorMessage = page.getByText(
      /invalid credentials|incorrect/i
    );

    this.loadingIndicator = page
      .getByRole('progressbar')
      .or(page.locator('.spinner, [aria-busy="true"], .loading, [data-testid*="loading"], [data-testid*="spinner"]'));
  }

  async open() {
    await this.page.goto('/');
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.submit();
  }

  async expectLoginFormVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard\/?$/);
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible();
  }

  async expectNotOnDashboard() {
    await expect(this.page).not.toHaveURL(/\/dashboard\/?$/);
  }

  async expectLoadingState() {
    await expect.poll(async () => {
      const buttonDisabled = await this.loginButton
        .isDisabled()
        .catch(() => false);

      const spinnerVisible = await this.loadingIndicator
        .isVisible()
        .catch(() => false);

      return buttonDisabled || spinnerVisible;
    }).toBe(true);
  }
}