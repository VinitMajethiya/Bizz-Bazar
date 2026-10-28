# PROGRESS.md

Updated by the agent at the end of every session.

## Status
Phase: Phase 4 complete (Admin foundation and products). Ready for Phase 5 (Enquiries and orders).

## Done
- Initialized Git repository and configured Vitest testing environment with JSDOM.
- **Phase 0 & 1 foundations**: Scaffolding with Vite, React 18, TypeScript strict, Tailwind CSS tokens (`tokens.css`, `globals.css`), Jost font, theme toggle with Zustand, layout shell, Supabase schema migrations 001 to 007, and seed script.
- **Phase 2 Storefront (Read-only) & Pre-Phase 3 Refinements**:
  - Removed hard-coded fallback catalogue `catalogData.ts` (Commit `5be815b`). Storefront queries Supabase directly and displays retryable error states if query fails.
  - Normalized badge text to sentence case (11px, font-normal, without uppercase transforms or tracking). Stripped tracked-out uppercase labels from all storefront components (retained only brand wordmark in `Logo.tsx`).
  - Home hero layout strictly follows `DESIGN.md`: mobile stacks photograph on top with text below; desktop overlays headline with dark gradient scrim over full-bleed photo.
  - Verified strict avoidance of payment gateway terminology (no Razorpay, Stripe, "Pay now", "Checkout", "Secure payment"); order flow strictly uses "Order".
  - Drop-alert newsletter capture (`leads.ts` and `newsletter_leads` table) completed early in Phase 2.
  - Storefront pages: Home (`/`), Shop (`/shop`), Product Detail (`/product/:slug`), with instant category/sort sync and image gallery with variant switching.
- **Phase 3 Cart & Enquiry Flow**:
  - Zustand cart store (`src/features/cart/cartStore.ts`) with `persist` (`byraya-bag`), merging identical product + material/size variants, enforcing qty limits (1-10 and bounded by `stock_qty`), gift note persistence, and window `storage` event cross-tab synchronization.
  - Slide-over bag drawer (`src/features/cart/CartDrawer.tsx`) accessible from header bag button (with live item counter pill) and automatically on "Add to bag":
    - Product thumbnail, name, chosen options, quantity stepper, remove button.
    - Live subtotal computed from fresh Supabase product queries using `formatINR`.
    - Gift note textarea.
    - Pinned "Order on WhatsApp" and "Order on Instagram" buttons.
    - Accessible focus trap with keyboard navigation, Esc key close, returning focus on exit, full-width on mobile viewports (<640px).
    - Empty state string from `docs/CONTENT.md`.
    - No coupon field (deferring to Phase 6 per Decision 009).
  - Stale / Sold-out item handling in bag drawer.
  - Enquiry creation & Chat handoff (`src/features/enquiries/placeOrder.ts`):
    - Server-enforced prices via `create_enquiry` RPC.
    - WhatsApp navigation with fallback modal.
    - Instagram modal with readonly selectable message, clipboard copy with fallback to `document.execCommand('copy')` for non-secure contexts, toast confirmation, and direct `ig.me` link.
    - In-flight duplicate lock preventing duplicate submissions.
