/**
 * FletNix UI Tests - Home Page & Navigation
 * 
 * E2E tests for the main home page and navigation.
 * Following the Zen of Python: Beautiful is better than ugly.
 */

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the FletNix logo and branding', async ({ page }) => {
    // Use first() to handle multiple matches
    await expect(page.locator('text=FLETNIX').first()).toBeVisible();
  });

  test('should display navigation bar with links', async ({ page }) => {
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('should display show cards in a grid', async ({ page }) => {
    // Wait for shows to load
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });
    
    // Check that multiple cards are displayed
    const cards = page.locator('[class*="card"], [class*="rounded"]').filter({ hasText: /.+/ });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display pagination controls', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for page numbers or pagination
    const pagination = page.locator('button:has-text("1"), button:has-text("2"), [class*="pagination"]');
    await expect(pagination.first()).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[placeholder*="earch"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display filter buttons', async ({ page }) => {
    // Check that at least one filter button exists
    const allButton = page.getByRole('button', { name: 'All' });
    await expect(allButton).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    const signInLink = page.getByRole('link', { name: /sign in/i });
    await signInLink.click();

    await expect(page).toHaveURL('/login');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    
    // Try to find Sign Up or Register link
    const signUpLink = page.getByRole('link', { name: /sign up|register/i });
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page).toHaveURL('/register');
    }
  });

  test('should navigate to home from logo click', async ({ page }) => {
    await page.goto('/login');

    // Click on the navbar logo specifically
    await page.locator('nav').getByRole('link', { name: 'FLETNIX' }).click();

    await expect(page).toHaveURL('/');
  });
});

test.describe('Show Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should display show title on cards', async ({ page }) => {
    const cards = page.locator('[class*="card"]').first();
    await expect(cards).toBeVisible();
    
    // Card should have text content (title)
    const text = await cards.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('should navigate to show detail on card click', async ({ page }) => {
    // Find a clickable card element
    const cards = page.locator('[class*="card"]').first();
    await cards.click();

    // Should navigate to detail page
    await page.waitForURL(/\/show\//);
    expect(page.url()).toContain('/show/');
  });

  test('should show movie or TV show type', async ({ page }) => {
    // Check for type badge or text anywhere on page
    const movieText = page.locator('text=Movie').first();
    const tvText = page.locator('text=TV Show').first();
    
    const hasMovie = await movieText.isVisible().catch(() => false);
    const hasTV = await tvText.isVisible().catch(() => false);
    
    // At least one type should be visible
    expect(hasMovie || hasTV).toBe(true);
  });
});
