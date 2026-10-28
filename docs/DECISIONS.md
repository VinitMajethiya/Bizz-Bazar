# DECISIONS.md

Short log of choices that are costly to reverse. Newest at the bottom. Format: date, decision, why, alternatives, consequences.

## 001: Chat ordering instead of online payments
Customers order through WhatsApp or Instagram DM; payment is arranged in chat. Matches how the brand sells today ("DM to order"). Alternative: online payment gateway. Consequence: no automatic payment status; the owner confirms by hand and the order pipeline is manual.

## 002: Save the enquiry before opening the chat
Every order tap writes an enquiry through `create_enquiry` first. Gives the owner the lead even if the shopper never sends the message. Consequence: if the database is down the order button shows an error instead of opening the chat.

## 003: Server recomputes prices
The RPC reads prices from `products` and ignores client prices. Prevents tampering and stale-cart mismatches.

## 004: Supabase for database, auth and storage
One managed service gives Postgres, RLS, auth and image storage. Alternative: custom API plus separate storage. Consequence: security depends on correct RLS; tests in `TESTING.md` verify it.

## 005: Integer paise for money
Avoids float errors. Convert only for display.

## 006: Vite SPA first, prerender for SEO (revisit in Phase 8)
Fast to build and simple to host. Link previews and crawling need prerendering or a later move to Next.js.

## 007: Admin created manually, public sign-up off
Only the owner signs in. Admin rights come from `profiles.role`, checked by `is_admin()` in the database.

## 008: Chat hand-off interaction pattern
2026-10-27. After `create_enquiry` succeeds:
- WhatsApp navigates directly via `window.location.href = https://wa.me/...`. If blocked by browser, displays a fallback modal with enquiry reference and a "Continue to WhatsApp" button.
- Instagram always displays a modal with the reference, formatted order message, explicit "Copy Message" button, and "Open Instagram" button (`https://ig.me/m/<handle>`). Ensures reliable copy on iOS without background clipboard permission failures.

## 009: Defer coupon UI until Phase 6
2026-10-27. Until deals engine is completed in Phase 6, coupons are hidden in storefront UI. `create_enquiry` passes `discount_paise = 0` and `coupon_code = null`.

## 010: Logo placeholder and typographic fallback
2026-10-27. Swappable `<Logo />` component created with SVG placeholder at `src/assets/logo.svg` and serif typographic fallback matching brand aesthetic until official vector logo asset is supplied.

## 011: Database types management
2026-10-27. Schema typed hand-written in `src/lib/database.types.ts` reflecting migrations 001 to 007 with exact Row, Insert, Update interfaces and Postgres enums. Can be regenerated later using `supabase gen types typescript` once the CLI is linked to the remote project.

## 012: Resilient seed pipeline
2026-10-27. `npm run seed` operates idempotently and handles missing images gracefully with warnings rather than fatal errors, permitting database seeding before all final photography is supplied.

## 013: Decoupled modal and toast state for async order flows
2026-10-27. Extracted `orderModalStore` and `toastStore` to lightweight standalone Zustand stores outside React rendering tree. This allows asynchronous functions like `placeOrder()` to trigger clipboard copies, modal alerts, or notification banners reliably without prop-drilling or component context dependencies.

## 014: Browser-side image resizing and WebP transcoding
2026-10-28. Image uploads are resized in the browser via HTMLCanvasElement to a maximum long edge of 1600px and transcoded to WebP (with JPEG fallback) prior to Supabase Storage upload. Why: guarantees fast upload times on mobile network connections, prevents storage quota bloat, and provides uniform high-DPI imagery across storefront viewports.

## 015: [SUPERSEDED by 017] Atomic enquiry-to-order conversion RPC
2026-10-28. Originally implemented `convert_enquiry_to_order` RPC with row-level locking. Superseded by Decision 017 and migration 009 (scope change to digital catalogue only).

## 016: [SUPERSEDED by 017] Orders CSV export formula injection defense
2026-10-28. Originally implemented CSV export for orders. Superseded by Decision 017 removing the orders table.

## 017: Digital catalogue only — no payments, no fulfilment tracking
2026-10-28. The website is strictly a digital catalogue. Removed online payments, orders table, fulfilment status stepper, tracking numbers, couriers, and shipping addresses. Customers browse and order by chat (WhatsApp or Instagram DM). Every tap saves an enquiry first via `create_enquiry` so no lead is lost. Why: The business operates exclusively via direct DM communication; fulfilment tracking in-app adds unnecessary friction and maintenance overhead.

## 018: Enquiry inbox with new, handled, and dropped statuses
2026-10-28. The admin manages customer leads as a clean inbox: `new`, `handled`, `dropped`. Enquiries include internal notes with blur autosave, quick status toggle actions, and a one-click "Copy reply message" button formatted for chat. Why: Gives the owner an efficient workflow to triage incoming leads and maintain notes without an e-commerce order management system.

## 019: [SUPERSEDED by 020] Deals simplified to percentage and flat coupons
2026-10-28. Originally simplified deals to percent/flat codes. Superseded by Decision 020.

## 020: No coupons or deals; the site is a catalogue
2026-10-28. Completely removed all deals, promo codes, discounts, and coupon systems across database, storefront, admin, and order messages. Supersedes Decision 009 (defer coupon UI) and Decision 019 (simplified coupons). Why: The brand sells at fair everyday prices with no artificial markups or discounts. A clean digital catalogue without promotional gimmicks directly reflects the brand ethos: "everyday luxury, without the luxury price."

## 021: Reviews moderation, anti-spam guards, and home page visibility gating
2026-10-28. Customer reviews are submitted via a storefront form with multiple spam defenses: hidden honeypot trap (website_trap), minimum 3-second elapsed time check, and 24-hour duplicate localStorage guard per product. All customer submissions enter the database with status pending, is_offline = false, and show_on_home = false. Only the owner in /admin/reviews can approve (Shown), reject (Hidden), delete, or toggle home page visibility (show_on_home). The owner can also record offline chat testimonials (is_offline = true). Testimonials on the home page only render when approved with show_on_home = true; if 0 exist, the home section is hidden completely. All review text is strictly rendered as plain text to prevent XSS. Why: Protects the catalogue against spam while providing authentic, verified social proof with complete editorial control for the owner.

## Template
```
## NNN: Title
Date. Decision. Why. Alternatives considered. Consequences.
```
