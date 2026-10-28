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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder')) {
  console.error('\n❌ Missing Supabase credentials in .env.local');
  console.error('Please configure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local to run the seed.\n');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const DEFAULT_SPECS = {
  Material: 'Anti-tarnish plated brass or stainless steel, nickel-free',
  Care: 'Keep dry, avoid perfume and lotion, store in the box',
  Packaging: 'Gift box and care card included',
  Shipping: 'Dispatch in 24 to 48 hours, 7-day exchange on manufacturing defects',
};

const PRODUCTS = [
  {
    slug: 'lilac-twist-hoops',
    name: 'Lilac Twist Hoops',
    category: 'Earrings',
    description: 'Chic twist hoops featuring delicate lilac accents.',
    price_paise: 49900,
    compare_at_price_paise: 69900,
    stock_status: 'in_stock' as const,
    stock_qty: 25,
    badge: 'New Drop',
    options: { materials: ['Gold', 'Rose Gold'], sizes: [] },
    is_featured: true,
  },
  {
    slug: 'ruby-claw-studs',
    name: 'Ruby Claw Studs',
    category: 'Earrings',
    description: 'Striking ruby claw setting for effortless everyday sparkle.',
    price_paise: 64900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 15,
    badge: 'Bestseller',
    options: { materials: ['Gold'], sizes: [] },
    is_featured: true,
  },
  {
    slug: 'seashell-cuff',
    name: 'Seashell Cuff',
    category: 'Bracelets',
    description: 'Sculptural open cuff with a coastal motif.',
    price_paise: 89900,
    compare_at_price_paise: 119900,
    stock_status: 'in_stock' as const,
    stock_qty: 10,
    badge: 'Limited Edition',
    options: { materials: ['Gold'], sizes: [] },
    is_featured: true,
  },
  {
    slug: 'golden-blossom-studs',
    name: 'Golden Blossom Studs',
    category: 'Earrings',
    description: 'Petal motifs cast in warm gold tones.',
    price_paise: 74900,
    compare_at_price_paise: null,
    stock_status: 'low_stock' as const,
    stock_qty: 3,
    badge: 'Low Stock',
    options: { materials: ['Gold'], sizes: [] },
    is_featured: true,
  },
  {
    slug: 'turquoise-daisy-necklace',
    name: 'Turquoise Daisy Necklace',
    category: 'Necklaces',
    description: 'Dainty daisy pendant with a vibrant turquoise center.',
    price_paise: 99900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 20,
    badge: 'Bestseller',
    options: { materials: ['Gold'], sizes: [] },
    is_featured: true,
  },
  {
    slug: 'stacked-chain-set',
    name: 'Stacked Chain Set',
    category: 'Gift Sets',
    description: 'Layered gold chains offering an instant curated look.',
    price_paise: 119900,
    compare_at_price_paise: 149900,
    stock_status: 'in_stock' as const,
    stock_qty: 8,
    badge: 'Sale',
    options: { materials: ['Gold'], sizes: [] },
    is_featured: true,
  },
  {
    slug: 'ocean-shell-pendant',
    name: 'Ocean Shell Pendant',
    category: 'Necklaces',
    description: 'Silvery sheen oceanic shell pendant on fine link chain.',
    price_paise: 84900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 12,
    badge: 'New Drop',
    options: { materials: ['Silver'], sizes: [] },
    is_featured: false,
  },
  {
    slug: 'opal-halo-drops',
    name: 'Opal Halo Drops',
    category: 'Earrings',
    description: 'Luminous faux opal drops crowned by micro halos.',
    price_paise: 79900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 18,
    badge: null,
    options: { materials: ['Gold'], sizes: [] },
    is_featured: false,
  },
  {
    slug: 'twisted-ball-cuff',
    name: 'Twisted Ball Cuff',
    category: 'Bracelets',
    description: 'Modern twisted wire cuff accented by smooth polished spheres.',
    price_paise: 44900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 30,
    badge: null,
    options: { materials: ['Gold', 'Silver'], sizes: [] },
    is_featured: false,
  },
  {
    slug: 'laurel-leaf-hoops',
    name: 'Laurel Leaf Hoops',
    category: 'Earrings',
    description: 'Textured leaf garland wrapping gracefully around a mid-size hoop.',
    price_paise: 59900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 14,
    badge: 'Bestseller',
    options: { materials: ['Gold'], sizes: [] },
    is_featured: false,
  },
  {
    slug: 'layered-cuff-stack',
    name: 'Layered Cuff Stack',
    category: 'Gift Sets',
    description: 'Pair of complementing textured and polished cuffs.',
    price_paise: 149900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 6,
    badge: null,
    options: { materials: ['Gold'], sizes: [] },
    is_featured: false,
  },
  {
    slug: 'amethyst-teardrop-drops',
    name: 'Amethyst Teardrop Drops',
    category: 'Earrings',
    description: 'Deep violet teardrop crystal swaying on gold posts.',
    price_paise: 69900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 11,
    badge: null,
    options: { materials: ['Gold'], sizes: [] },
    is_featured: false,
  },
  {
    slug: 'butterfly-cuff',
    name: 'Butterfly Cuff',
    category: 'Bracelets',
    description: 'Delicate butterfly motif perched on a slender adjustable band.',
    price_paise: 99900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 9,
    badge: 'New Drop',
    options: { materials: ['Gold', 'Silver'], sizes: [] },
    is_featured: true,
  },
  {
    slug: 'petal-wing-studs',
    name: 'Petal Wing Studs',
    category: 'Earrings',
    description: 'Whimsical winged petals with soft enamel finish.',
    price_paise: 64900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 16,
    badge: null,
    options: { materials: ['Pearl White', 'Sky Blue'], sizes: [] },
    is_featured: false,
  },
  {
    slug: 'crystal-square-drops',
    name: 'Crystal Square Drops',
    category: 'Earrings',
    description: 'Geometric faceted square drop stones.',
    price_paise: 54900,
    compare_at_price_paise: null,
    stock_status: 'sold_out' as const,
    stock_qty: 0,
    badge: 'Sold Out',
    options: { materials: ['Gold'], sizes: [] },
    is_featured: false,
  },
  {
    slug: 'bow-studs',
    name: 'Bow Studs',
    category: 'Earrings',
    description: 'Charming polished gold ribbon bow studs for minimal daily wear.',
    price_paise: 39900,
    compare_at_price_paise: null,
    stock_status: 'in_stock' as const,
    stock_qty: 22,
    badge: null,
    options: { materials: ['Gold'], sizes: [] },
    is_featured: false,
  },
];

