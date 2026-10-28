# BUILD_PLAN.md

Work one phase at a time. Use `docs/TESTING.md` for the tests that belong to each phase and `docs/ARCHITECTURE.md` for structure. At the end of each phase: build and lint pass, `PROGRESS.md` updated, and a short demo note on how to check it.

## Phase 0: scaffold
Vite + React + TypeScript strict, Tailwind with tokens from DESIGN.md, Jost font, router with placeholder routes, layout shell (ticker, header, footer), theme toggle, Supabase client from env vars, `.env.example`, ESLint and Prettier.
**Accept:** all routes render inside the shell on a 360px screen; light and dark both look right.

## Phase 1: database and seed
Run migrations 001 to 007 on a Supabase project. Write `npm run seed` to insert products, settings, pages, the FIRST10 deal and testimonials from `CATALOG.md`, and to upload images from `supabase/seed/images/`. Generate TypeScript types from the schema.
**Accept:** products and settings visible in the Supabase table editor; anon key can read products but cannot read enquiries.

## Phase 2: storefront read-only
Home, Shop (tabs, sort, badges, sale price), Product page (gallery, options, accordions, related items), settings-driven ticker and hero. Skeleton and empty states. Missing-image fallback.
**Accept:** everything shown comes from the database; changing a row changes the site; sold-out items show a disabled order state.

## Phase 3: cart and enquiry flow
Zustand cart with persistence and cross-tab sync, drawer, quantity, gift note, `create_enquiry` call, message builder, WhatsApp link, Instagram clipboard plus redirect, error handling.
**Accept:** tapping order creates an enquiry row first, then opens the chat with the correct message; a failed RPC blocks the redirect; two tabs show the same bag.

## Phase 4: admin foundation and products
Email and password sign in, `AdminGuard` that checks `profiles.role`, mobile-friendly admin layout, overview counters, product list, create and edit form (zod validated), archive, price entered in rupees and stored as paise, image upload with resize, reorder, hero flag, delete, variant link.
**Accept:** a non-admin account cannot read or write admin data even by calling the API directly; the owner can add a product with photos from a phone.

## Phase 5: enquiry inbox
Enquiries inbox with live updates (Supabase realtime), detail view, search, channel filters, status filter chips (`new`, `handled`, `dropped`), internal notes with autosave, copy pre-formatted reply message, overview counters. (Scope change: catalogue only, no orders table or fulfilment tracking).
**Accept:** an enquiry placed on the storefront appears in the admin inbox within seconds, can be marked handled or dropped, and internal notes persist.

## Phase 6: reviews and deals
Review form with honeypot and validation, pending queue, approve, reject, delete, offline testimonials, average and count on product pages and in JSON-LD. Deals admin (percentage and flat coupon codes only), `/deals` page with copy-code, coupon validation inside `create_enquiry`.
**Accept:** a submitted review is invisible to the public until approved; a valid coupon code changes the stored enquiry discount.

## Phase 7: content pages and settings
Story, contact (form saves to `contact_messages`), privacy, terms, how-to-order rendered from `pages` markdown (sanitised). Admin editors for pages and for every settings key, hero image upload, guarantees and testimonials editing, drop-alert signup and lead list.
**Accept:** the owner can change every visible word on the site from admin.

## Phase 8: SEO, performance, hardening
Meta tags per page, Open Graph, JSON-LD (`Product`, `BreadcrumbList`, `Store`), `robots.txt`, generated `sitemap.xml`, prerender product pages (or decide on a Next.js move and record it), image optimisation, lazy loading, rate limiting for enquiry and review endpoints, error boundary, 404 page, accessibility pass.
**Accept:** Lighthouse mobile 85+ on home and product; structured data validates; keyboard-only run through the order flow works.

## Phase 9: launch
Production Supabase project, environment variables on Vercel, custom domain, admin user created and promoted, real WhatsApp number and Instagram handle, real photos and copy, backups enabled, final QA checklist.
