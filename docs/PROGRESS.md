
Updated by the agent at the end of every session.

## Status
Phase: Phase 3 complete (Cart and enquiry flow). Ready for Phase 4 (Admin foundation and products).

## Done
- Initialized Git repository and configured Vitest testing environment with JSDOM.
- **Phase 0 & 1 foundations**: Scaffolding with Vite, React 18, TypeScript strict, Tailwind CSS tokens (`tokens.css`, `globals.css`), Jost font, theme toggle with Zustand, layout shell, Supabase schema migrations 001 to 007, and seed script.
- **Phase 2 Storefront (Read-only) & Pre-Phase 3 Refinements**:
  - Removed hard-coded fallback catalogue `catalogData.ts`. Storefront queries Supabase directly and displays retryable error states if query fails.
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
    - Empty state string from `docs/CONTENT.md` ("Your bag is empty. Explore our collection of everyday elegance.").
    - No coupon field (deferring to Phase 6 per Decision 009).
  - Stale / Sold-out item handling:
    - Live product lookup flags items that became sold out, archived, or deleted since added to bag.
    - Excludes unavailable items from subtotal.
    - Disables order buttons with warning banner until unavailable items are removed.
  - Enquiry creation & Chat handoff (`src/features/enquiries/placeOrder.ts`):
    - Validates bag items, calls `create_enquiry` Supabase RPC with server-enforced pricing.
    - Formats enquiry message using template from `docs/CONTENT.md`, omitting gift note line when empty.
    - WhatsApp flow: cleans contact digits from `site_settings`, navigates via `window.location.href = https://wa.me/<digits>?text=<encoded>`, and provides fallback modal with enquiry reference.
    - Instagram flow: displays dedicated modal (`OrderModal.tsx`) with enquiry reference, message text, "Copy Message" button with clipboard write and toast feedback ("Order copied. Paste it in the chat."), and "Open Instagram" button (`https://ig.me/m/<handle>`).
    - In-flight duplicate submission lock preventing duplicate RPC calls on repeated clicks.
    - RPC failure feedback: toast message ("We couldn’t save your enquiry. Check your connection and try again.") and strict blocking of chat navigation.
    - Bag clearance occurs only after successful chat launch or modal action.
    - Settings check: disables button and displays helpful notice if WhatsApp number or Instagram handle is unconfigured.
  - Product detail integration:
    - Direct single-item "Order on WhatsApp" and "Order on Instagram" place instant direct orders without affecting the bag.
    - "Add to bag" adds line to cart store and opens the drawer.
    - Removed placeholder alert stub.
  - Toast notification system (`toastStore.ts`, `Toast.tsx`) with live announce for screen readers.
- **Automated Tests**:
  - 44 unit & component tests passing cleanly across 10 test suites (`money.test.ts`, `schemas.test.ts`, `cartStore.test.ts`, `messageBuilder.test.ts`, `placeOrder.test.ts`, `ProductCard.test.tsx`, `Accordion.test.tsx`, `Shop.test.tsx`, `ProductDetail.test.tsx`, `CartDrawer.test.tsx`).
  - Playwright E2E test (`e2e/order-flow.spec.ts`) validating end-to-end user journey: add to bag, quantity stepper increase, gift note input, RPC interception, and `wa.me` navigation assert.
  - Production build (`npm run build`) and strict lint (`npm run lint`) pass with 0 errors/warnings.

## Acceptance Criteria Verification (Phase 3)
- **Tapping order creates an enquiry row first, then opens the chat with the correct message**: PASS. Verified in unit tests (`placeOrder.test.ts`), component tests (`CartDrawer.test.tsx`), and E2E specs (`order-flow.spec.ts`).
- **A failed RPC blocks the redirect**: PASS. When `create_enquiry` returns an error or rejects, navigation is blocked and a toast error is displayed (`placeOrder.test.ts` test case).
- **Two tabs show the same bag**: PASS. Implemented via Zustand `persist` with `window.addEventListener('storage', ...)` and verified in `cartStore.test.ts`.

## Untested Items
- Native Instagram app handoff deep-link on actual iOS/Android devices (browser web URL `https://ig.me/m/<handle>` opens the Instagram app or browser chat depending on mobile OS settings).
- Actual remote Supabase RPC execution over the live internet (requires valid Supabase production URL & anon key in `.env.local` pointing to a provisioned instance with migrations 001-007 applied).

## Next
- Phase 4: Admin foundation and products (`/admin` auth guard, product list, create/edit product form with specs and image upload to Supabase storage, archive/reorder products).

## Decisions made
- Decision 008 reaffirmed: WhatsApp uses direct navigation with fallback modal; Instagram uses explicit copy modal with "Open Instagram" button to guarantee clipboard reliability.
- Decision 009 reaffirmed: Coupons deferred until Phase 6 deals engine.
- Extracted toast store into `src/components/ui/toastStore.ts` for clean Fast Refresh and decoupled invocation across asynchronous event handlers.

