# DECISIONS.md

Short log of choices that are costly to reverse. Newest at the bottom. Format: date, decision, why, alternatives, consequences.

## 001: Chat ordering instead of payments
Customers order through WhatsApp or Instagram DM; payment is arranged in chat. Matches how the brand sells today ("DM to order"). Alternative: a payment gateway (Razorpay). Consequence: no automatic payment status; the owner confirms by hand and the order pipeline is manual.

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

## Template
```
## NNN: Title
Date. Decision. Why. Alternatives considered. Consequences.
```
