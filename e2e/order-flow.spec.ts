import { test, expect } from '@playwright/test';

test.describe('Order Flow End-to-End', () => {
  test('adds to bag, changes quantity, adds gift note, and initiates WhatsApp order', async ({
    page,
  }) => {
    // Mock Supabase products query
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
            options: { materials: ['Gold', 'Rose Gold'], sizes: [] },
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

    // Mock create_enquiry RPC
    let createdEnquiryPayload: {
      p_items: Array<{ product_id: string; qty: number }>;
      p_channel: string;
      p_note: string;
    } | null = null;
    await page.route('**/rest/v1/rpc/create_enquiry', async (route) => {
      createdEnquiryPayload = route.request().postDataJSON() as typeof createdEnquiryPayload;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ref: 'BR-9X4K2A',
          items: [
            {
              product_id: 'c1111111-1111-1111-1111-111111111111',
              name: 'Lilac Twist Hoops',
              options: { material: 'Gold' },
              unit_price_paise: 49900,
              qty: 2,
            },
          ],
          subtotal_paise: 99800,
          discount_paise: 0,
        }),
      });
    });

    // 1. Visit product page directly
    await page.goto('/product/lilac-twist-hoops');

    // 2. Add to bag
    const addToBagButton = page.getByRole('button', { name: /add to bag/i });
    await expect(addToBagButton).toBeVisible();
    await addToBagButton.click();

    // 3. Drawer opens automatically
    const drawer = page.getByRole('dialog', { name: /shopping bag/i });
    await expect(drawer).toBeVisible();

    // 4. Change quantity in drawer (stepper from 1 to 2)
    const increaseBtn = drawer.getByRole('button', { name: /increase quantity/i });
    await increaseBtn.click();
    await expect(drawer.getByText('₹998')).toBeVisible();

    // 5. Add gift note
    const giftNoteInput = drawer.getByLabelText(/gift note or custom instructions/i);
    await giftNoteInput.fill('Happy birthday Riya');

    // 6. Monitor WhatsApp navigation
    let whatsappUrl = '';
    await page.route('https://wa.me/**', async (route) => {
      whatsappUrl = route.request().url();
      await route.abort(); // Prevent actual external redirect in headless test
    });

    // Tap "Order on WhatsApp"
    const orderWhatsAppBtn = drawer.getByRole('button', { name: /order on whatsapp/i });
    await orderWhatsAppBtn.click();

    // 7. Verify enquiry RPC payload
    await expect.poll(() => createdEnquiryPayload).not.toBeNull();
    expect(createdEnquiryPayload.p_channel).toBe('whatsapp');
    expect(createdEnquiryPayload.p_note).toBe('Happy birthday Riya');
    expect(createdEnquiryPayload.p_items[0].qty).toBe(2);

    // 8. Assert page tried to navigate to wa.me containing the reference
    await expect
      .poll(() => whatsappUrl)
      .toContain('BR-9X4K2A');
    expect(whatsappUrl).toContain('wa.me');
  });
});
