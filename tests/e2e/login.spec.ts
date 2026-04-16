import { test, expect } from '@playwright/test';

test.describe('Basic Playwright Setup', () => {
  test('should have correct URL', async ({ page }) => {
    await page.goto('http://localhost:5173');
    expect(page.url()).toContain('localhost:5173');
  });

  test('should show login form', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should navigate to login and show title', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    const title = page.locator('h1');
    await expect(title).toBeVisible();
  });
});

test.describe('Login Functionality', () => {
  test('should login with student credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    await page.fill('input[name="email"]', 'student@university.edu');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard - more reliable than networkidle
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/login');
  });
});

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="email"]', 'student@university.edu');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    // Wait for dashboard navigation
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should navigate between main pages', async ({ page }) => {
    expect(page.url()).toMatch(/(dashboard|students)/);

    const navLinks = page.locator('nav a[href]');
    const navCount = await navLinks.count();
    expect(navCount).toBeGreaterThan(0);
  });

  test('should navigate to specific pages', async ({ page }) => {
    await page.goto('http://localhost:5173/students');
    await page.waitForURL('**/students');
    expect(page.url()).toContain('/students');

    await page.goto('http://localhost:5173/courses');
    await page.waitForURL('**/courses');
    expect(page.url()).toContain('/courses');
  });
});
