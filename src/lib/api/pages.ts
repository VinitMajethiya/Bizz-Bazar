import { supabase, isSupabaseConfigured } from '../supabase';
import { useQuery } from '@tanstack/react-query';

export interface CMSPage {
  slug: string;
  title: string;
  bodyMd: string;
  metaDescription: string | null;
  updatedAt: string;
}

const DEFAULT_PAGES: Record<string, CMSPage> = {
  'our-story': {
    slug: 'our-story',
    title: 'Our Story',
    metaDescription: 'By Raya.co is jewellery for everyday wear: pieces that look expensive without the price tag.',
    bodyMd: `By Raya.co is jewellery for everyday wear: pieces that look expensive without the price tag.

We believe that effortless elegance should not be reserved only for special occasions. Every piece in our collection is thoughtfully curated for timeless styling, skin-friendly daily wear, and lasting shine.

Pieces are made in small batches and dispatched directly to your doorstep in signature gift-ready packaging.`,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  'how-to-order': {
    slug: 'how-to-order',
    title: 'How to Order',
    metaDescription: 'How to place an order via WhatsApp or Instagram DM with By Raya.co.',
    bodyMd: `- Browse the catalogue and pick your pieces.
- Tap **Order on WhatsApp** or **Order on Instagram** to send your enquiry reference and chosen pieces.
- We confirm availability, order specifics, and next steps directly with you in chat.`,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    metaDescription: 'Privacy policy for By Raya.co customer data and catalogue browsing.',
    bodyMd: `### Information We Collect
When you browse our catalogue or submit an enquiry, we record your chosen pieces and options to build your order reference. Contact details (such as your phone number or shipping address) are shared directly with us in chat.

### Local Storage
We use browser local storage solely to preserve your shopping bag and theme preference between sessions.

### Data Sharing
We never sell, rent, or trade your personal information with third parties. For questions or deletion requests, reach out at hello@byraya.co.`,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    metaDescription: 'Terms of service and chat enquiry order rules for By Raya.co.',
    bodyMd: `- Orders placed on the storefront are enquiries confirmed directly in chat.
- Payment and delivery specifics are agreed directly with the shop in chat.
- Prices and stock availability can change until confirmation.
- Product photos may differ slightly in colour due to studio lighting and screen settings.
- Customer reviews are moderated before publishing.`,
    updatedAt: '2026-01-01T00:00:00Z',
  },
};

/**
 * Fetch a CMS page by slug from the pages table.
 */
export async function fetchCMSPage(slug: string): Promise<CMSPage> {
  const fallback = DEFAULT_PAGES[slug] || {
    slug,
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    bodyMd: '',
    metaDescription: null,
    updatedAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    return fallback;
  }

  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return fallback;
    }

    return {
      slug: data.slug,
      title: data.title,
      bodyMd: data.body_md,
      metaDescription: data.meta_description,
      updatedAt: data.updated_at,
    };
  } catch {
    return fallback;
  }
}

export function useCMSPage(slug: string) {
  return useQuery({
    queryKey: ['cms-page', slug],
    queryFn: () => fetchCMSPage(slug),
    staleTime: 1000 * 60 * 5,
  });
}

