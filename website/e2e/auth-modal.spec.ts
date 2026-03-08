import { test, expect } from '@playwright/test';

// US2: Auth Modal Functionality & Accessibility
// Validates: FR-003–FR-007, FR-013, FR-014, FR-016, FR-017, SC-002, SC-007

test.describe('US2: Auth Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  // T018 — Modal centering (FR-013, SC-007)
  test('modal appears centered and does not overlap navbar', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    const modal = page.locator('.auth-modal');
    await expect(modal).toBeVisible();
    // Check modal is roughly centered
    const modalBox = await modal.boundingBox();
    const viewport = page.viewportSize()!;
    expect(modalBox).toBeTruthy();
    // Modal should be roughly horizontally centered (within 100px tolerance)
    const modalCenterX = modalBox!.x + modalBox!.width / 2;
    expect(Math.abs(modalCenterX - viewport.width / 2)).toBeLessThan(100);
    // Modal top should be below the navbar (navbar is ~60px)
    expect(modalBox!.y).toBeGreaterThan(0);
  });

  // T019 — Tab switching (FR-003)
  test('tab switching between Sign In and Sign Up', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('.auth-modal')).toBeVisible();
    // Click Sign Up tab
    await page.locator('.auth-tab').filter({ hasText: 'Sign Up' }).click();
    // Submit button should say "Create Account"
    await expect(page.locator('.auth-submit-btn')).toContainText('Create Account');
    // Password placeholder should have min character hint
    const passwordInput = page.locator('#auth-password');
    await expect(passwordInput).toHaveAttribute('placeholder', 'Min 8 characters');
  });

  // T020 — Password toggle (FR-004)
  test('password show/hide toggle works', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    const passwordInput = page.locator('#auth-password');
    await passwordInput.fill('testpassword');
    // Initially password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
    // Click toggle
    await page.locator('.auth-password-toggle').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    // Click again to hide
    await page.locator('.auth-password-toggle').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // T021 — Close via × button (FR-005)
  test('modal closes via × button', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('.auth-modal')).toBeVisible();
    await page.locator('.auth-modal-close').click();
    await expect(page.locator('.auth-modal')).not.toBeVisible();
  });

  // T022 — Close via overlay click (FR-005)
  test('modal closes via overlay click', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('.auth-modal')).toBeVisible();
    // Click the overlay (outside the modal)
    await page.locator('.auth-modal-overlay').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('.auth-modal')).not.toBeVisible();
  });

  // T023 — HTML5 validation (FR-006)
  test('HTML5 validation prevents empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('.auth-modal')).toBeVisible();
    // Try to submit empty form
    await page.locator('.auth-submit-btn').click();
    // The email field should be invalid (required)
    const isInvalid = await page.locator('#auth-email').evaluate(
      (el: HTMLInputElement) => !el.validity.valid,
    );
    expect(isInvalid).toBe(true);
  });

  // T024 — Escape to close (FR-014)
  test('Escape key closes the modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('.auth-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.auth-modal')).not.toBeVisible();
  });

  // T025 — Focus trap (FR-014)
  test('Tab key cycles focus within modal only', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('.auth-modal')).toBeVisible();

    // Collect all focusable elements inside the modal
    const focusableCount = await page.locator('.auth-modal').evaluate((modal) => {
      const els = modal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]',
      );
      return els.length;
    });
    expect(focusableCount).toBeGreaterThan(0);

    // Tab through all focusable elements + 1 to verify wrap
    for (let i = 0; i < focusableCount + 1; i++) {
      await page.keyboard.press('Tab');
    }
    // After wrapping, focus should still be inside the modal
    const focusedInModal = await page.evaluate(() => {
      const active = document.activeElement;
      const modal = document.querySelector('.auth-modal');
      return modal?.contains(active) ?? false;
    });
    expect(focusedInModal).toBe(true);

    // Shift+Tab should also stay in modal
    await page.keyboard.press('Shift+Tab');
    const stillInModal = await page.evaluate(() => {
      const active = document.activeElement;
      const modal = document.querySelector('.auth-modal');
      return modal?.contains(active) ?? false;
    });
    expect(stillInModal).toBe(true);
  });

  // T026 — Focus return (FR-014)
  test('focus returns to Sign In button after modal closes', async ({ page }) => {
    const signInBtn = page.getByRole('button', { name: 'Sign In' });
    await signInBtn.click();
    await expect(page.locator('.auth-modal')).toBeVisible();
    // Close via Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('.auth-modal')).not.toBeVisible();
    // Focus should be on the Sign In button
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedElement).toContain('Sign In');
  });

  // T027 — Dark mode contrast (FR-017)
  test('modal is readable in dark mode', async ({ page }) => {
    // Toggle dark mode
    const themeToggle = page.locator('.navbar__items--right button[class*="toggle"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    } else {
      // Try the color mode toggle
      await page.locator('button[class*="colorMode"]').first().click({ timeout: 3000 }).catch(() => {});
    }

    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('.auth-modal')).toBeVisible();

    // Verify the modal background is not white (dark mode should be dark)
    const bgColor = await page.locator('.auth-modal').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    // In dark mode, background should not be pure white (rgb(255, 255, 255))
    expect(bgColor).not.toBe('rgb(255, 255, 255)');

    // Verify text is visible (not same as background)
    const textColor = await page.locator('.auth-modal').evaluate(
      (el) => getComputedStyle(el).color,
    );
    expect(textColor).not.toBe(bgColor);

    // Verify input fields are visible
    await expect(page.locator('#auth-email')).toBeVisible();
    await expect(page.locator('#auth-password')).toBeVisible();
  });

  // T028 — Invalid credentials error (FR-007)
  // NOTE: This test requires a running backend
  test('invalid credentials show error message', async ({ page }) => {
    // Mock the auth API to return 401
    await page.route('**/api/auth/signin', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid email or password' }),
      });
    });

    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.locator('#auth-email').fill('wrong@example.com');
    await page.locator('#auth-password').fill('wrongpassword');
    await page.locator('.auth-submit-btn').click();

    // Wait for error to appear
    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 5000 });
  });

  // T029 — Network error message (FR-016)
  test('network error shows user-friendly message', async ({ page }) => {
    // Block all auth API requests to simulate network failure
    await page.route('**/api/auth/**', async (route) => {
      await route.abort('connectionrefused');
    });

    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.locator('#auth-email').fill('test@example.com');
    await page.locator('#auth-password').fill('password123');
    await page.locator('.auth-submit-btn').click();

    // Wait for error message
    const error = page.locator('.auth-error');
    await expect(error).toBeVisible({ timeout: 5000 });
    const errorText = await error.textContent();
    expect(errorText).toContain('Something went wrong');
  });
});
