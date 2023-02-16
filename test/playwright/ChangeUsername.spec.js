import { test, expect } from '@playwright/test';

const username = "LeapChatUser";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.locator("#username").fill(username);
  await page.getByTestId("set-username").click();
});

test.describe("Opens username modal", () => {
  test("opens the user modal from user list", async ({ page }) => {
    await expect(page.locator("#username")).not.toBeVisible();

    await page.getByTestId("edit-username").click();

    await expect(page.locator("#username")).toBeVisible();
  });
});
