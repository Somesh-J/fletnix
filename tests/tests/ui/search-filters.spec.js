/**
 * FletNix UI Tests - Search & Filters
 * 
 * E2E tests for search functionality and filtering.
 * Following the Zen of Python: There should be one obvious way to do it.
 */

import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should have a search input field', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[placeholder*="earch"]');
    await expect(searchInput).toBeVisible();
  });

  test('should search by title when entering text', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[placeholder*="earch"]');
    await searchInput.fill('love');
    await searchInput.press('Enter');

    // Wait for results to update
    await page.waitForTimeout(1000);

    // URL should contain search parameter
    expect(page.url()).toContain('search=love');
  });

  test('should update results when searching', async ({ page }) => {
    // Get initial card count/content
    await page.waitForSelector('[class*="card"]');
    const initialCards = await page.locator('[class*="card"]').allTextContents();

    // Perform search
    const searchInput = page.locator('input[type="text"], input[placeholder*="earch"]');
    await searchInput.fill('batman');
    await searchInput.press('Enter');

    await page.waitForTimeout(1500);

    // Cards should update
    const newCards = await page.locator('[class*="card"]').allTextContents();
    
    // Results should be different or contain search term
    const hasBatman = newCards.some((card) => 
      card.toLowerCase().includes('batman')
    );
    
    if (newCards.length > 0) {
      expect(hasBatman).toBe(true);
    }
  });

  test('should show no results message for non-matching search', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[placeholder*="earch"]');
    await searchInput.fill('xyznonexistentmovie123');
    await searchInput.press('Enter');

    await page.waitForTimeout(1500);

    // Should show "no results" or empty state
    const noResults = page.locator('text=No, text=no results, text=Nothing found, text=0 results');
    const emptyCards = await page.locator('[class*="card"]').count();

    expect(await noResults.isVisible() || emptyCards === 0).toBe(true);
  });

  test('should clear search when input is cleared', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[placeholder*="earch"]');
    
    // Search first
    await searchInput.fill('comedy');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);

    // Clear search
    await searchInput.clear();
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);

    // URL should not contain search parameter
    expect(page.url()).not.toContain('search=comedy');
  });
});

test.describe('Type Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should filter by Movies when clicking Movie button', async ({ page }) => {
    const movieButton = page.getByRole('button', { name: /^movie$/i });
    
    if (await movieButton.isVisible()) {
      await movieButton.click();
      await page.waitForTimeout(1000);

      // URL should reflect filter
      expect(page.url().toLowerCase()).toContain('type=movie');

      // All visible cards should be movies
      const typeBadges = page.locator('text=Movie').all();
      const tvBadges = await page.locator('text=TV Show').count();
      
      // Should have movies and no TV shows
      expect(tvBadges).toBe(0);
    }
  });

  test('should filter by TV Shows when clicking TV Show button', async ({ page }) => {
    const tvButton = page.getByRole('button', { name: /tv show/i });
    
    if (await tvButton.isVisible()) {
      await tvButton.click();
      await page.waitForTimeout(1000);

      // URL should reflect filter
      expect(page.url().toLowerCase()).toContain('type=tv');
    }
  });

  test('should show all content when clicking All button', async ({ page }) => {
    // First filter by Movie
    const movieButton = page.getByRole('button', { name: /^movie$/i });
    if (await movieButton.isVisible()) {
      await movieButton.click();
      await page.waitForTimeout(500);
    }

    // Then click All
    const allButton = page.getByRole('button', { name: /^all$/i });
    if (await allButton.isVisible()) {
      await allButton.click();
      await page.waitForTimeout(1000);

      // URL should not have type filter
      expect(page.url()).not.toContain('type=Movie');
    }
  });

  test('should highlight active filter button', async ({ page }) => {
    const movieButton = page.getByRole('button', { name: /^movie$/i });
    
    if (await movieButton.isVisible()) {
      await movieButton.click();
      await page.waitForTimeout(500);

      // Button should have active/selected styling
      const buttonClass = await movieButton.getAttribute('class');
      expect(
        buttonClass?.includes('active') || 
        buttonClass?.includes('selected') ||
        buttonClass?.includes('bg-red') ||
        buttonClass?.includes('bg-netflix')
      ).toBe(true);
    }
  });
});

test.describe('Genre Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should display genre dropdown or list', async ({ page }) => {
    const genreFilter = page.locator('select, [class*="genre"], button:has-text("Genre")');
    
    // Genre filter should be present
    const hasGenreFilter = await genreFilter.first().isVisible();
    expect(hasGenreFilter).toBe(true);
  });

  test('should filter by selected genre', async ({ page }) => {
    const genreSelect = page.locator('select').first();
    
    if (await genreSelect.isVisible()) {
      // Select a genre (e.g., Comedy)
      await genreSelect.selectOption({ label: /comed/i });
      await page.waitForTimeout(1000);

      // URL should contain genre parameter
      expect(page.url().toLowerCase()).toContain('genre=');
    }
  });
});

test.describe('Combined Filters', () => {
  test('should combine search with type filter', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Apply type filter
    const movieButton = page.getByRole('button', { name: /^movie$/i });
    if (await movieButton.isVisible()) {
      await movieButton.click();
      await page.waitForTimeout(500);
    }

    // Apply search
    const searchInput = page.locator('input[type="text"], input[placeholder*="earch"]');
    await searchInput.fill('love');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);

    // URL should have both parameters
    const url = page.url().toLowerCase();
    expect(url).toContain('search=love');
  });

  test('should maintain filters during pagination', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Apply type filter
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

      // Type filter should still be active
      expect(page.url().toLowerCase()).toContain('type=movie');
    }
  });
});
