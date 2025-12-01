import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the FletNix logo', async ({ page }) => {
    await expect(page.locator('text=FLETNIX')).toBeVisible();
  });

  test('should display show cards', async ({ page }) => {
    // Wait for shows to load
    await page.waitForSelector('.show-card', { timeout: 10000 });
    
    const cards = page.locator('.show-card');
    await expect(cards.first()).toBeVisible();
  });

  test('should navigate to show detail on card click', async ({ page }) => {
    await page.waitForSelector('.show-card', { timeout: 10000 });
    
    await page.locator('.show-card').first().click();
    
    await expect(page).toHaveURL(/\/show\//);
  });

  test('should filter by type', async ({ page }) => {
    // Click on Movie filter
    await page.getByRole('button', { name: 'Movie' }).click();
    
    // Wait for results to update
    await page.waitForTimeout(500);
    
    // All visible cards should be movies
    const movieBadges = page.locator('.show-card >> text=Movie');
    await expect(movieBadges.first()).toBeVisible();
  });

  test('should search for shows', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('love');
    await searchInput.press('Enter');
    
    // URL should update with search query
    await expect(page).toHaveURL(/search=love/);
  });

  test('should paginate results', async ({ page }) => {
    await page.waitForSelector('.show-card', { timeout: 10000 });
    
    // Find and click page 2
    const page2Button = page.getByRole('button', { name: '2' });
    if (await page2Button.isVisible()) {
      await page2Button.click();
      await page.waitForTimeout(500);
      
      // Cards should still be visible
      await expect(page.locator('.show-card').first()).toBeVisible();
    }
  });
});

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign In' }).click();
    
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign Up' }).click();
    
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should show error toast
    await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 });
  });

  test('should register new user', async ({ page }) => {
    await page.goto('/register');
    
    const email = `test${Date.now()}@example.com`;
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="number"]', '25');
    await page.fill('input#password', 'password123');
    await page.fill('input#confirmPassword', 'password123');
    
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });
});

test.describe('Show Detail Page', () => {
  test('should display show details', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.show-card', { timeout: 10000 });
    
    // Click on first show
    await page.locator('.show-card').first().click();
    
    // Should show details
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Back to Browse')).toBeVisible();
  });

  test('should show back button that works', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.show-card', { timeout: 10000 });
    
    await page.locator('.show-card').first().click();
    await page.waitForURL(/\/show\//);
    
    await page.getByText('Back to Browse').click();
    
    await expect(page).toHaveURL('/');
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should show mobile menu button
    await expect(page.locator('[data-testid="mobile-menu"]').or(page.locator('button:has(svg)'))).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('text=FLETNIX')).toBeVisible();
  });
});