const SITE_SETTINGS: Record<string, unknown> = {
  brand_name: 'By Raya.co',
  whatsapp_number: '919999999999',
  instagram_handle: 'by.raya.co',
  support_email: 'hello@byraya.co',
  tagline: 'Effortless elegance for every occasion',
  business_hours: 'Mon – Sat: 10:00 AM – 7:00 PM IST',
  ticker_text: 'Everyday luxury, without the luxury price. DM to order.',
  hero_headline: 'Effortless elegance for every occasion',
  hero_text: 'Everyday luxury, without the luxury price. Pick your piece and DM us to order.',
  hero_image_url: '',
  story_teaser: 'By Raya.co is jewellery for everyday wear: pieces that look expensive without the price tag.',
  guarantees: [
    { title: 'Anti-tarnish finish', text: 'Plated and sealed for daily wear.' },
    { title: 'Skin-friendly', text: 'Nickel-free and hypoallergenic.' },
    { title: 'Gift ready', text: 'Every order is packed in a gift box.' },
    { title: 'Order by DM', text: 'Message us and we’ll confirm everything in chat.' },
  ],
  footer_text: 'Effortless elegance for every occasion. Everyday luxury, without the luxury price.',
};

const PAGES = [
  {
    slug: 'our-story',
    title: 'Our Story',
    meta_description: 'By Raya.co is jewellery for everyday wear: pieces that look expensive without the price tag.',
    body_md: `By Raya.co is jewellery for everyday wear: pieces that look expensive without the price tag.

We believe that effortless elegance should not be reserved only for special occasions. Every piece in our collection is thoughtfully curated for timeless styling, skin-friendly daily wear, and lasting shine.

Pieces are made in small batches and dispatched directly to your doorstep in signature gift-ready packaging.`,
  },
  {
    slug: 'contact',
    title: 'Contact Us',
    meta_description: 'Get in touch with By Raya.co on WhatsApp or Instagram.',
    body_md: `Message us on WhatsApp or Instagram for the fastest reply.

- **WhatsApp**: +91 99999 99999
- **Instagram**: [@by.raya.co](https://instagram.com/by.raya.co)
- **Email**: hello@byraya.co
- **Business hours**: Monday to Saturday, 10:00 AM – 7:00 PM IST`,
  },
  {
    slug: 'how-to-order',
    title: 'How to Order',
    meta_description: 'How to place an enquiry and order from By Raya.co.',
    body_md: `- Browse our catalogue and pick your pieces.
- Tap Order on WhatsApp or Order on Instagram to send your enquiry reference and chosen pieces.
- We confirm availability, order specifics, and next steps directly with you in chat: [owner: add specific payment instructions, delivery zones, and response times here].`,
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    meta_description: 'How By Raya.co collects and protects your information.',
    body_md: `At By Raya.co, we respect your privacy.

**What we collect**: The name, phone number, and details you share with us during chat ordering or via our contact form, along with your email or phone if you opt into drop alerts.

**Why we collect it**: To process your enquiries, reply to your inquiries, and send occasional launch alerts you requested.

**Who sees it**: Only the shop owner and our secure hosting providers. We never sell or share your information with advertisers.

**Cookies and local storage**: We use browser local storage only to remember your shopping bag and theme preference.`,
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    meta_description: 'Terms and conditions for By Raya.co customers.',
    body_md: `- Orders placed on the storefront are enquiries confirmed in chat.
- Payment and delivery are arranged directly with the shop in chat.
- Prices and stock availability can change until confirmation.
- Product photos may differ slightly in colour due to studio lighting and screen settings.
- Customer reviews are moderated before publishing.`,
  },
];

