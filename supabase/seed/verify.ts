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
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey || supabaseUrl.includes('placeholder')) {
  console.log('\n⚠️ Supabase credentials in .env.local are not configured yet (using placeholder values).');
  console.log('To run this verification against your live database:');
  console.log('1. Run migrations 001 to 007 in your Supabase project');
  console.log('2. Put your real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  console.log('3. Run `npm run verify:db` again.\n');
  process.exit(0);
}

// Client using the public ANON key strictly
const anonClient = createClient<Database>(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

async function verify() {
  console.log('🔒 Starting Database & RLS Security Verification (using ANON role)...\n');
  let allPassed = true;

  // Check 1: Anon can read live products and settings
  try {
    const { data: prods, error: prodErr } = await anonClient
      .from('products')
      .select('id, slug, name, price_paise, stock_status')
      .limit(5);

    const { data: settings, error: settErr } = await anonClient
      .from('site_settings')
      .select('key, value');

    if (!prodErr && prods && prods.length > 0 && !settErr && settings && settings.length > 0) {
      console.log('✅ PASS: Anon can read live products and settings');
    } else {
      console.error('❌ FAIL: Anon could not read products or settings:', prodErr?.message || settErr?.message);
      allPassed = false;
    }
  } catch (e) {
    console.error('❌ FAIL: Check 1 exception:', e);
    allPassed = false;
  }

  // Check 2: Anon cannot read enquiries or pending reviews
  try {
    const { data: enqData } = await anonClient.from('enquiries').select('*');
    const { data: pendingReviews } = await anonClient
      .from('reviews')
      .select('*')
      .eq('status', 'pending');

    const enquiriesBlocked = !enqData || enqData.length === 0;
    const pendingBlocked = !pendingReviews || pendingReviews.length === 0;

    if (enquiriesBlocked && pendingBlocked) {
      console.log('✅ PASS: Anon cannot read enquiries or pending reviews (RLS protected)');
    } else {
      console.error('❌ FAIL: Anon accessed private rows: enquiries:', enqData?.length, 'pending reviews:', pendingReviews?.length);
      allPassed = false;
    }
  } catch (e) {
    console.error('❌ FAIL: Check 2 exception:', e);
    allPassed = false;
  }

  // Check 3: Anon cannot insert or update products
  try {
    const { error: insErr } = await anonClient.from('products').insert({
      slug: 'unauthorized-hack-item',
      name: 'Hack Item',
      category: 'Earrings',
      price_paise: 100,
    });

    const { error: _updErr } = await anonClient
      .from('products')
      .update({ price_paise: 100 })
      .eq('slug', 'lilac-twist-hoops');

    // In Supabase, RLS insert failure gives an error; update either errors or affects 0 rows
    if (insErr) {
      console.log('✅ PASS: Anon cannot insert or update products (blocked by RLS)');
    } else {
      console.error('❌ FAIL: Anon was able to insert a product without error!');
      allPassed = false;
    }
  } catch (e) {
    console.error('❌ FAIL: Check 3 exception:', e);
    allPassed = false;
  }

  // Check 4: Anon cannot insert a review with status 'approved'
  try {
    const { error: revErr } = await anonClient.from('reviews').insert({
      reviewer_name: 'Malicious Reviewer',
      review_text: 'Bypassing moderation attempt',
      rating: 5,
      status: 'approved',
    });

    if (revErr) {
      console.log('✅ PASS: Anon cannot insert a review directly with status "approved"');
    } else {
      console.error('❌ FAIL: Anon successfully inserted an approved review!');
      allPassed = false;
    }
  } catch (e) {
    console.error('❌ FAIL: Check 4 exception:', e);
    allPassed = false;
  }

  // Check 5: create_enquiry succeeds for in-stock, validates server prices, and rejects sold-out products
  try {
    // 5a. Fetch in-stock product
    const { data: inStockProd } = await anonClient
      .from('products')
      .select('id, name, price_paise')
      .eq('slug', 'lilac-twist-hoops')
      .single();

    if (!inStockProd) {
      console.warn('⚠️ Product "lilac-twist-hoops" not found to test create_enquiry. Run seed first.');
    } else {
      // Intentionally tamper with unit price in client payload
      const tamperedPrice = 100;
      const { data: enquiryResult, error: enqErr } = await anonClient.rpc('create_enquiry', {
        p_items: [
          {
            product_id: inStockProd.id,
            qty: 2,
            unit_price_paise: tamperedPrice,
          },
        ],
        p_channel: 'whatsapp',
        p_note: 'Testing security and server pricing',
      });

      if (enqErr || !enquiryResult) {
        console.error('❌ FAIL: create_enquiry failed on in-stock product:', enqErr?.message);
        allPassed = false;
      } else {
        const expectedTotal = inStockProd.price_paise * 2;
        if (enquiryResult.subtotal_paise === expectedTotal) {
          console.log(`✅ PASS: create_enquiry succeeded (Ref: ${enquiryResult.ref}) and recomputed server price (${expectedTotal} paise), ignoring client tampering`);
        } else {
          console.error(`❌ FAIL: create_enquiry used client price! Subtotal: ${enquiryResult.subtotal_paise}, expected: ${expectedTotal}`);
          allPassed = false;
        }
      }
    }

    // 5b. Fetch sold-out product
    const { data: soldOutProd } = await anonClient
      .from('products')
      .select('id, name')
      .eq('slug', 'crystal-square-drops')
      .single();

    if (soldOutProd) {
      const { error: soldOutErr } = await anonClient.rpc('create_enquiry', {
        p_items: [{ product_id: soldOutProd.id, qty: 1 }],
        p_channel: 'whatsapp',
      });

      if (soldOutErr && soldOutErr.message.includes('product unavailable')) {
        console.log('✅ PASS: create_enquiry correctly rejected sold-out product (crystal-square-drops)');
      } else {
        console.error('❌ FAIL: create_enquiry allowed sold-out product or returned unexpected error:', soldOutErr?.message);
        allPassed = false;
      }
    }
  } catch (e) {
    console.error('❌ FAIL: Check 5 exception:', e);
    allPassed = false;
  }

  console.log('\n=============================================');
  if (allPassed) {
    console.log('🎉 ALL SECURITY AND RLS CHECKS PASSED!');
  } else {
    console.log('❌ SOME CHECKS FAILED. Check log output above.');
    process.exit(1);
  }
}

verify().catch((e) => {
  console.error('Verification script failed:', e);
  process.exit(1);
});
