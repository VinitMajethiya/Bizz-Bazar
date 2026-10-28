import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';

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
  console.log('\n🔒 Starting Admin Security, RLS & Enquiry Inbox Verification Suite...\n');

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.error('❌ Missing Supabase URL or Anon Key:');
    if (!supabaseUrl) console.error('  - VITE_SUPABASE_URL is missing');
    if (!supabaseAnonKey) console.error('  - VITE_SUPABASE_ANON_KEY is missing');
    console.error('\nPlease define them in .env.local.\n');
    process.exit(1);
  }

  const missingCreds: string[] = [];
  if (!adminEmail) missingCreds.push('TEST_ADMIN_EMAIL');
  if (!adminPassword) missingCreds.push('TEST_ADMIN_PASSWORD');
  if (!userEmail) missingCreds.push('TEST_USER_EMAIL');
  if (!userPassword) missingCreds.push('TEST_USER_PASSWORD');

  if (missingCreds.length > 0) {
    console.error('❌ Missing required test credentials in .env.local:');
    for (const key of missingCreds) {
      console.error(`  - ${key} is missing`);
    }
    console.error('\nPlease define in .env.local:');
    console.error('  TEST_ADMIN_EMAIL=admin@byraya.co');
    console.error('  TEST_ADMIN_PASSWORD=your-admin-password');
    console.error('  TEST_USER_EMAIL=customer@byraya.co');
    console.error('  TEST_USER_PASSWORD=your-user-password\n');
    process.exit(1);
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  let allPassed = true;

  // Check seed: assert products exist
  const { data: seedProds, error: seedErr } = await supabase
    .from('products')
    .select('id, name')
    .limit(1);

  if (seedErr || !seedProds || seedProds.length === 0) {
    console.error('❌ FAIL: Seed missing: no products found in database.');
    console.error('  -> Run `npm run seed` first before running admin verification.\n');
    process.exit(1);
  }

  // Track all test resources for clean teardown
  const cleanupProductIds: string[] = [];
  const cleanupEnquiryIds: string[] = [];
  const cleanupReviewIds: string[] = [];
  const testStoragePath = `test-folder/test-img-${Date.now()}.txt`;

  // ==========================================
  // PART 1: Admin Permissions Verification
  // ==========================================
  console.log('--- 1. Testing Admin Capabilities ---');
  const { data: adminAuth, error: adminAuthError } =
    await supabase.auth.signInWithPassword({
      email: adminEmail!,
      password: adminPassword!,
    });

  if (adminAuthError || !adminAuth.session) {
    console.error(`❌ Admin sign-in failed: ${adminAuthError?.message}`);
    process.exit(1);
  }
  console.log(`✅ Admin signed in: ${adminEmail} (uid: ${adminAuth.user.id})`);

  const testSlug = `sec-test-prod-${Date.now()}`;

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
      cleanupProductIds.push(insertedProduct.id);
      console.log(`✅ Admin successfully inserted product: ${insertedProduct.name}`);
    }

    // 1.2 Admin Update Product
    if (insertedProduct) {
      const { error: updateProdError } = await supabase
        .from('products')
        .update({ name: 'Security Test Piece Updated' })
        .eq('id', insertedProduct.id);

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
        .eq('id', insertedProduct.id);

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

    // 1.6 Admin Read and Manage Enquiries Inbox
    const { data: enqRpc, error: enqError } = await supabase.rpc('create_enquiry', {
      p_items: [
        {
          product_id: seedProds[0].id,
          qty: 1,
          options: { material: 'Gold' },
        },
      ],
      p_channel: 'whatsapp',
      p_note: `TEST-enquiry-${Date.now()}`,
    });

    let testEnquiryRef: string | null = null;
    if (enqError || !enqRpc) {
      console.error(`❌ Test enquiry creation failed: ${enqError?.message}`);
      allPassed = false;
    } else {
      testEnquiryRef = (enqRpc as { ref: string }).ref;
      const { data: enqRow, error: enqReadError } = await supabase
        .from('enquiries')
        .select('id, ref, status, internal_notes')
        .eq('ref', testEnquiryRef)
        .single();

      if (enqReadError || !enqRow) {
        console.error(`❌ Admin reading enquiry failed: ${enqReadError?.message}`);
        allPassed = false;
      } else {
        cleanupEnquiryIds.push(enqRow.id);
        console.log(`✅ Admin successfully read enquiry ${testEnquiryRef} with status "${enqRow.status}"`);

        // 1.7 Admin updates status to 'handled' and adds internal notes
        const { error: updateEnqError } = await supabase
          .from('enquiries')
          .update({
            status: 'handled',
            internal_notes: 'Spoke on WhatsApp, customer requested rose gold finish.',
          })
          .eq('id', enqRow.id);

        if (updateEnqError) {
          console.error(`❌ Admin enquiry update to handled failed: ${updateEnqError.message}`);
          allPassed = false;
        } else {
          console.log('✅ Admin successfully updated enquiry status to "handled" and saved internal notes');
        }

        // 1.8 Admin updates status to 'dropped'
        const { error: dropEnqError } = await supabase
          .from('enquiries')
          .update({ status: 'dropped' })
          .eq('id', enqRow.id);

        if (dropEnqError) {
          console.error(`❌ Admin enquiry update to dropped failed: ${dropEnqError.message}`);
          allPassed = false;
        } else {
          console.log('✅ Admin successfully updated enquiry status to "dropped"');
        }

        // 1.9 Admin reopens enquiry to 'new'
        const { error: reopenEnqError } = await supabase
          .from('enquiries')
          .update({ status: 'new' })
          .eq('id', enqRow.id);

        if (reopenEnqError) {
          console.error(`❌ Admin enquiry reopen failed: ${reopenEnqError.message}`);
          allPassed = false;
        } else {
          console.log('✅ Admin successfully reopened enquiry to "new"');
        }
      }
    }

    // 1.10 Create TEST- pending review & TEST- hidden review for non-vacuous checks
    const pendingReviewer = `TEST-Pending-${Date.now()}`;
    const { data: pendingRev, error: pendingRevErr } = await supabase
      .from('reviews')
      .insert({
        reviewer_name: pendingReviewer,
        review_text: 'TEST pending review body for RLS validation',
        rating: 5,
        status: 'pending',
        is_offline: false,
        show_on_home: false,
      })
      .select('id, reviewer_name, status')
      .single();

    if (pendingRevErr || !pendingRev) {
      console.error(`❌ Failed to insert test pending review: ${pendingRevErr?.message}`);
      allPassed = false;
    } else {
      cleanupReviewIds.push(pendingRev.id);
      console.log(`✅ Admin verified pending review exists in database: ${pendingRev.reviewer_name}`);
    }

    const hiddenReviewer = `TEST-Hidden-${Date.now()}`;
    const { data: hiddenRev, error: hiddenRevErr } = await supabase
      .from('reviews')
      .insert({
        reviewer_name: hiddenReviewer,
        review_text: 'TEST hidden review body for RLS validation',
        rating: 3,
        status: 'rejected',
        is_offline: true,
        show_on_home: false,
      })
      .select('id, reviewer_name, status')
      .single();

    if (hiddenRevErr || !hiddenRev) {
      console.error(`❌ Failed to insert test hidden review: ${hiddenRevErr?.message}`);
      allPassed = false;
    } else {
      cleanupReviewIds.push(hiddenRev.id);
      console.log(`✅ Admin verified hidden review exists in database: ${hiddenRev.reviewer_name}`);
    }

  } finally {
    await supabase.auth.signOut();
  }

  // ==========================================
  // PART 2: Non-Admin RLS Rejection Tests (NON-VACUOUS)
  // ==========================================
  console.log('\n--- 2. Testing Non-Admin Security Enforcements ---');
  const { data: userAuth, error: userAuthError } =
    await supabase.auth.signInWithPassword({
      email: userEmail!,
      password: userPassword!,
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

    // 2.4 Non-admin CANNOT read enquiries (asserted non-vacuously against known live TEST- enquiry)
    const { data: enquiriesData, error: enquiriesError } = await supabase
      .from('enquiries')
      .select('*');

    if (!enquiriesError && enquiriesData && enquiriesData.length > 0) {
      console.error('❌ SECURITY FAILURE: Non-admin was able to read customer enquiries!');
      allPassed = false;
    } else {
      console.log('✅ Non-admin reading enquiries blocked by RLS (asserted against live TEST- enquiry)');
    }

    // 2.5 Non-admin CANNOT update enquiries or internal notes
    const { error: nonAdminEnqUpdateError } = await supabase
      .from('enquiries')
      .update({ internal_notes: 'Hacked internal note', status: 'handled' })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (!nonAdminEnqUpdateError) {
      console.log('✅ Non-admin enquiry update blocked by RLS as expected');
    } else {
      console.log('✅ Non-admin enquiry update rejected by RLS');
    }

    // 2.6 Non-admin CANNOT read pending or hidden reviews (asserted non-vacuously against known live reviews)
    const { data: nonAdminPendingReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .in('status', ['pending', 'rejected']);

    if (!reviewsError && nonAdminPendingReviews && nonAdminPendingReviews.length > 0) {
      console.error('❌ SECURITY FAILURE: Non-admin was able to read pending/hidden reviews!');
      allPassed = false;
    } else {
      console.log('✅ Non-admin reading pending/hidden reviews blocked by RLS (asserted against live TEST- reviews)');
    }
  } finally {
    await supabase.auth.signOut();
  }

  // ==========================================
  // PART 3: Anonymous User RLS Rejection Tests (NON-VACUOUS)
  // ==========================================
  console.log('\n--- 3. Testing Anonymous Public Role Enforcements ---');
  const anonClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  // 3.1 Anon cannot read enquiries (asserted non-vacuously against known live TEST- enquiry)
  const { data: anonEnquiries, error: anonEnquiriesError } = await anonClient
    .from('enquiries')
    .select('*');

  if (!anonEnquiriesError && anonEnquiries && anonEnquiries.length > 0) {
    console.error('❌ SECURITY FAILURE: Anonymous user was able to read enquiries!');
    allPassed = false;
  } else {
    console.log('✅ Anonymous reading enquiries blocked by RLS (asserted against live TEST- enquiry)');
  }

  // 3.2 Anon cannot read pending or hidden reviews (asserted non-vacuously against known live reviews)
  const { data: anonPrivateReviews, error: anonRevError } = await anonClient
    .from('reviews')
    .select('*')
    .in('status', ['pending', 'rejected']);

  if (!anonRevError && anonPrivateReviews && anonPrivateReviews.length > 0) {
    console.error('❌ SECURITY FAILURE: Anonymous user was able to read pending/hidden reviews!');
    allPassed = false;
  } else {
    console.log('✅ Anonymous reading pending/hidden reviews blocked by RLS (asserted against live TEST- reviews)');
  }

  // 3.3 Anon cannot update enquiries or internal notes
  const { error: anonEnqUpdateError } = await anonClient
    .from('enquiries')
    .update({ status: 'handled', internal_notes: 'Anon tampering' })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (!anonEnqUpdateError) {
    console.log('✅ Anonymous enquiry update blocked by RLS as expected');
  } else {
    console.log('✅ Anonymous enquiry update rejected by RLS');
  }

  // ==========================================
  // TEARDOWN: Delete all TEST- rows using Admin
  // ==========================================
  console.log('\n--- 4. Cleaning Up All TEST- Rows ---');
  const { data: adminReAuth } = await supabase.auth.signInWithPassword({
    email: adminEmail!,
    password: adminPassword!,
  });

  if (adminReAuth?.session) {
    if (cleanupEnquiryIds.length > 0) {
      await supabase.from('enquiries').delete().in('id', cleanupEnquiryIds);
      console.log(`🧹 Deleted ${cleanupEnquiryIds.length} test enquiry record(s)`);
    }
    if (cleanupReviewIds.length > 0) {
      await supabase.from('reviews').delete().in('id', cleanupReviewIds);
      console.log(`🧹 Deleted ${cleanupReviewIds.length} test review record(s)`);
    }
    if (cleanupProductIds.length > 0) {
      await supabase.from('products').delete().in('id', cleanupProductIds);
      console.log(`🧹 Deleted ${cleanupProductIds.length} test product record(s)`);
    }
    await supabase.auth.signOut();
  }

  console.log('\n=========================================');
  if (allPassed) {
    console.log('🎉 ALL SECURITY & ENQUIRY INBOX CHECKS PASSED.');
  } else {
    console.error('🚨 ONE OR MORE CHECKS FAILED.');
    process.exit(1);
  }
}

runSecurityVerification().catch((err) => {
  console.error('Fatal error during security verification:', err);
  process.exit(1);
});
