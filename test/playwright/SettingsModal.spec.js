import { test, expect } from '@playwright/test';

const username = "LeapChatUser";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.locator("#username").fill(username);
  await page.getByTestId("set-username").click();
});

test.describe("Opens settings modal", () => {
  test("opens and closes the settings modal by clicking gear icon", async ({ page }) => {
    await expect(page.getByText("Settings")).not.toBeVisible();

    await page.locator(".settings").click();
    await expect(page.getByText("Settings")).toBeVisible();

    await page.locator(".modal-header .btn-close").click();
    await expect(page.getByText("Settings")).not.toBeVisible();
  });

  test("purges chat of all messages when delete all message button is clicked", async ({ page }) => {
    // TODO configure a whole mess of messages in the DOM from multiple users, then check that DOM is 
    //  cleared of all message bubble elements on page refresh.
  });
});
