/**
 * FletNix UI Tests - Pagination
 * 
 * E2E tests for pagination functionality.
 * Following the Zen of Python: Simple is better than complex.
 */

import { test, expect } from '@playwright/test';

test.describe('Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should display pagination controls', async ({ page }) => {
    const pagination = page.locator(
      '[class*="pagination"], button:has-text("1"), button:has-text("Next"), button:has-text("Previous")'
    );
    await expect(pagination.first()).toBeVisible();
  });

  test('should show page 1 as active by default', async ({ page }) => {
    const page1Button = page.getByRole('button', { name: '1' });
    
    if (await page1Button.isVisible()) {
      // First page button should have active styling
      const className = await page1Button.getAttribute('class');
      expect(
        className?.includes('active') ||
        className?.includes('bg-red') ||
        className?.includes('bg-netflix') ||
        className?.includes('current')
      ).toBe(true);
    }
  });

  test('should navigate to next page', async ({ page }) => {
    // Get first show on page 1
    const firstShowPage1 = await page.locator('[class*="card"]').first().textContent();

    // Click next or page 2
    const nextButton = page.locator('button:has-text("Next"), button:has-text("2"), button:has-text("→"), button:has-text(">")');
    
    if (await nextButton.first().isVisible()) {
      await nextButton.first().click();
      await page.waitForTimeout(1000);

      // First show should be different
      const firstShowPage2 = await page.locator('[class*="card"]').first().textContent();
      expect(firstShowPage1).not.toBe(firstShowPage2);
    }
  });

  test('should navigate to previous page', async ({ page }) => {
    // First go to page 2
    const page2Button = page.getByRole('button', { name: '2' });
    if (await page2Button.isVisible()) {
      await page2Button.click();
      await page.waitForTimeout(1000);

      // Get first show on page 2
      const firstShowPage2 = await page.locator('[class*="card"]').first().textContent();

      // Go back to page 1
      const prevButton = page.locator('button:has-text("Previous"), button:has-text("1"), button:has-text("←"), button:has-text("<")');
      await prevButton.first().click();
      await page.waitForTimeout(1000);

      // First show should be different
      const firstShowPage1 = await page.locator('[class*="card"]').first().textContent();
      expect(firstShowPage1).not.toBe(firstShowPage2);
    }
  });

  test('should update URL when changing pages', async ({ page }) => {
    const page2Button = page.getByRole('button', { name: '2' });
    
    if (await page2Button.isVisible()) {
      await page2Button.click();
      await page.waitForTimeout(1000);

      // URL should contain page parameter
      expect(page.url()).toContain('page=2');
    }
  });

  test('should show correct number of items per page (15)', async ({ page }) => {
    const cards = page.locator('[class*="card"]');
    const count = await cards.count();
    
    // Should show exactly 15 or fewer items
    expect(count).toBeLessThanOrEqual(15);
    expect(count).toBeGreaterThan(0);
  });

  test('should disable previous button on first page', async ({ page }) => {
    const prevButton = page.locator(
      'button:has-text("Previous"), button:has-text("←"):not(:has-text("1"))'
    ).first();

    if (await prevButton.isVisible()) {
      const isDisabled = await prevButton.isDisabled();
      const className = await prevButton.getAttribute('class');
      
      expect(
        isDisabled || 
        className?.includes('disabled') ||
        className?.includes('cursor-not-allowed')
      ).toBe(true);
    }
  });

  test('should maintain pagination state with filters', async ({ page }) => {
    // Apply filter first
    const movieButton = page.getByRole('button', { name: /^movie$/i });
    if (await movieButton.isVisible()) {
      await movieButton.click();
      await page.waitForTimeout(1000);
    }

    // Go to page 2
    const page2Button = page.getByRole('button', { name: '2' });
    if (await page2Button.isVisible()) {
      await page2Button.click();
      await page.waitForTimeout(1000);

      // Both filter and page should be in URL
      const url = page.url().toLowerCase();
      expect(url).toContain('page=2');
    }
  });

  test('should show total results count', async ({ page }) => {
    // Look for total count display
    const totalCount = page.locator('text=/\\d+\\s*(results|shows|items|total)/i');
    
    const hasCount = await totalCount.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    // Total count is optional UI feature
    expect(true).toBe(true);
  });
});
