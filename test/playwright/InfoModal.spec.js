import { test, expect } from '@playwright/test';

const username = "LeapChatUser";


test.beforeEach(async ({ page }) => {
  // set username
  await page.goto("http://localhost:8080/");
  await page.locator("#username").fill(username);
  await page.getByTestId("set-username").click();
});


test.describe('Opens modal dialogs', () => {
  test('can open and view info dialog', async ({ page }) => {
    await expect(page.getByText("Welcome to LeapChat!")).not.toBeVisible();

    // open sesame
    await page.locator(".info").click();
    await expect(page.getByText("Welcome to LeapChat!")).toBeVisible();

    // shut yourself sesame
    await page.locator(".modal-header .close").click();
    await expect(page.getByText("Welcome to LeapChat!")).not.toBeVisible();
  });
});