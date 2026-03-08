import { test, expect } from '@playwright/test';

// US5: AI Chatbot Interaction
// Validates: FR-012

test.describe('US5: Chatbot', () => {
  // T037 — Open chatbot on docs page
  test('chatbot opens with welcome message and input', async ({ page }) => {
    await page.goto('./docs/intro');
    // Wait for full page load including client-side hydration
    await page.waitForLoadState('networkidle');
    // The chatbot toggle is rendered by ChatbotWidget inside DocItem Layout
    const toggleBtn = page.getByRole('button', { name: /chatbot/i });
    await expect(toggleBtn).toBeVisible({ timeout: 15000 });
    await toggleBtn.click();
    // Chat panel should appear
    const panel = page.locator('.chatbot-panel');
    await expect(panel).toBeVisible();
    // Verify welcome message (use .first() as text appears in both header and message)
    await expect(page.getByText(/AI study companion/i).first()).toBeVisible();
    // Verify input field exists
    const input = panel.locator('input[type="text"], input[placeholder], textarea');
    await expect(input.first()).toBeVisible();
  });

  // T038 — Close chatbot
  test('chatbot closes via close button', async ({ page }) => {
    await page.goto('./docs/intro');
    await page.waitForLoadState('networkidle');
    // Open chatbot first
    const toggleBtn = page.getByRole('button', { name: /chatbot/i });
    await toggleBtn.click({ timeout: 15000 });
    await expect(page.locator('.chatbot-panel')).toBeVisible();
    // Close via the close button inside the panel (not the toggle)
    await page.locator('.chatbot-close').click();
    // Panel should disappear
    await expect(page.locator('.chatbot-panel')).not.toBeVisible();
  });
});
