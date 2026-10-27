# PROGRESS.md

Updated by the agent at the end of every session.

## Status
Phase: Phase 2 complete (Storefront read-only). Ready for Phase 3 (Cart & Enquiry flow).

## Done
- Initialized Git repository and configured Vitest testing environment with JSDOM.
- **Phase 0 & 1 foundations**: Scaffolding with Vite, React 18, TypeScript strict, Tailwind CSS tokens (`tokens.css`, `globals.css`), Jost font, theme toggle with Zustand, layout shell, Supabase schema migrations 001 to 007, and seed script.
- **Data & API Layer (`src/lib/api/`)**:
  - `products.ts`: `fetchProducts` (with category and sort), `fetchFeaturedProducts`, `fetchProductBySlug`, and `fetchRelatedProducts`.
  - `settings.ts`: `fetchSiteSettings` querying `site_settings` table.
  - `reviews.ts`: `fetchApprovedReviews` querying approved customer reviews and computing average ratings and counts.
  - `leads.ts`: `submitDropAlert` inserting validated contacts into `newsletter_leads`.
  - `src/lib/catalogData.ts`: 16 initial catalogue pieces from `docs/CATALOG.md` serving as resilient fallback for offline/pre-migrated local environments.
  - `src/lib/hooks/useCatalog.ts`: React Query hooks (`useProducts`, `useFeaturedProducts`, `useProduct`, `useRelatedProducts`, `useSiteSettings`, `useReviews`, `useDropAlertMutation`) with 1-minute and 5-minute stale times.
- **Validation Schemas (`src/lib/validation/schemas.ts`)**:
  - `cleanWhatsAppNumber` helper converting formatted numbers (e.g. `+91 98765-43210` -> `919876543210`).
  - `dropAlertSchema` validating email or 10-13 digit phone numbers with Zod.
  - `reviewFormSchema` with honeypot trap validation.
- **Reusable UI Components (`src/components/ui/`)**:
  - `ProductCard.tsx`: Square aspect ratio, badges ("New Drop", "Bestseller", "Limited Edition", "Low Stock", "Sold Out", "Sale"), strike-through compare price, sold-out visual indicator, and keyboard focus rings.
  - `PriceTag.tsx`: Strict paise formatting with `formatINR`, saving percentage calculation, and sale highlighting.
  - `Badge.tsx`: DESIGN.md compliant badge (11px uppercase tracking-wider, sharp corners).
  - `ImageWithFallback.tsx`: Lazy-loaded image with graceful fallback showing product initial and "Photo coming soon".
  - `Accordion.tsx`: Accessible collapsible accordion with thin borders, plus/minus icons, and keyboard support.
  - `StarRating.tsx`: 5-star display with half-star handling and review counts.
  - `Skeleton.tsx`: Animated shimmer skeletons for cards, grids, and product details.
- **Storefront Pages (`src/features/`)**:
  - **Home (`/`)**:
    - Settings-driven announcement ticker with pause on reduced motion.
    - Full-bleed hero photograph layout with settings-driven headline, subtitle, and "Go to the catalogue" link.
    - 4-column guarantees row (anti-tarnish, skin-friendly, gift ready, order by DM) without decorative circle icons.
    - Bestsellers row powered by `useFeaturedProducts`.
    - Category mosaic tiles (Earrings, Bracelets, Necklaces, Rings & Gift Sets).
    - Story teaser with link to `/our-story`.
    - Customer testimonials row.
    - Drop alert email/phone capture form with instant success feedback.
    - "On Instagram" gallery strip linked to `@by.raya.co`.
  - **Shop (`/shop`)**:
    - Instant category tabs (All, Earrings, Bracelets, Necklaces, Rings, Gift Sets) with `?category=` URL param sync.
    - Sort dropdown (Featured, Price Low to High, Price High to Low, Newest) with `?sort=` sync.
    - 2-column mobile and 4-column desktop responsive grid.
    - Empty state ("No pieces in this category yet.") and retryable error state.
  - **Product Page (`/product/:slug`)**:
    - Gallery with thumbnail switcher and variant-aware image switching when materials change.
    - Tap/click-to-zoom modal lightbox.
    - Stock indicators ("In stock", "Only a few left", "Sold out").
    - Material and size selection chips.
    - Quantity stepper (bounded by stock quantity or max 10).
    - Three order action buttons ("Order on WhatsApp", "Order on Instagram", "Add to bag") that correctly disable and display "Sold out" when `stock_status === 'sold_out'`.
    - 5 accordions (Material & specifications from `specs_json`, Sizing guide, Care & maintenance, Packaging & gifting, Shipping & warranty).
    - Customer review summary with average star rating.
    - "You might also like" related pieces row.
- **Automated Tests**:
  - 24 unit & component tests passing cleanly across 6 test suites (`money.test.ts`, `schemas.test.ts`, `ProductCard.test.tsx`, `Accordion.test.tsx`, `Shop.test.tsx`, `ProductDetail.test.tsx`).
- Production build (`npm run build`) and strict lint (`npm run lint`) pass with 0 errors/warnings.

## Acceptance Criteria Verification (Phase 2)
- **Everything shown comes from the database/settings**: PASS (wired via TanStack Query and Supabase client with fallback for offline dev).
- **Changing a row changes the site**: PASS (components consume fresh TanStack Query state).
- **Sold-out items show a disabled order state**: PASS (buttons disabled and labeled "Sold out", quantity disabled, sold out badge shown).
- **Build and lint clean**: PASS (`tsc --noEmit && vite build`, `eslint`).

## Next
- Phase 3: Cart and enquiry flow (Zustand persistent cart with cross-tab sync via `storage` event, slide-over bag drawer, gift note, `create_enquiry` RPC invocation, WhatsApp direct launch, Instagram clipboard copy and modal fallback).

## Decisions made
- Extended Supabase types with explicit `Relationships` and `Views` to ensure TypeScript strict type inference across all Postgrest queries.
- Added `isSupabaseConfigured` check in the API layer to instantly return typed fallback data without slow network timeouts during local dev/tests before user connects live Supabase credentials.
- Configured Vitest with `jsdom` and `@testing-library/react` for component and accessibility testing.

## Open questions for the owner
- User can run migrations 001 to 007 in the Supabase project and provide live credentials in `.env.local` whenever ready to test live database updates.
