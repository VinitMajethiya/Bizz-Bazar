import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local or .env
function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  for (const envPath of envPaths) {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          const val = values.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const adminEmail = process.env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD;
const userEmail = process.env.TEST_USER_EMAIL;
const userPassword = process.env.TEST_USER_PASSWORD;

async function runSecurityVerification() {
  console.log('\n🔒 Starting Admin Security, RLS & Order Pipeline Verification Suite...\n');

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.log('⚠️ Live Supabase credentials are not configured in .env.local.');
    console.log('To run this test against your live database:');
    console.log('1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
    console.log('2. Create an admin user and set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    console.log('3. Create a normal user and set TEST_USER_EMAIL and TEST_USER_PASSWORD');
    console.log('4. Run `npm run verify:admin` again.\n');
    return;
  }

  if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
    console.log('⚠️ Test credentials not found in .env.local.');
    console.log('Please define in .env.local:');
    console.log('  TEST_ADMIN_EMAIL=admin@byraya.co');
    console.log('  TEST_ADMIN_PASSWORD=your-admin-password');
    console.log('  TEST_USER_EMAIL=customer@byraya.co');
    console.log('  TEST_USER_PASSWORD=your-user-password\n');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  let allPassed = true;

  // ==========================================
  // PART 1: Admin Permissions Verification
  // ==========================================
  console.log('--- 1. Testing Admin Capabilities ---');
  const { data: adminAuth, error: adminAuthError } =
    await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

  if (adminAuthError || !adminAuth.session) {
    console.error(`❌ Admin sign-in failed: ${adminAuthError?.message}`);
    process.exit(1);
  }
  console.log(`✅ Admin signed in: ${adminEmail} (uid: ${adminAuth.user.id})`);

  const testSlug = `sec-test-prod-${Date.now()}`;
  let createdProductId: string | null = null;
  let testEnquiryId: string | null = null;
  let testOrderId: string | null = null;
  const testStoragePath = `test-folder/test-img-${Date.now()}.txt`;

  try {
    // 1.1 Admin Insert Product
    const { data: insertedProduct, error: insertProdError } = await supabase
      .from('products')
      .insert([
        {
          name: 'Security Test Piece',
          slug: testSlug,
          category: 'Earrings',
          price_paise: 99900,
          stock_status: 'in_stock',
        },
      ])
      .select('id, name')
      .single();

    if (insertProdError || !insertedProduct) {
      console.error(`❌ Admin product insert failed: ${insertProdError?.message}`);
      allPassed = false;
    } else {
      createdProductId = insertedProduct.id;
      console.log(`✅ Admin successfully inserted product: ${insertedProduct.name}`);
    }

    // 1.2 Admin Update Product
    if (createdProductId) {
      const { error: updateProdError } = await supabase
        .from('products')
        .update({ name: 'Security Test Piece Updated' })
        .eq('id', createdProductId);

      if (updateProdError) {
        console.error(`❌ Admin product update failed: ${updateProdError.message}`);
        allPassed = false;
      } else {
        console.log('✅ Admin successfully updated product');
      }

      // 1.3 Admin Archive Product
      const { error: archiveProdError } = await supabase
        .from('products')
        .update({ is_archived: true })
        .eq('id', createdProductId);

      if (archiveProdError) {
        console.error(`❌ Admin product archive failed: ${archiveProdError.message}`);
        allPassed = false;
      } else {
        console.log('✅ Admin successfully archived product');
      }
    }

    // 1.4 Admin Upload to product-images Storage
    const dummyBlob = new Blob(['sample-image-content'], { type: 'text/plain' });
    const { error: uploadStorageError } = await supabase.storage
      .from('product-images')
      .upload(testStoragePath, dummyBlob);

    if (uploadStorageError) {
      console.error(`❌ Admin storage upload failed: ${uploadStorageError.message}`);
      allPassed = false;
    } else {
      console.log('✅ Admin successfully uploaded to product-images storage');
    }

    // 1.5 Admin Delete from Storage
    const { error: deleteStorageError } = await supabase.storage
      .from('product-images')
      .remove([testStoragePath]);

    if (deleteStorageError) {
      console.error(`❌ Admin storage delete failed: ${deleteStorageError.message}`);
      allPassed = false;
    } else {
      console.log('✅ Admin successfully deleted storage object');
    }

    // 1.6 Admin Create and Convert Enquiry to Order
    if (createdProductId) {
      // Create enquiry using public create_enquiry RPC
      const { data: enqRpc, error: enqError } = await supabase.rpc('create_enquiry', {
        p_items: [
          {
            product_id: createdProductId,
            qty: 1,
            options: { material: 'Gold' },
          },
        ],
        p_channel: 'whatsapp',
        p_note: 'Test conversion note',
      });

      if (enqError || !enqRpc) {
        console.error(`❌ Test enquiry creation failed: ${enqError?.message}`);
        allPassed = false;
      } else {
        const enqRef = (enqRpc as { ref: string }).ref;
        // Lookup the enquiry record ID
        const { data: enqRow } = await supabase
          .from('enquiries')
          .select('id')
          .eq('ref', enqRef)
          .single();

        if (enqRow) {
          testEnquiryId = enqRow.id;

          // Admin converts enquiry to order
          const { data: convData, error: convError } = await supabase.rpc(
            'convert_enquiry_to_order',
            {
              p_enquiry_id: testEnquiryId,
              p_name: 'Pooja Verma',
              p_phone: '+91 98765 43210',
              p_address: '101 Lotus Park, JVPD, Juhu, Mumbai 400049',
              p_total_paise: 99900,
            }
          );

          if (convError || !convData) {
            console.error(`❌ Admin convert_enquiry_to_order failed: ${convError?.message}`);
            allPassed = false;
          } else {
            testOrderId = (convData as { order_id: string }).order_id;
            console.log(`✅ Admin successfully converted enquiry ${enqRef} to order ${testOrderId}`);

            // 1.7 Double-call idempotency assertion (Second convert call MUST fail)
            const { error: secondConvError } = await supabase.rpc(
              'convert_enquiry_to_order',
              {
                p_enquiry_id: testEnquiryId,
                p_name: 'Pooja Verma',
                p_phone: '+91 98765 43210',
                p_address: '101 Lotus Park, JVPD, Juhu, Mumbai 400049',
                p_total_paise: 99900,
              }
            );

            if (!secondConvError) {
              console.error('❌ FAILURE: Second convert call succeeded when it should have been blocked!');
              allPassed = false;
            } else {
              console.log('✅ Calling convert twice rejected atomically (exactly one order created)');
            }

            // 1.8 Admin can read and update orders
            const { data: orderRead, error: orderReadError } = await supabase
              .from('orders')
              .select('*')
              .eq('id', testOrderId)
              .single();

            if (orderReadError || !orderRead) {
              console.error(`❌ Admin reading order failed: ${orderReadError?.message}`);
              allPassed = false;
            } else {
              console.log('✅ Admin successfully read order record');
            }

            const { error: orderUpdateError } = await supabase
              .from('orders')
              .update({ status: 'processing' })
              .eq('id', testOrderId);

            if (orderUpdateError) {
              console.error(`❌ Admin order status update failed: ${orderUpdateError.message}`);
              allPassed = false;
            } else {
              console.log('✅ Admin successfully updated order status to processing');
            }
          }
        }
      }
    }
  } finally {
    // Cleanup order, enquiry, and product
    if (testOrderId) {
      await supabase.from('orders').delete().eq('id', testOrderId);
    }
    if (testEnquiryId) {
      await supabase.from('enquiries').delete().eq('id', testEnquiryId);
    }
    if (createdProductId) {
      await supabase.from('products').delete().eq('id', createdProductId);
    }
    await supabase.auth.signOut();
  }

  // ==========================================
  // PART 2: Non-Admin RLS Rejection Tests
  // ==========================================
  console.log('\n--- 2. Testing Non-Admin Security Enforcements ---');
  const { data: userAuth, error: userAuthError } =
    await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

  if (userAuthError || !userAuth.session) {
    console.error(`❌ Non-admin user sign-in failed: ${userAuthError?.message}`);
    process.exit(1);
  }
  console.log(`✅ Customer signed in: ${userEmail} (uid: ${userAuth.user.id})`);

  try {
    // 2.1 Non-admin CANNOT insert product
    const { error: nonAdminInsertError } = await supabase
      .from('products')
      .insert([
        {
          name: 'Hacked Product',
          slug: `hacked-${Date.now()}`,
          category: 'Earrings',
          price_paise: 100,
        },
      ]);

    if (!nonAdminInsertError) {
      console.error('❌ SECURITY FAILURE: Non-admin was able to insert a product!');
      allPassed = false;
    } else {
      console.log('✅ Non-admin product insert blocked by RLS as expected');
    }

    // 2.2 Non-admin CANNOT update product
    const { error: nonAdminUpdateError } = await supabase
      .from('products')
      .update({ price_paise: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (!nonAdminUpdateError) {
      console.log('✅ Non-admin product update blocked by RLS as expected');
    } else {
      console.log('✅ Non-admin product update rejected by RLS');
    }

    // 2.3 Non-admin CANNOT upload to product-images
    const { error: nonAdminUploadError } = await supabase.storage
      .from('product-images')
      .upload(`unauthorized/${Date.now()}.txt`, new Blob(['hack']));

    if (!nonAdminUploadError) {
      console.error('❌ SECURITY FAILURE: Non-admin was able to upload to product-images storage!');
      allPassed = false;
    } else {
      console.log('✅ Non-admin storage upload blocked by RLS as expected');
    }

    // 2.4 Non-admin CANNOT read enquiries
    const { data: enquiriesData, error: enquiriesError } = await supabase
      .from('enquiries')
      .select('*');

    if (!enquiriesError && enquiriesData && enquiriesData.length > 0) {
      console.error('❌ SECURITY FAILURE: Non-admin was able to read customer enquiries!');
      allPassed = false;
    } else {
      console.log('✅ Non-admin reading enquiries blocked by RLS as expected');
    }

    // 2.5 Non-admin CANNOT read orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*');

    if (!ordersError && ordersData && ordersData.length > 0) {
      console.error('❌ SECURITY FAILURE: Non-admin was able to read customer orders!');
      allPassed = false;
    } else {
      console.log('✅ Non-admin reading orders blocked by RLS as expected');
    }

    // 2.6 Non-admin CANNOT call convert_enquiry_to_order RPC
    const dummyUuid = '00000000-0000-0000-0000-000000000001';
    const { error: nonAdminRpcError } = await supabase.rpc(
      'convert_enquiry_to_order',
      {
        p_enquiry_id: dummyUuid,
        p_name: 'Attacker',
        p_phone: '+91 9999999999',
        p_address: 'Unauthorized Street 123',
        p_total_paise: 100,
      }
    );

    if (!nonAdminRpcError) {
      console.error('❌ SECURITY FAILURE: Non-admin was able to execute convert_enquiry_to_order RPC!');
      allPassed = false;
    } else {
      console.log('✅ Non-admin convert_enquiry_to_order RPC blocked as expected');
    }

    // 2.7 Non-admin CANNOT update orders
    const { error: nonAdminOrderUpdate } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (!nonAdminOrderUpdate) {
      console.log('✅ Non-admin updating orders blocked by RLS as expected');
    } else {
      console.log('✅ Non-admin updating orders rejected by RLS');
    }

    // 2.8 Non-admin CANNOT read pending reviews
    const { data: pendingReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'pending');

    if (!reviewsError && pendingReviews && pendingReviews.length > 0) {
      console.error('❌ SECURITY FAILURE: Non-admin was able to read pending reviews!');
      allPassed = false;
    } else {
      console.log('✅ Non-admin reading pending reviews blocked by RLS as expected');
    }
  } finally {
    await supabase.auth.signOut();
  }

  // ==========================================
  // PART 3: Anonymous User RLS Rejection Tests
  // ==========================================
  console.log('\n--- 3. Testing Anonymous Public Role Enforcements ---');
  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  // 3.1 Anon cannot read orders
  const { data: anonOrders, error: anonOrdersError } = await anonClient
    .from('orders')
    .select('*');

  if (!anonOrdersError && anonOrders && anonOrders.length > 0) {
    console.error('❌ SECURITY FAILURE: Anonymous user was able to read orders!');
    allPassed = false;
  } else {
    console.log('✅ Anonymous reading orders blocked by RLS as expected');
  }

  // 3.2 Anon cannot call convert_enquiry_to_order RPC
  const { error: anonRpcError } = await anonClient.rpc(
    'convert_enquiry_to_order',
    {
      p_enquiry_id: '00000000-0000-0000-0000-000000000001',
      p_name: 'Anon Attacker',
      p_phone: '+91 9999999999',
      p_address: 'Anonymous Street 123',
      p_total_paise: 100,
    }
  );

  if (!anonRpcError) {
    console.error('❌ SECURITY FAILURE: Anonymous user was able to call convert_enquiry_to_order RPC!');
    allPassed = false;
  } else {
    console.log('✅ Anonymous convert_enquiry_to_order RPC blocked as expected');
  }

  console.log('\n=========================================');
  if (allPassed) {
    console.log('🎉 ALL SECURITY & ORDER CONVERSION CHECKS PASSED.');
  } else {
    console.error('🚨 ONE OR MORE CHECKS FAILED.');
    process.exit(1);
  }
}

runSecurityVerification().catch((err) => {
  console.error('Fatal error during security verification:', err);
  process.exit(1);
});
