import { test, expect } from '@playwright/test';

// US3: Homepage Content Rendering
// Validates: FR-008, SC-003

test.describe('US3: Homepage Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  // T030 — Hero section renders all expected elements
  test('hero section renders badge, heading, CTAs', async ({ page }) => {
    // Badge
    await expect(page.getByText('Interactive AI Textbook')).toBeVisible();
    // Main heading (site title)
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    // Description / tagline
    const tagline = page.locator('.hero__subtitle, [class*="heroSubtitle"]');
    if (await tagline.count() > 0) {
      await expect(tagline.first()).toBeVisible();
    }
    // Start Reading CTA
    await expect(page.getByRole('link', { name: /Start Reading/i })).toBeVisible();
    // View on GitHub CTA
    await expect(page.getByRole('link', { name: /View on GitHub/i })).toBeVisible();
  });

  // T031 — Feature cards section displays 6 cards with expected titles
  test('feature cards section displays 6 cards', async ({ page }) => {
    const expectedTitles = [
      'Structured Learning',
      'AI Study Companion',
      'Highlight & Ask',
      'Urdu Translation',
      'Personalized Learning',
      'Interactive Content',
    ];

    // Scroll to features area
    const featuresHeading = page.getByRole('heading', { name: /Why Students Love This/i });
    await featuresHeading.scrollIntoViewIfNeeded();
    await expect(featuresHeading).toBeVisible();

    // Check all 6 feature cards are present
    for (const title of expectedTitles) {
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
    }
  });

  // T032 — Stats section displays expected metrics
  test('stats section displays key metrics', async ({ page }) => {
    // Scroll to stats
    const statsValue = page.getByText('12+');
    await statsValue.scrollIntoViewIfNeeded();

    await expect(page.getByText('12+')).toBeVisible();
    await expect(page.getByText('Chapters')).toBeVisible();
    await expect(page.getByText('6', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Modules')).toBeVisible();
    await expect(page.getByText('AI-Powered')).toBeVisible();
    await expect(page.getByText('Study Companion', { exact: true })).toBeVisible();
  });
});
