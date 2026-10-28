# PROGRESS.md

Updated by the agent at the end of every session.

## Status
Phase: Phase 5 complete (Enquiries and orders). Ready for Phase 6 (Deals and promotions).

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
- **Phase 5 Enquiries and Orders**:
  - **Database Migration (`008_realtime_orders_convert.sql`)**:
    - Enabled Supabase Realtime publication on `enquiries` table (`alter publication supabase_realtime add table public.enquiries`).
    - Added `set_updated_at()` trigger for `orders`.
    - Created `convert_enquiry_to_order(p_enquiry_id, p_name, p_phone, p_address, p_total_paise)` transactional RPC: checks `is_admin()`, acquires row-level exclusive lock on enquiry (`for update`), enforces state transition checks (rejects if already converted or dropped), inserts confirmed order record, updates enquiry status to `converted`, and guarantees idempotency against duplicate invocations.
    - Revoked execute privileges from `public` and `anon`; granted exclusively to `authenticated`.
    - Updated `docs/DATABASE.md` documenting migration 008.
  - **Admin Unified Pipeline (`AdminEnquiries.tsx`)**:
    - Unified pipeline view with filter chips: All Pipeline, New, Confirmed, Processing, Packed, Shipped, Delivered, Cancelled, Dropped.
    - Channel filtering: All Channels, WhatsApp, Instagram.
    - Search input matching reference (e.g. BR-7K3F), customer name, or item names.
    - Live indicator with Supabase Realtime channel subscription listening to `enquiries` insert and update events; graceful fallback to refetch on window focus.
    - Row display: Enquiry reference, channel icon (WhatsApp / Instagram), items summary with options and quantity, subtotal in integer paise rendered via `formatINR`, relative age ("12 min ago" via `formatAge`), and status badge.
  - **Enquiry Detail (`AdminEnquiryDetail.tsx`)**:
    - Complete items table showing server-enforced prices, chosen materials/sizes, item quantities, subtotal, discount, customer gift note, channel source, and created timestamp.
    - Action buttons: "Convert to order", "Mark as dropped" (with confirmation dialog), "Reopen" (for dropped enquiries), and "Copy reply message" formatted from `docs/CONTENT.md` with clipboard fallback.
  - **Convert to Order Modal (`ConvertOrderModal.tsx`)**:
    - Modal dialog requiring customer name, phone number, shipping address (10 to 300 characters), and prefilled total in rupees (saved as paise).
    - Calls `convert_enquiry_to_order` RPC, disables button during mutation, and redirects to the order detail view upon success.
  - **Order Detail & Fulfillment Stepper (`AdminEnquiryDetail.tsx`)**:
    - 5-stage status stepper: Confirmed -> Processing -> Packed -> Shipped -> Delivered, plus Cancelled.
    - Courier partner and tracking number modal triggered when advancing to "Shipped".
    - Inline editable customer details (name, phone, address) and internal notes.
    - Cancellation confirmation dialog.
  - **CSV Export Dialog (`AdminEnquiries.tsx`, `csvExport.ts`)**:
    - Date range filter (start and end date).
    - RFC 4180 compliant CSV generator with spreadsheet formula injection defense (prepends single quote to cells beginning with `=`, `+`, `-`, `@`, `\t`, `\r`) and UTF-8 Byte Order Mark (`\uFEFF`) for Microsoft Excel & Google Sheets compatibility.
  - **Admin Overview Counters (`AdminOverview.tsx`, `adminOverview.ts`)**:
    - Live counters for `newEnquiries` and `ordersInProgress` with direct links to `/admin/enquiries?status=new` and `/admin/enquiries?status=confirmed`.
  - **Safety & Plain-text Rendering**:
    - All customer-supplied text (notes, customer names, shipping addresses) rendered strictly as plain text, eliminating XSS risks.
- **Automated Tests**:
  - 79 unit and component tests passing across 17 test suites (including `csvExport.test.ts`, `statusStepper.test.ts`, `formatAge.test.ts`, `replyBuilder.test.ts`).
  - 4 Playwright E2E tests passing on both mobile (390x844) and desktop (1280x800) covering storefront enquiry placement, admin pipeline visibility, conversion to order, fulfillment status stepper, and CSV download.
  - Extended `supabase/seed/verify-admin.ts` with enquiry conversion, double-call idempotency check, and non-admin/anon RLS blocks on orders and conversion RPC.
  - Production build (`npm run build`) and strict lint (`npm run lint`) pass with 0 errors/warnings.

## Acceptance Criteria Verification (Phase 5)
- **A tap on WhatsApp on the phone creates an enquiry that appears in the admin within two seconds**: PASS. The storefront triggers `create_enquiry` before launching the WhatsApp URI; the admin pipeline listens to Supabase Realtime changes on `enquiries` and updates state in real time.
- **The owner can convert an enquiry, advance it to delivered, and see it in the CSV export**: PASS. Verified via Playwright E2E (`e2e/admin-orders.spec.ts`) across mobile and desktop viewports, stepping through Confirmed -> Processing -> Packed -> Shipped (courier & tracking modal) -> Delivered, and exporting CSV.

## Untested Items
- Supabase Realtime WebSocket stability across mobile cellular connection dropouts (graceful window focus refetch fallback is implemented in `useAdminPipeline`).
- Live verification against remote Supabase database with live user credentials in `.env.local` (`npm run verify:admin`).

## Next
- Phase 6: Deals and promotions (percentage, fixed amount, bundle discounts, auto-apply vs coupon code, storefront discount banner/pill, and bag discount display).

## Decisions made
- Decision 014: Browser-side image resizing via HTMLCanvasElement to 1600px long edge with WebP transcoding prior to storage upload.
- Decision 015: Atomic enquiry-to-order conversion RPC with row-level locking.
- Decision 016: Formula injection defense and UTF-8 BOM in CSV exports.
