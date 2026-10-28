# SEO.md

## Reality check
A Vite single-page app sends mostly empty HTML to crawlers. Google can render it, but slowly, and social previews (WhatsApp, Instagram, X) do not run JavaScript. Because this shop is shared in chats, link previews matter. Choose one in Phase 8 and record it in `docs/DECISIONS.md`:
1. **Prerender** product and static pages at build time (for example with `vite-plugin-prerender` or a small build script that fetches live products and writes HTML shells with correct meta tags). Fast to add, needs a rebuild when products change (trigger a Vercel deploy hook from admin on save or on a schedule).
2. **Move to Next.js** (App Router) for server rendering. Better long term, more work now.
Default recommendation: option 1 for v1.

## Meta templates
| Page | Title | Description |
|------|-------|-------------|
| Home | `{brand} | Everyday jewellery without the luxury price` | tagline + "Order on WhatsApp or Instagram." |
| Shop | `Shop jewellery | {brand}` | "Earrings, bracelets, necklaces and gift sets. Order by DM." |
| Category | `{Category} | {brand}` | "Shop {category} from {brand}." |
| Product | `{name} | {category} | {brand}` | first 150 characters of description + price |
| CMS pages | `{page title} | {brand}` | `pages.meta_description` |

Every page gets: canonical URL, `og:title`, `og:description`, `og:image` (product hero or the logo), `og:type` (`product` or `website`), `twitter:card=summary_large_image`. Titles under 60 characters, descriptions under 160.

## JSON-LD
Product:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Seashell Cuff",
  "image": ["https://…/hero.webp"],
  "description": "…",
  "sku": "seashell-cuff",
  "brand": { "@type": "Brand", "name": "By Raya.co" },
  "offers": {
    "@type": "Offer", "priceCurrency": "INR", "price": "899.00",
    "availability": "https://schema.org/InStock",
    "url": "https://…/product/seashell-cuff"
  },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "12" }
}
```
Include `aggregateRating` only when there is at least one approved review. Map stock: in or low = `InStock`, sold out = `OutOfStock`. Price is paise divided by 100.

BreadcrumbList on product pages: Home, Shop, Category, Product.

Store on the home page: `@type: JewelryStore`, name, url, logo, `sameAs: ["https://instagram.com/by.raya.co"]`, contact point from settings. Do not invent a street address.

## Files
- `public/robots.txt`: allow all, disallow `/admin`, link to the sitemap.
- `scripts/sitemap.ts` generates `public/sitemap.xml` with home, shop, CMS pages and every non-archived product (`lastmod` from `updated_at`).
- Add `<meta name="robots" content="noindex">` on `/admin/*` and on the cart or any filtered URL with query strings other than `category`.

## Checks
Validate with Google's Rich Results Test and a social-preview debugger. Confirm that sharing a product link into WhatsApp shows the product image, name and price.
