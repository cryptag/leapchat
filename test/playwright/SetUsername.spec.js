import { test, expect } from '@playwright/test';

import { MAX_USERNAME_LENGTH } from '../../src/components/modals/Username';

const username = "LeapChatUser";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:8080/");
});

test.describe('Sets an initial user name', () => {
  test('sets username', async ({ page }) => {
    await page.locator("#username").fill(username);
    await page.getByTestId("set-username").click();

    await expect(page.locator("#username")).not.toBeVisible();

    await expect(page.locator(".users-list")).toContainText(username);
  });

  test("sees an error if username is empty", async ({ page }) => {
    await expect(page.getByRole("alert")).not.toBeVisible();
    
    await page.locator("#username").fill("");
    await page.getByTestId("set-username").click();
    
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("alert")).toHaveText(/Must not be empty/);
  });

  test("sees an error if username is too long", async ({ page }) => {
    await expect(page.getByRole("alert")).not.toBeVisible();

    const tooLongUsername = new Array(MAX_USERNAME_LENGTH + 3).join("X");
    
    await page.locator("#username").fill(tooLongUsername);
    await page.getByTestId("set-username").click();
    
    await expect(page.getByRole("alert")).toBeVisible();
    const expectedError = new RegExp(`Length must not exceed ${MAX_USERNAME_LENGTH}`);
    await expect(page.getByRole("alert")).toHaveText(expectedError);
  });
});
