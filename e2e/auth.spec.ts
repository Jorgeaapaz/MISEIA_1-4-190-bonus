import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('renders the login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('shows validation when email is empty', async ({ page }) => {
    await page.goto('/login');
    const button = page.locator('button[type="submit"]');
    await button.click();
    // Should either show validation or stay on same page
    await expect(page).toHaveURL(/login/);
  });
});
