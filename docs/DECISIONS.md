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

## Template
```
## NNN: Title
Date. Decision. Why. Alternatives considered. Consequences.
```
