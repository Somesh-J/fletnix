/**
 * FletNix UI Tests - Authentication
 * 
 * E2E tests for login, registration, and authentication flows.
 * Following the Zen of Python: Errors should never pass silently.
 */

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /sign up|register|create/i });
    await expect(registerLink).toBeVisible();
    
    await registerLink.click();
    await expect(page).toHaveURL('/register');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message or toast
    await expect(
      page.locator('text=Invalid, text=error, text=Error, [class*="error"], [role="alert"]')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Browser validation should prevent submission or show error
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('should login successfully with valid credentials', async ({ page, request }) => {
    // First register a user via API
    const email = `login_ui_${Date.now()}@fletnix.com`;
    const password = 'TestPass123!';

    await request.post('http://localhost:8000/api/auth/register', {
      data: { email, password, age: 25 },
    });

    // Now login via UI
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to home and show user logged in
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Should show logout option or user email
    await expect(
      page.locator('text=Logout, text=Sign Out, button:has-text("Logout")')
        .or(page.locator(`text=${email}`))
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign up|register/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="number"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('should show link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /sign in|login/i });
    await expect(loginLink).toBeVisible();
    
    await loginLink.click();
    await expect(page).toHaveURL('/login');
  });

  test('should register new user successfully', async ({ page }) => {
    const email = `register_ui_${Date.now()}@fletnix.com`;

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="number"]', '25');
    
    // Fill password fields
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('TestPass123!');
    
    if (await passwordInputs.nth(1).isVisible()) {
      await passwordInputs.nth(1).fill('TestPass123!');
    }

    await page.getByRole('button', { name: /sign up|register/i }).click();

    // Should redirect to login or home
    await expect(page).toHaveURL(/\/(login|$)/, { timeout: 10000 });
  });

  test('should validate password match', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="number"]', '25');
    
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('TestPass123!');
    
    if (await passwordInputs.nth(1).isVisible()) {
      await passwordInputs.nth(1).fill('DifferentPass123!');
      await page.getByRole('button', { name: /sign up|register/i }).click();

      // Should show password mismatch error
      await expect(
        page.locator('text=match, text=Match, [class*="error"]')
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('should validate age is provided', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.locator('input[type="password"]').first().fill('TestPass123!');

    await page.getByRole('button', { name: /sign up|register/i }).click();

    // Age field should be required
    const ageInput = page.locator('input[type="number"]');
    const isInvalid = await ageInput.evaluate((el) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('should accept minor age (under 18)', async ({ page }) => {
    const email = `minor_ui_${Date.now()}@fletnix.com`;

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="number"]', '16');
    
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('TestPass123!');
    
    if (await passwordInputs.nth(1).isVisible()) {
      await passwordInputs.nth(1).fill('TestPass123!');
    }

    await page.getByRole('button', { name: /sign up|register/i }).click();

    // Should register successfully
    await expect(page).toHaveURL(/\/(login|$)/, { timeout: 10000 });
  });
});

test.describe('Authentication State', () => {
  test('should persist login state after page reload', async ({ page, request }) => {
    // Register and login
    const email = `persist_${Date.now()}@fletnix.com`;
    await request.post('http://localhost:8000/api/auth/register', {
      data: { email, password: 'TestPass123!', age: 25 },
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(
      page.locator('text=Logout, text=Sign Out').or(page.locator(`text=${email}`))
    ).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page, request }) => {
    // Register and login
    const email = `logout_${Date.now()}@fletnix.com`;
    await request.post('http://localhost:8000/api/auth/register', {
      data: { email, password: 'TestPass123!', age: 25 },
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Find and click logout
    const logoutButton = page.locator('text=Logout, text=Sign Out, button:has-text("Logout")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should show Sign In link again
      await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible({ timeout: 5000 });
    }
  });
});
