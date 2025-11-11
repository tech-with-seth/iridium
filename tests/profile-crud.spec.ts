import { test, expect } from '@playwright/test';

test.describe('Profile CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
        // Sign in before each test
        await page.goto('/sign-in');
        await page.fill('input[name="email"]', 'alice@iridium.com');
        await page.fill('input[name="password"]', 'Alice123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test.describe('Profile Read', () => {
        test('displays user profile information', async ({ page }) => {
            await page.goto('/profile');

            // Check that profile loads
            await expect(page).toHaveURL('/profile');

            // Check for user information
            await expect(page.getByText('alice@iridium.com')).toBeVisible();
        });
    });

    test.describe('Profile Update', () => {
        test('updates profile name successfully', async ({ page }) => {
            await page.goto('/profile/edit');

            // Update name
            const nameInput = page.locator('input[name="name"]');
            await nameInput.clear();
            await nameInput.fill('Alice Updated');

            // Submit form
            await page.click('button[type="submit"]');

            // Should show success message or redirect
            await expect(
                page.locator('text=/success|updated/i'),
            ).toBeVisible({
                timeout: 5000,
            });
        });

        test('validates required fields', async ({ page }) => {
            await page.goto('/profile/edit');

            // Clear name field
            const nameInput = page.locator('input[name="name"]');
            await nameInput.clear();

            // Try to submit
            await page.click('button[type="submit"]');

            // Should show validation error
            await expect(page.locator('text=/required/i')).toBeVisible();
        });

        test('handles form submission with loading state', async ({
            page,
        }) => {
            await page.goto('/profile/edit');

            const nameInput = page.locator('input[name="name"]');
            await nameInput.clear();
            await nameInput.fill('Alice Test');

            // Click submit
            const submitButton = page.locator('button[type="submit"]');
            await submitButton.click();

            // Button should show loading state (adjust text based on implementation)
            await expect(
                submitButton.locator('text=/saving|loading/i'),
            ).toBeVisible({
                timeout: 1000,
            });
        });
    });

    test.describe('Form Validation', () => {
        test('validates email format in forms', async ({ page }) => {
            await page.goto('/profile/edit');

            // Try invalid email if email field is editable
            const emailInput = page.locator('input[name="email"]');
            if (await emailInput.isVisible()) {
                await emailInput.clear();
                await emailInput.fill('invalid-email');

                await page.click('button[type="submit"]');

                const isInvalid = await emailInput.evaluate((el) =>
                    el.checkValidity(),
                );
                expect(isInvalid).toBe(false);
            }
        });

        test('shows real-time validation errors', async ({ page }) => {
            await page.goto('/profile/edit');

            const nameInput = page.locator('input[name="name"]');
            await nameInput.clear();

            // Blur to trigger validation
            await nameInput.blur();

            // Should show error message
            await expect(page.locator('text=/required|name/i')).toBeVisible({
                timeout: 2000,
            });
        });
    });
});

test.describe('Form Submission Flows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-in');
        await page.fill('input[name="email"]', 'admin@iridium.com');
        await page.fill('input[name="password"]', 'Admin123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test.describe('Contact Form', () => {
        test('submits contact form successfully', async ({ page }) => {
            // Assuming there's a contact route
            await page.goto('/');

            const contactForm = page.locator('form').first();
            if (await contactForm.isVisible()) {
                await page.fill('input[name="name"]', 'Test User');
                await page.fill('input[name="email"]', 'test@example.com');
                await page.fill('textarea[name="message"]', 'Test message');

                await page.click('button[type="submit"]');

                await expect(
                    page.locator('text=/success|sent|thank you/i'),
                ).toBeVisible({
                    timeout: 5000,
                });
            }
        });
    });

    test.describe('File Upload', () => {
        test('uploads file successfully', async ({ page }) => {
            await page.goto('/admin/design');

            // Locate file input
            const fileInput = page.locator('input[type="file"]');
            if (await fileInput.isVisible()) {
                // Create a test file
                await fileInput.setInputFiles({
                    name: 'test-image.png',
                    mimeType: 'image/png',
                    buffer: Buffer.from('fake image content'),
                });

                // Submit form
                await page.click('button[type="submit"]:near(input[type="file"])');

                // Check for success
                await expect(
                    page.locator('text=/success|uploaded/i'),
                ).toBeVisible({
                    timeout: 10000,
                });
            }
        });
    });
});

test.describe('Error Handling', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-in');
        await page.fill('input[name="email"]', 'admin@iridium.com');
        await page.fill('input[name="password"]', 'Admin123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test('handles network errors gracefully', async ({ page, context }) => {
        await page.goto('/profile/edit');

        // Simulate offline
        await context.setOffline(true);

        const nameInput = page.locator('input[name="name"]');
        await nameInput.clear();
        await nameInput.fill('Test Name');

        await page.click('button[type="submit"]');

        // Should show error message
        await expect(
            page.locator('text=/error|failed|network/i'),
        ).toBeVisible({
            timeout: 5000,
        });

        // Go back online
        await context.setOffline(false);
    });

    test('prevents double submission', async ({ page }) => {
        await page.goto('/profile/edit');

        const nameInput = page.locator('input[name="name"]');
        await nameInput.clear();
        await nameInput.fill('Test Name');

        const submitButton = page.locator('button[type="submit"]');

        // Click submit
        await submitButton.click();

        // Button should be disabled during submission
        await expect(submitButton).toBeDisabled();
    });
});

test.describe('Data Persistence', () => {
    test('persists form data across page refreshes', async ({ page }) => {
        await page.goto('/sign-in');
        await page.fill('input[name="email"]', 'admin@iridium.com');
        await page.fill('input[name="password"]', 'Admin123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');

        await page.goto('/profile/edit');

        // Fill form
        const nameInput = page.locator('input[name="name"]');
        const originalValue = await nameInput.inputValue();

        await nameInput.clear();
        await nameInput.fill('Temporary Name');

        // Reload without submitting
        await page.reload();

        // Original value should be restored (from server)
        const reloadedValue = await nameInput.inputValue();
        expect(reloadedValue).toBe(originalValue);
    });

    test('reflects changes immediately after update', async ({ page }) => {
        await page.goto('/sign-in');
        await page.fill('input[name="email"]', 'alice@iridium.com');
        await page.fill('input[name="password"]', 'Alice123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');

        await page.goto('/profile/edit');

        const nameInput = page.locator('input[name="name"]');
        const newName = `Alice Updated ${Date.now()}`;
        await nameInput.clear();
        await nameInput.fill(newName);

        await page.click('button[type="submit"]');

        // Wait for success
        await page.waitForTimeout(1000);

        // Navigate to profile view
        await page.goto('/profile');

        // Should show updated name
        await expect(page.getByText(newName)).toBeVisible({ timeout: 5000 });
    });
});
