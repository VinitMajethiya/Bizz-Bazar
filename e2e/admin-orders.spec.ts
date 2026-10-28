import { test, expect } from '@playwright/test';

test.describe('Admin Order Pipeline End-to-End', () => {
  test('places enquiry from storefront, converts to order in admin, advances status, and exports CSV', async ({
    page,
  }) => {
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
          ref: 'BR-E2ETEST',
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

    // Mock enquiries query
    let currentOrderStatus: string = 'new';
    let currentOrderRow: Record<string, unknown> | null = null;

    await page.route('**/rest/v1/enquiries*', async (route) => {
      const enquiryObj = {
        id: 'e1111111-1111-1111-1111-111111111111',
        ref: 'BR-E2ETEST',
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
        status: currentOrderStatus === 'new' ? 'new' : 'converted',
        created_at: new Date().toISOString(),
        orders: currentOrderRow ? [currentOrderRow] : [],
      };

      const acceptHeader = route.request().headers()['accept'] || '';
      const isSingle = acceptHeader.includes('application/vnd.pgrst.object+json');

      await route.fulfill({
        status: 200,
        contentType: isSingle ? 'application/vnd.pgrst.object+json' : 'application/json',
        body: JSON.stringify(isSingle ? enquiryObj : [enquiryObj]),
      });
    });

    // Mock convert_enquiry_to_order RPC
    await page.route('**/rest/v1/rpc/convert_enquiry_to_order', async (route) => {
      const data = route.request().postDataJSON() as {
        p_name: string;
        p_phone: string;
        p_address: string;
        p_total_paise: number;
      };

      currentOrderStatus = 'confirmed';
      currentOrderRow = {
        id: 'ord-e2e-1234',
        enquiry_id: 'e1111111-1111-1111-1111-111111111111',
        customer_name: data.p_name,
        customer_phone: data.p_phone,
        shipping_address: data.p_address,
        courier: null,
        tracking_number: null,
        internal_notes: null,
        status: 'confirmed',
        total_paise: data.p_total_paise,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          order_id: 'ord-e2e-1234',
          enquiry_id: 'e1111111-1111-1111-1111-111111111111',
          status: 'confirmed',
          total_paise: data.p_total_paise,
        }),
      });
    });

    // Mock orders update
    await page.route('**/rest/v1/orders*', async (route) => {
      if (route.request().method() === 'PATCH') {
        const updates = route.request().postDataJSON() as Record<string, unknown>;
        if (currentOrderRow) {
          currentOrderRow = { ...currentOrderRow, ...updates };
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(currentOrderRow ? [currentOrderRow] : []),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            currentOrderRow
              ? [
                  {
                    ...currentOrderRow,
                    enquiries: {
                      ref: 'BR-E2ETEST',
                      items_json: [
                        {
                          name: 'Lilac Twist Hoops',
                          qty: 1,
                        },
                      ],
                    },
                  },
                ]
              : []
          ),
        });
      }
    });

    // 1. Visit product page and add to bag
    await page.goto('/product/lilac-twist-hoops');
    await page.getByRole('button', { name: /add to bag/i }).click();

    // 2. Open drawer and initiate order
    const drawer = page.getByRole('dialog', { name: /shopping bag/i });
    await expect(drawer).toBeVisible();

    await page.route('https://wa.me/**', async (route) => {
      await route.abort();
    });
    await drawer.getByRole('button', { name: /order on whatsapp/i }).click();
    await expect.poll(() => createdEnquiry).toBe(true);
    await page.waitForTimeout(500);

    // 3. Open Admin Enquiries Page
    await page.goto('/admin/enquiries');

    // 4. Verify enquiry BR-E2ETEST appears in the pipeline
    const enquiryRow = page.getByText('BR-E2ETEST');
    await expect(enquiryRow).toBeVisible();

    // 5. Click through to Enquiry Detail
    await enquiryRow.click();
    await expect(page.getByText('BR-E2ETEST')).toBeVisible();
    await expect(page.getByText('Gift wrap please')).toBeVisible();

    // 6. Tap "Convert to order"
    const convertBtn = page.getByRole('button', { name: 'Convert to order', exact: true });
    await expect(convertBtn).toBeVisible();
    await convertBtn.click();

    // Fill conversion dialog
    const modal = page.getByRole('dialog', { name: /convert enquiry to order/i });
    await expect(modal).toBeVisible();

    await modal.getByLabel(/customer name/i).fill('Meera Rao');
    await modal.getByLabel(/customer phone/i).fill('+91 98765 11111');
    await modal
      .getByLabel(/shipping address/i)
      .fill('B-204 Horizon Towers, Worli Sea Face, Mumbai 400018');

    await modal.getByRole('button', { name: /confirm & create order/i }).click();

    // 7. Verify Order Detail View loads with fulfillment stepper
    await expect(page.getByText('Fulfillment Pipeline')).toBeVisible();
    await expect(page.getByText('Meera Rao')).toBeVisible();

    // Step through: Confirmed -> Processing
    const processingStepBtn = page.getByRole('button', { name: /step 2 processing/i });
    await processingStepBtn.click();

    // Step through: Processing -> Packed
    const packedStepBtn = page.getByRole('button', { name: /step 3 packed/i });
    await packedStepBtn.click();

    // Step through: Packed -> Shipped (triggers courier modal)
    const shippedStepBtn = page.getByRole('button', { name: /step 4 shipped/i });
    await shippedStepBtn.click();

    const dispatchModal = page.getByRole('dialog', { name: /dispatch & courier details/i });
    await expect(dispatchModal).toBeVisible();
    await dispatchModal.getByLabel(/courier partner/i).fill('Delhivery Express');
    await dispatchModal.getByLabel(/tracking number/i).fill('DEL987654321');
    await dispatchModal.getByRole('button', { name: /confirm dispatch/i }).click();

    // Step through: Shipped -> Delivered
    const deliveredStepBtn = page.getByRole('button', { name: /step 5 delivered/i });
    await deliveredStepBtn.click();

    // 8. Return to pipeline and Export CSV
    await page.goto('/admin/enquiries');
    const exportBtn = page.getByRole('button', { name: /export csv/i });
    await exportBtn.click();

    const exportModal = page.getByRole('dialog', { name: /export orders to csv/i });
    await expect(exportModal).toBeVisible();

    // Wait for download event
    const downloadPromise = page.waitForEvent('download');
    await exportModal.getByRole('button', { name: /download csv/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
