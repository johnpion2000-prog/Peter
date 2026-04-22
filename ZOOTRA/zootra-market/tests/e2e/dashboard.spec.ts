import { test, expect } from '@playwright/test';

test.describe('Dashboard End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Navigate to the landing page
    await page.click('text=Login'); // Click on the login link
    await page.fill('input[name="email"]', 'testuser@example.com'); // Fill in email
    await page.fill('input[name="password"]', 'password123'); // Fill in password
    await page.click('button[type="submit"]'); // Submit the login form
    await page.waitForNavigation(); // Wait for navigation to complete
  });

  test('should display user listings on My Listings page', async ({ page }) => {
    await page.click('text=My Listings'); // Navigate to My Listings
    const listings = await page.locator('.listing-card'); // Selector for listing cards
    await expect(listings).toHaveCount(3); // Expect 3 listings to be present
  });

  test('should create a new listing', async ({ page }) => {
    await page.click('text=Create Listing'); // Navigate to Create Listing
    await page.fill('input[name="title"]', 'Test Product'); // Fill in title
    await page.fill('textarea[name="description"]', 'This is a test product.'); // Fill in description
    await page.fill('input[name="price"]', '100'); // Fill in price
    await page.click('button[type="submit"]'); // Submit the form
    await expect(page.locator('.notification')).toHaveText('Listing created successfully'); // Check for success message
  });

  test('should edit an existing listing', async ({ page }) => {
    await page.click('text=My Listings'); // Navigate to My Listings
    await page.click('text=Edit'); // Click on the edit button for the first listing
    await page.fill('input[name="title"]', 'Updated Test Product'); // Update title
    await page.click('button[type="submit"]'); // Submit the form
    await expect(page.locator('.notification')).toHaveText('Listing updated successfully'); // Check for success message
  });

  test('should delete a listing', async ({ page }) => {
    await page.click('text=My Listings'); // Navigate to My Listings
    await page.click('text=Delete'); // Click on the delete button for the first listing
    await page.click('button.confirm'); // Confirm deletion
    await expect(page.locator('.notification')).toHaveText('Listing deleted successfully'); // Check for success message
  });

  test('should display user bookings on My Bookings page', async ({ page }) => {
    await page.click('text=My Bookings'); // Navigate to My Bookings
    const bookings = await page.locator('.booking-card'); // Selector for booking cards
    await expect(bookings).toHaveCount(2); // Expect 2 bookings to be present
  });

  test('should integrate WhatsApp chat', async ({ page }) => {
    await page.click('text=My Listings'); // Navigate to My Listings
    await page.click('text=Chat'); // Click on the chat button for the first listing
    await expect(page).toHaveURL(/whatsapp.com/); // Check if redirected to WhatsApp
  });
});