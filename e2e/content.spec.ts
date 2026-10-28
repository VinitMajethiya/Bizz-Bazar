import { test, expect } from '@playwright/test';

test.describe('Content Pages & Admin Settings E2E Smoke Tests', () => {
  test('Storefront: Contact page renders channels and submits message successfully', async ({ page }) => {
    // Mock site settings for contact page
    await page.route('**/rest/v1/site_settings*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { key: 'brand_name', value: 'By Raya.co' },
          { key: 'whatsapp_number', value: '919999999999' },
          { key: 'instagram_handle', value: 'by.raya.co' },
          { key: 'support_email', value: 'hello@byraya.co' },
          { key: 'business_hours', value: 'Mon – Sat: 10:00 AM – 7:00 PM IST' },
        ]),
      });
    });

    // Mock contact_messages insertion
    await page.route('**/rest/v1/contact_messages*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/contact');

    // Verify contact channels exist
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    await expect(page.getByRole('link', { name: /WhatsApp/i })).toHaveAttribute('href', /wa\.me\/919999999999/);
    await expect(page.getByRole('link', { name: /Instagram DM/i })).toHaveAttribute('href', /ig\.me\/m\/by\.raya\.co/);
    await expect(page.getByText('hello@byraya.co')).toBeVisible();

    // Fill contact form
    await page.getByLabel(/Your Name/i).fill('Meera Kapoor');
    await page.getByLabel(/Email or Phone/i).fill('meera@example.com');
    await page.getByLabel(/Message/i).fill('Can you make a custom length for the Solis bracelet?');

    // Submit form
    await page.getByRole('button', { name: /Send Message/i }).click();

    // Confirm thank you message
    await expect(page.getByText('Message Received')).toBeVisible();
    await expect(page.getByText(/We received your message and will reply shortly/i)).toBeVisible();
  });

  test('Storefront: CMS page renders markdown content', async ({ page }) => {
    // Mock pages query
    await page.route('**/rest/v1/pages*', async (route) => {
      const acceptHeader = route.request().headers()['accept'] || '';
      const payload = {
        slug: 'our-story',
        title: 'Our Story & Philosophy',
        meta_description: 'Discover the story behind By Raya.co fine jewellery.',
        body_md: '## Crafted for Everyday Life\n\nWe believe fine jewellery should be worn and cherished every day, not kept in a vault.',
        updated_at: new Date().toISOString(),
      };

      if (acceptHeader.includes('vnd.pgrst.object')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(payload),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([payload]),
        });
      }
    });

    await page.goto('/our-story');

    await expect(page.getByRole('heading', { name: 'Our Story & Philosophy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Crafted for Everyday Life' })).toBeVisible();
    await expect(page.getByText(/We believe fine jewellery should be worn and cherished/i)).toBeVisible();
  });

  test('Admin: Content & Settings portal manages settings, cms pages, and leads', async ({ page }) => {
    // Setup mock admin session
    await page.addInitScript(() => {
      const mockSession = {
        access_token: 'fake-jwt-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'fake-refresh-token',
        user: {
          id: '00000000-0000-0000-0000-000000000000',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'admin@byraya.co',
        },
      };
      window.localStorage.setItem('sb-ingjxzpzfidfsjbdfvyi-auth-token', JSON.stringify(mockSession));
      window.localStorage.setItem('sb-placeholder-auth-token', JSON.stringify(mockSession));
    });

    // Mock profiles check for admin role
    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '00000000-0000-0000-0000-000000000000',
          role: 'admin',
        }),
      });
    });

    // Mock site settings
    await page.route('**/rest/v1/site_settings*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { key: 'brand_name', value: 'By Raya.co' },
          { key: 'tagline', value: 'effortless elegance for every occasion' },
          { key: 'whatsapp_number', value: '919999999999' },
          { key: 'instagram_handle', value: 'by.raya.co' },
          { key: 'support_email', value: 'hello@byraya.co' },
          { key: 'business_hours', value: 'Mon – Sat: 10:00 AM – 7:00 PM IST' },
          { key: 'ticker_text', value: 'Complimentary gift box on all orders' },
          { key: 'hero_headline', value: 'Everyday luxury, without the luxury price' },
          { key: 'hero_text', value: 'Thoughtfully designed demi-fine jewellery' },
          { key: 'hero_image_url', value: '' },
          { key: 'story_teaser', value: 'Born from a desire for minimal elegance' },
          { key: 'footer_text', value: 'Handcrafted demi-fine jewellery' },
        ]),
      });
    });

    // Mock CMS pages
    await page.route('**/rest/v1/pages*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            slug: 'our-story',
            title: 'Our Story',
            meta_description: 'About By Raya.co',
            body_md: '## Handcrafted Beauty\n\nPure 18k gold vermeil and sterling silver.',
            updated_at: new Date().toISOString(),
          },
          {
            slug: 'how-to-order',
            title: 'How to Order',
            meta_description: 'How to order from By Raya.co',
            body_md: 'Ordering is as simple as sending a WhatsApp message.',
            updated_at: new Date().toISOString(),
          },
        ]),
      });
    });

    // Mock newsletter leads
    await page.route('**/rest/v1/newsletter_leads*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'lead-1',
            contact: 'customer@example.com',
            created_at: new Date().toISOString(),
          },
        ]),
      });
    });

    // Mock contact messages
    await page.route('**/rest/v1/contact_messages*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'msg-1',
            name: 'Ananya Verma',
            contact: 'ananya@example.com',
            message: 'Do you offer gift notes?',
            created_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.goto('/admin/content');

    // 1. Settings tab should be visible
    await expect(page.getByRole('heading', { name: 'Content & Site Settings' })).toBeVisible();
    await expect(page.getByLabel('Brand Name')).toHaveValue('By Raya.co');

    // 2. Switch to CMS Pages tab
    await page.getByRole('button', { name: 'CMS Pages' }).click();
    await expect(page.locator('#page-select')).toBeVisible();
    await expect(page.getByText('Live Preview:')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Handcrafted Beauty' })).toBeVisible();

    // 3. Switch to Leads & Messages tab
    await page.getByRole('button', { name: 'Leads & Messages' }).click();
    await expect(page.getByText('Drop-Alert Subscribers (1)')).toBeVisible();
    await expect(page.getByText('customer@example.com')).toBeVisible();
    await expect(page.getByText('Contact Form Messages (1)')).toBeVisible();
    await expect(page.getByText('Ananya Verma')).toBeVisible();
    await expect(page.getByText('Do you offer gift notes?')).toBeVisible();
  });
});
