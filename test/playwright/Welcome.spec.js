import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:8080/");
});

test.describe('Welcome', () => {
  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/LeapChat/);

    await expect(page.getByTestId("set-username-form")).toBeVisible();
  });
});
