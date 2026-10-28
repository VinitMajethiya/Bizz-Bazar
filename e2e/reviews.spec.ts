import { test, expect } from '@playwright/test';

test.describe('Reviews & Testimonials Smoke Test', () => {
  test('submits review from product page and moderates it in admin', async ({ page }) => {
    // 1. Setup mock session for admin
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
          { key: 'whatsapp_number', value: '919999999999' },
          { key: 'instagram_handle', value: 'by.raya.co' },
        ]),
      });
    });

    // Mock product detail
    const mockProductId = 'a0000000-0000-4000-8000-000000000000';
    await page.route('**/rest/v1/products?select=*&slug=eq.lilac-twist-hoops*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockProductId,
          slug: 'lilac-twist-hoops',
          name: 'Lilac Twist Hoops',
          category: 'Earrings',
          description: 'Delicate gold-toned twist hoops with subtle lilac accents.',
          price_paise: 49900,
          compare_at_price_paise: 69900,
          stock_status: 'in_stock',
          stock_qty: 15,
          badge: 'New Drop',
          options: {
            materials: ['Gold', 'Silver'],
            sizes: ['One Size'],
          },
          specs_json: {
            Material: '18k gold plated brass, anti-tarnish coating',
            Closure: 'Hypoallergenic latch back',
          },
          is_featured: true,
          is_archived: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product_images: [],
        }),
      });
    });

    // Mock product review stats view
    await page.route('**/rest/v1/product_review_stats*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            product_id: mockProductId,
            review_count: 1,
            avg_rating: 5.0,
          },
        ]),
      });
    });

    // Mock reviews query for product
    await page.route('**/rest/v1/reviews?select=*&product_id=eq.*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          headers: {
            'content-range': '0-0/1',
          },
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'rev-existing-1',
              product_id: mockProductId,
              rating: 5,
              reviewer_name: 'Aditi K.',
              title: 'Everyday favourite',
              review_text: 'The gold finish looks genuine and does not tarnish.',
              status: 'approved',
              is_offline: false,
              show_on_home: false,
              created_at: new Date().toISOString(),
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    // Mock submit review (POST)
    let reviewSubmitted = false;
    await page.route('**/rest/v1/reviews', async (route) => {
      if (route.request().method() === 'POST') {
        reviewSubmitted = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'rev-new-test',
              reviewer_name: 'TEST-E2E-Reviewer',
              status: 'pending',
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    // --- Part 1: Customer submits review from product page ---
    await page.goto('/product/lilac-twist-hoops');
    await expect(page.getByRole('heading', { name: 'Customer Reviews' })).toBeVisible();

    // Tap "Write a review"
    const writeBtn = page.getByRole('button', { name: /Write a review/i });
    await expect(writeBtn).toBeVisible();
    await writeBtn.click();

    // Verify modal opened
    await expect(page.getByRole('heading', { name: 'Review this piece' })).toBeVisible();

    // Fill form
    await page.fill('input#reviewer_name', 'TEST-E2E-Reviewer');
    await page.fill('input#review_title', 'Stunning Everyday Hoops');
    await page.fill('textarea#review_text', 'These hoops look far more expensive than they are. Absolutely love the light lilac accents.');

    // Ensure 3 seconds elapse so human threshold is met
    await page.waitForTimeout(3100);

    // Submit review
    await page.click('button[type="submit"]');

    // Assert success view is shown
    await expect(page.getByRole('heading', { name: 'Thank you for your review!' })).toBeVisible();
    expect(reviewSubmitted).toBe(true);

    // Close modal
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('heading', { name: 'Review this piece' })).not.toBeVisible();

    // --- Part 2: Admin moderates reviews in /admin/reviews ---
    // Mock admin reviews query
    const mockAdminReviews = [
      {
        id: 'rev-test-pending-1',
        product_id: mockProductId,
        rating: 5,
        reviewer_name: 'TEST-E2E-Reviewer',
        title: 'Stunning Everyday Hoops',
        review_text: 'These hoops look far more expensive than they are.',
        status: 'pending',
        is_offline: false,
        show_on_home: false,
        created_at: new Date().toISOString(),
        products: {
          id: mockProductId,
          name: 'Lilac Twist Hoops',
          slug: 'lilac-twist-hoops',
        },
      },
    ];

    await page.route('**/rest/v1/reviews?select=*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAdminReviews),
      });
    });

    await page.goto('/admin/reviews?tab=pending');
    await expect(page.getByRole('heading', { name: 'Reviews Moderation' })).toBeVisible();

    // Verify Pending tab has our TEST review
    await expect(page.getByText('TEST-E2E-Reviewer')).toBeVisible();
    await expect(page.getByText('Customer submission')).toBeVisible();

    // Verify "Show on home page" checkbox is disabled for pending review
    const homeCheckbox = page.locator('#home-toggle-rev-test-pending-1');
    await expect(homeCheckbox).toBeDisabled();

    // Verify Show and Hide action buttons exist
    await expect(page.getByRole('button', { name: 'Show', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hide', exact: true })).toBeVisible();
  });
});
