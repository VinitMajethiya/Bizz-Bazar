import { test, expect } from '@playwright/test';

test.describe('Enquiry Inbox Smoke Test', () => {
  test('places an enquiry from storefront, sees it in admin inbox, and marks it handled', async ({
    page,
  }) => {
    // Inject mock admin session into localStorage for admin access
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

    // 1. Mock products query
    await page.route('**/rest/v1/products*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'c1111111-1111-1111-1111-111111111111',
            slug: 'lilac-twist-hoops',
            name: 'Lilac Twist Hoops',
            category: 'Earrings',
            description: 'Chic twist hoops',
            price_paise: 49900,
            compare_at_price_paise: 69900,
            stock_status: 'in_stock',
            stock_qty: 15,
            badge: 'New drop',
            options: { materials: ['Gold'], sizes: [] },
            specs_json: {},
            is_featured: true,
            is_archived: false,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            images: [],
          },
        ]),
      });
    });

    // 2. Mock create_enquiry RPC
    let createdEnquiry = false;
    await page.route('**/rest/v1/rpc/create_enquiry', async (route) => {
      createdEnquiry = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ref: 'BR-INBOXTEST',
          items: [
            {
              product_id: 'c1111111-1111-1111-1111-111111111111',
              name: 'Lilac Twist Hoops',
              options: { material: 'Gold' },
              unit_price_paise: 49900,
              qty: 1,
            },
          ],
          subtotal_paise: 49900,
          discount_paise: 0,
        }),
      });
    });

    // 3. Mock enquiries query and updates
    let enquiryStatus = 'new';
    let internalNotes = '';

    await page.route('**/rest/v1/enquiries*', async (route) => {
      const method = route.request().method();

      if (method === 'PATCH') {
        const patchData = route.request().postDataJSON() as Record<string, string>;
        if (patchData.status) enquiryStatus = patchData.status;
        if (patchData.internal_notes !== undefined) internalNotes = patchData.internal_notes;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'e1111111-1111-1111-1111-111111111111',
              ref: 'BR-INBOXTEST',
              status: enquiryStatus,
              internal_notes: internalNotes,
            },
          ]),
        });
        return;
      }

      const enquiryObj = {
        id: 'e1111111-1111-1111-1111-111111111111',
        ref: 'BR-INBOXTEST',
        items_json: [
          {
            product_id: 'c1111111-1111-1111-1111-111111111111',
            name: 'Lilac Twist Hoops',
            options: { material: 'Gold' },
            unit_price_paise: 49900,
            qty: 1,
          },
        ],
        subtotal_paise: 49900,
        discount_paise: 0,
        coupon_code: null,
        channel: 'whatsapp',
        customer_note: 'Gift wrap please',
        internal_notes: internalNotes,
        status: enquiryStatus,
        created_at: new Date().toISOString(),
      };

      const acceptHeader = route.request().headers()['accept'] || '';
      const isSingle = acceptHeader.includes('application/vnd.pgrst.object+json');

      await route.fulfill({
        status: 200,
        contentType: isSingle ? 'application/vnd.pgrst.object+json' : 'application/json',
        body: JSON.stringify(isSingle ? enquiryObj : [enquiryObj]),
      });
    });

    // 4. Storefront: Add to bag and tap "Order on WhatsApp"
    await page.goto('/product/lilac-twist-hoops');
    await page.getByRole('button', { name: /add to bag/i }).click();

    const drawer = page.getByRole('dialog', { name: /shopping bag/i });
    await expect(drawer).toBeVisible();

    await page.route('https://wa.me/**', async (route) => {
      await route.abort();
    });
    await drawer.getByRole('button', { name: /order on whatsapp/i }).click();
    await expect.poll(() => createdEnquiry).toBe(true);
    await page.waitForTimeout(500);

    // 5. Admin: Open Enquiries Inbox
    await page.goto('/admin/enquiries');

    // Verify enquiry appears with reference BR-INBOXTEST
    const enquiryRow = page.getByText('BR-INBOXTEST');
    await expect(enquiryRow).toBeVisible();

    // 6. View Enquiry Detail
    await enquiryRow.click();
    await expect(page.getByRole('heading', { name: 'BR-INBOXTEST' })).toBeVisible();
    await expect(page.getByText('Gift wrap please')).toBeVisible();

    // 7. Mark enquiry as handled
    const markHandledBtn = page.getByRole('button', { name: /mark handled/i });
    await expect(markHandledBtn).toBeVisible();
    await markHandledBtn.click();

    // Verify status updated to handled
    await expect.poll(() => enquiryStatus).toBe('handled');
    await expect(page.getByText('handled', { exact: true })).toBeVisible();
  });
});
