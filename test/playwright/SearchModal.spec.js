import { test, expect } from '@playwright/test';

const username = "LeapChatUser";

const messages = [
  "Hey",
  "Baa baa black sheep",
  "Have you any wool?",
  "Hello",
  "Hello Hello",
  "Hello Hello Hello",
  "Hello!",
  "What is up?"
];

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.locator("#username").fill(username);
  await page.getByTestId("set-username").click();

  for (let i = 0; i < messages.length; i++) {
    await page.getByPlaceholder("Enter message").fill(messages[i]);
    await page.locator(".message .btn-default").click();
  }
});

test.describe("Message History Search Modal", () => {
  test("user can open and view the search modal", async ({ page }) => {
    await expect(page.locator("#message-search")).not.toBeVisible();

    await page.locator(".open-message-search").click();

    await expect(page.locator("#message-search")).toBeVisible();
  });

  test("user can enter text and view search results", async ({ page }) => {
    await page.locator(".open-message-search").click();

    await page.locator("#message-search").fill("black sheep");
    let resultsList = page.locator(".search-results .chat-message")
    await expect(resultsList).toHaveCount(1);

    await page.locator("#message-search").fill("hello");
    resultsList = page.locator(".search-results .chat-message")
    await expect(resultsList).toHaveCount(4);
  });

});
