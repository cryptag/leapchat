import { test, expect } from '@playwright/test';

const username = "LeapChatUser";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.locator("#username").fill(username);
  await page.getByTestId("set-username").click();
});

test.describe("Opens sharing modal", () => {
  test("opens and closes the invite users modal by clicking gear icon", async ({ page }) => {
    await expect(page.getByText("Invite to Chat")).not.toBeVisible();

    await page.locator(".sharing").click();
    await expect(page.getByText("Invite to Chat")).toBeVisible();

    await page.locator(".modal-header .close").click();
    await expect(page.getByText("Invite to Chat")).not.toBeVisible();
  });

  test("opens and closes the invite users modal by clicking invite button in users list", async ({ page }) => {
    await expect(page.getByText("Invite to Chat")).not.toBeVisible();

    await page.locator(".invite-users .icon-button").click();
    await expect(page.getByText("Invite to Chat")).toBeVisible();

    await page.locator(".modal-header .close").click();
    await expect(page.getByText("Invite to Chat")).not.toBeVisible();
  });

  test("copies invite link to browser clipboard", async ({ page }) => {
    await page.locator(".sharing").click();
    await expect(page.getByText("Invite to Chat")).toBeVisible();

    // in order to check navigator.clipboard.readText(), we need to give playwright
    //    permissions. Only chromium (not currently running) supports allowing this.
    // Just check that we see the tooltip appear.
    await expect(page.getByText("Link copied!")).not.toBeVisible();
    await page.locator(".share-copy-link .icon-button").click();
    await expect(page.getByText("Link copied!")).toBeVisible();
    
  });

});
