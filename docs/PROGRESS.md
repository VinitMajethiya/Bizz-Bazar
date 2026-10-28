# PROGRESS.md

Updated by the agent at the end of every session.

## Status
Phase: Phase 5 complete (Enquiry inbox & digital catalogue scope). Ready for Phase 6 (Reviews and deals).

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
    - Counters for enquiries, reviews, and deals.
    - Latest 5 customer enquiries table with reference ID, channel badges, formatted total via `formatINR`, item summary, and customer notes.
  - **Products List (`AdminProducts.tsx`)**:
    - Search by product name.
    - Filter by category and stock status (In stock, Low stock, Sold out, Archived).
    - Rows with thumbnail, category, stock badge, integer paise price formatted with `formatINR`, slug link, view on storefront button, archive toggle, and edit button.
    - Destructive archive action confirmation modal displaying the item's name.
    - Loading skeletons, empty states, and error handling with retry.
  - **Product Form (`AdminProductForm.tsx`)**:
    - Form built with `react-hook-form` and `zod` resolver (`productSchema.ts`).
    - Name (2-80 chars), auto-generated slug with manual editing, uniqueness verification check, and slug modification warning dialog.
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
- **Phase 5 Enquiry Inbox (Digital Catalogue Scope Alignment)**:
  - **Database Migration (`009_drop_orders_inbox.sql`)**:
    - Dropped `convert_enquiry_to_order` RPC, dropped `orders` table (cascade), and dropped `order_status` enum.
    - Renamed `enquiry_status` value `'converted'` to `'handled'`.
    - Added `internal_notes text` column to `enquiries` table for admin notes.
    - Updated `supabase/schema.sql` consolidating complete schema for one-click setup.
  - **Scope Cleanup (Removed Code)**:
    - Deleted `ConvertOrderModal.tsx`, `adminOrders.ts`, `useAdminOrders.ts`, `csvExport.ts`, `csvExport.test.ts`, `statusStepper.ts`, and `statusStepper.test.ts`.
    - Removed 5th product accordion ("Shipping, exchange and warranty"), leaving exactly four accordions.
    - Replaced `/shipping-returns` route with `/how-to-order` ("How to order"), updating navigation, footer, and CMS page selection.
    - Removed unused npm dependencies (`clsx`, `tailwind-merge`) and unused placeholder components.
  - **Admin Enquiry Inbox (`AdminEnquiries.tsx`, `useAdminEnquiries.ts`, `adminEnquiries.ts`)**:
    - Inbox view with status filter chips: `New`, `Handled`, `Dropped`, `All`.
    - Channel filtering: `All Channels`, `WhatsApp`, `Instagram`.
    - Search input matching reference (e.g. BR-7K3F) or item names.
    - Live indicator with Supabase Realtime channel subscription listening to `enquiries` changes; refetch on window focus fallback.
    - Row display: Enquiry reference, channel icon, items summary with options and quantity, subtotal in integer paise rendered via `formatINR`, relative age ("12 min ago" via `formatAge`), and status badge.
  - **Enquiry Detail (`AdminEnquiryDetail.tsx`)**:
    - Items table showing server prices, options, quantities, subtotal, and customer gift note.
    - Internal notes textarea with blur autosave and feedback toast notification.
    - Action buttons: "Mark handled", "Reopen", "Mark as dropped" (with confirmation modal), and "Copy reply message" formatted from `docs/CONTENT.md` with clipboard fallback.
  - **Admin Overview Counters (`AdminOverview.tsx`, `adminOverview.ts`)**:
    - Counters for `New enquiries`, `Total enquiries`, `Live products`, `Low stock or sold out`, `Pending reviews`, `Live deals`, and `Drop-alert sign-ups`.
  - **Deals Reduction**:
    - Reduced deals model to percentage and flat coupon codes only; removed fixed-price and bundle discounts from UI, types, and logic.
  - **Automated Tests**:
    - 69 unit and component tests passing across 15 test suites in Vitest.
    - 4 Playwright E2E tests passing on both mobile (390x844) and desktop (1280x800) covering storefront ordering and admin enquiry inbox triage.
    - Updated `supabase/seed/verify-admin.ts` and `verify.ts` verifying RLS on enquiries, status updates (`handled`, `dropped`), and internal notes.
    - Production build (`npm run build`) and strict lint (`npm run lint`) pass with 0 errors/warnings.

## Acceptance Criteria Verification (Phase 5)
- **A tap on WhatsApp or Instagram creates an enquiry that appears in the admin inbox**: PASS. Verified via Playwright E2E smoke tests on mobile and desktop viewports (`e2e/enquiry-inbox.spec.ts`).
- **The owner can manage enquiries in admin (mark handled, add internal notes, copy reply message)**: PASS. Verified in unit tests and Playwright E2E.
- **Strict digital catalogue scope**: PASS. No payment gateway, no orders table, no fulfillment/tracking code exists.

## Untested Items
- Supabase Realtime WebSocket stability across cellular network dropouts (handled via window focus refetch fallback in `useAdminEnquiries`).
- Live remote database execution with owner credentials in `.env.local` (`npm run verify:admin`).

## Next
- Phase 6: Reviews moderation and deals (percentage and flat coupon codes only).

## Decisions made
- Decision 014: Browser-side image resizing via HTMLCanvasElement to 1600px long edge with WebP transcoding prior to storage upload.
- Decision 017: Digital catalogue only — no payments, no fulfilment tracking.
- Decision 018: Enquiry inbox with new, handled, and dropped statuses.
- Decision 019: Deals simplified to percentage and flat coupons.
