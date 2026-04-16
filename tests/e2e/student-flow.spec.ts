import { test, expect } from '@playwright/test';

test.describe('Student Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@university.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('should add a new student and verify in list', async ({ page }) => {
    // Navigate to students page
    await page.click('a[href="/admin/students"]');
    await expect(page).toHaveURL('/admin/students');

    // Open add student dialog
    await page.click('button:has-text("إضافة طالب")');
    
    // Fill student details
    const uniqueId = Date.now().toString();
    const studentName = `Test Student ${uniqueId}`;
    const studentEmail = `student${uniqueId}@test.com`;
    const universityId = `2024${uniqueId.slice(-4)}`;

    await page.fill('input[name="name"]', studentName);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="university_id"]', universityId);
    
    // Select department (assuming select works with click)
    // This depends on how Select component is implemented (Radix UI usually)
    // For now we might skip complex select interaction if it's hard to mock without ID
    // But let's try to fill required fields.
    
    // Submit
    await page.click('button[type="submit"]');

    // Verify toast or success message
    // await expect(page.locator('text=تم إضافة الطالب بنجاح')).toBeVisible();

    // Verify student in list
    // Use search to find the student
    await page.fill('input[placeholder*="بحث"]', studentName);
    
    // Check if row exists
    await expect(page.locator(`text=${studentName}`)).toBeVisible();
  });
});