async function seed() {
  console.log('🌱 Starting database seed for By Raya.co...\n');

  // 1. Ensure storage bucket exists
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === 'product-images');
    if (!exists) {
      await supabase.storage.createBucket('product-images', { public: true });
      console.log('✓ Created product-images storage bucket');
    } else {
      console.log('✓ product-images bucket already exists');
    }
  } catch (err) {
    console.warn('[WARN] Could not inspect storage buckets:', err);
  }

  // 2. Seed site settings
  console.log('\n⚙️ Seeding site settings...');
  for (const [key, value] of Object.entries(SITE_SETTINGS)) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value: value as Database['public']['Tables']['site_settings']['Insert']['value'] }, { onConflict: 'key' });
    if (error) console.error(`Error setting ${key}:`, error.message);
  }
  console.log('✓ Site settings seeded');

  // 3. Seed CMS Pages
  console.log('\n📄 Seeding CMS pages...');
  for (const page of PAGES) {
    const { error } = await supabase.from('pages').upsert(page, { onConflict: 'slug' });
    if (error) console.error(`Error setting page ${page.slug}:`, error.message);
  }
  console.log('✓ CMS pages seeded');

  // 6. Seed Products and Media
  console.log('\n💎 Seeding 16 starting products...');
  const imagesDir = path.resolve(process.cwd(), 'supabase/seed/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const { data: upsertedProduct, error: prodErr } = await supabase
      .from('products')
      .upsert(
        {
          ...p,
          specs_json: DEFAULT_SPECS,
          sort_order: i,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();

    if (prodErr || !upsertedProduct) {
      console.error(`Error seeding product ${p.slug}:`, prodErr?.message);
      continue;
    }

    // Check for matching images in supabase/seed/images/
    const possibleExts = ['.jpg', '.jpeg', '.png', '.webp'];
    let foundImageFile: string | null = null;

    for (const ext of possibleExts) {
      const candidate = path.join(imagesDir, `${p.slug}${ext}`);
      if (fs.existsSync(candidate)) {
        foundImageFile = candidate;
        break;
      }
    }

    if (!foundImageFile) {
      console.warn(`[WARN] Missing seed image for product: ${p.slug} (expected in supabase/seed/images/${p.slug}.*)`);
      continue;
    }

    // Upload image to Supabase Storage
    const fileBuffer = fs.readFileSync(foundImageFile);
    const fileExt = path.extname(foundImageFile);
    const storagePath = `${upsertedProduct.id}/hero${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: fileExt === '.png' ? 'image/png' : fileExt === '.webp' ? 'image/webp' : 'image/jpeg',
        upsert: true,
      });

    if (uploadErr) {
      console.warn(`[WARN] Failed to upload image for ${p.slug}:`, uploadErr.message);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    // Insert or update product_images record
    await supabase.from('product_images').upsert(
      {
        product_id: upsertedProduct.id,
        image_url: publicUrlData.publicUrl,
        storage_path: storagePath,
        alt: `${p.name} jewellery photo`,
        is_hero: true,
        display_order: 0,
      },
      { onConflict: 'product_id,is_hero' }
    );

    console.log(`✓ Image uploaded for ${p.slug}`);
  }

  // Seed placeholder testimonials with stable UUIDs (no duplicates on re-run)
  console.log('\nSeeding placeholder testimonials...');
  const PLACEHOLDER_TESTIMONIALS = [
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      product_id: null,
      rating: 5,
      reviewer_name: 'Riya, Pune',
      title: 'Daily elegance',
      review_text: '[placeholder, replace] Looks way more expensive than it is. The anti-tarnish finish really holds up to everyday wear.',
      status: 'approved' as const,
      is_offline: true,
      show_on_home: true,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      product_id: null,
      rating: 5,
      reviewer_name: 'Sneha, Mumbai',
      title: 'Super fast ordering',
      review_text: '[placeholder, replace] Ordering over DM took two minutes and response was immediate.',
      status: 'approved' as const,
      is_offline: true,
      show_on_home: true,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000003',
      product_id: null,
      rating: 5,
      reviewer_name: 'Anjali, Kolhapur',
      title: 'Signature packaging',
      review_text: '[placeholder, replace] The signature box and care card made it an effortless gift.',
      status: 'approved' as const,
      is_offline: true,
      show_on_home: true,
    },
  ];

  for (const t of PLACEHOLDER_TESTIMONIALS) {
    const { error: revErr } = await supabase.from('reviews').upsert(t, { onConflict: 'id' });
    if (revErr) {
      console.warn(`[WARN] Failed to seed testimonial ${t.id}:`, revErr.message);
    }
  }
  console.log('✓ Placeholder testimonials seeded');

  console.log('\n✨ Database seeding completed successfully!\n');
}

seed().catch((e) => {
  console.error('\nSeed script error:', e);
  process.exit(1);
});

