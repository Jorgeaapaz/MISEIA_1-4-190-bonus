import { test, expect } from '@playwright/test';

test.describe('Investor pages (no auth redirect)', () => {
  test('investor dashboard redirects without auth', async ({ page }) => {
    await page.goto('/investor/dashboard');
    // Should redirect to login or show unauthorized
    await expect(page).not.toHaveURL('/investor/dashboard');
  });

  test('investor screener redirects without auth', async ({ page }) => {
    await page.goto('/investor/screener');
    await expect(page).not.toHaveURL('/investor/screener');
  });
});