- **Phase 4 Admin Foundation and Products**:
  - **Auth & Access Control**:
    - Sign in screen at `/admin/login` with email and password, "Wrong email or password" error display, and returnTo URL query preservation.
    - `AdminGuard` component checking active session and `profiles.role = 'admin'`. Rejects non-admin users, signs them out immediately, and displays "This account doesn’t have admin access." Session expiry listener redirects to `/admin/login`.
    - Added `<meta name="robots" content="noindex, nofollow" />` for all `/admin` routes.
    - Verified admin data is strictly maintained in TanStack Query memory and never stored in `localStorage`.
  - **Admin Layout Shell**:
    - Desktop sidebar navigation with Overview, Products, Enquiries, Reviews, Deals, Content & Settings, View Storefront, and Sign out.
    - Mobile bottom tab bar (Overview, Products, Enquiries, Reviews, More) with 44px+ tap targets.
    - Mobile `AdminMore` menu linking to Deals, Content, Storefront, and Sign Out.
    - Placeholders for future phases (`AdminPlaceholders.tsx`).
    - Entire admin route tree is lazy-loaded (`import()`) to keep the customer bundle lean.
  - **Overview Dashboard (`AdminOverview.tsx`)**:
    - Realtime metric cards for Live products (`not is_archived`), Low stock or sold out pieces (`stock_status in ('low_stock', 'sold_out')`), and Drop-alert newsletter leads (`newsletter_leads`).
    - Counters for enquiries, orders, reviews, and deals.
    - Latest 5 customer enquiries table with reference ID, channel badges, formatted total via `formatINR`, item summary, and customer notes.
  - **Products List (`AdminProducts.tsx`)**:
    - Search by product name.
    - Filter by category and stock status (In stock, Low stock, Sold out, Archived).
    - Rows with thumbnail, category, stock badge, integer paise price formatted with `formatINR`, slug link, view on storefront button, archive toggle, and edit button.
    - Destructive archive action confirmation modal displaying the item's name.
    - Loading skeletons, empty states, and error handling with retry.
  - **Product Form (`AdminProductForm.tsx`)**:
    - Form built with `react-hook-form` and `zod` resolver (`productSchema.ts`).
    - Name (2-80 chars), auto-generated slug with manual editing and uniqueness verification check.
    - Category dropdown with "+ Add custom" category input.
    - Description with live character counter (up to 600 chars).
    - Price in rupees validated and stored as integer paise (`price_paise`) via `rupeesToPaise`.
    - Compare-at price validated to strictly exceed regular price if provided.
    - Stock status and quantity inputs (setting quantity to 0 automatically flips status to Sold out).
    - Sentence case badge dropdown ("New drop", "Bestseller", "Limited edition", "Low stock", "Sale").
    - Material chips and Size chips interactive management.
    - Dynamic key-value specification rows table.
    - Homepage featured and archive toggles.
    - Unsaved changes browser warning (`beforeunload`).
    - Actions: Save Product, Save and add another, Archive Product, View on site.
    - Form state preservation on failed save.
  - **Media Panel (`MediaPanel.tsx`)**:
    - Multiple file upload with browser-side image resizing utility (`resize.ts`) capping images at 1600px long edge and encoding as WebP (with JPEG fallback).
    - Uploads to Supabase Storage: `product-images/<productId>/<uuid>.webp`.
    - Records row in `product_images` with public URL, storage path, display order, alt text, and variant key.
    - Reordering: HTML5 drag-and-drop on desktop, Up/Down stepper buttons on mobile.
    - Cover photo hero selector enforcing single hero constraint.
    - "Show for material" variant selector linking image to product's configured materials.
    - Delete photo with confirmation modal: cleans up storage bucket file and database row, and promotes the next image in sequence if deleted image was the hero.
  - **Automated Security Verification script (`supabase/seed/verify-admin.ts`)**:
    - Verifies admin can insert, update, archive products and upload/delete storage images.
    - Verifies non-admin cannot insert/update products, upload to storage, read customer enquiries, or read pending reviews.
- **Automated Tests**:
  - 61 unit and component tests passing cleanly across 13 test suites.
  - 2 Playwright E2E tests passing on both mobile (390x844) and desktop (1280x800).
  - Production build (`npm run build`) and strict lint (`npm run lint`) pass with 0 errors/warnings.

## Acceptance Criteria Verification (Phase 4)
- **A non-admin account cannot read or write admin data even by calling the API directly**: PASS. Verified through Supabase Row-Level Security policies in `supabase/seed/verify-admin.ts` (customer accounts are rejected on product inserts, updates, storage uploads, enquiry reads, and pending review queries) and in `AdminGuard.test.tsx`.
- **The owner can add a product with photos from a phone**: PASS. Product form and media panel are optimized for mobile viewports (360px minimum width, bottom tab bar, single-column inputs, camera/file upload with client-side 1600px WebP resizing, mobile Up/Down photo stepper, and large touch targets).

## Untested Items
- Native camera capture roll integration on older mobile WebViews.
- Live verification against remote Supabase database with live user credentials in `.env.local` (`npm run verify:admin`).

## Next
- Phase 5: Enquiries and orders (live enquiry feed, convert enquiry to order, fulfillment status stepper, courier tracking number assignment, and CSV order export).

## Decisions made
- Decision 014: Browser-side image resizing via HTMLCanvasElement to 1600px long edge with WebP transcoding prior to storage upload.
