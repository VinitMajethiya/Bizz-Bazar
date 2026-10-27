# AGENTS.md

Read this file first in every session. It is the standing brief for this repo.

## What we are building
A mobile-first D2C jewellery storefront plus an admin portal. Customers do not pay online. They order by tapping "Order on WhatsApp" or "Order on Instagram". Before the chat opens, an enquiry record is saved so the owner never loses a lead. The owner runs everything (products, photos, deals, enquiries, reviews, page text, contact details) from `/admin` with no code changes.

The brand is **By Raya.co** (Instagram `by.raya.co`). Tagline from the Instagram bio: "effortless elegance for every occasion. everyday luxury, without the luxury price." The brand currently sells by DM and links a dm2buy page; this site replaces that link. Brand name, handle and tagline live in `site_settings`, never hard-coded.

## Source of truth (read in this order)
1. `docs/PRD.md` what to build and the rules of the order flow
2. `docs/DESIGN.md` look and feel, tokens, layouts
3. `docs/ARCHITECTURE.md` routes, layers, types, order flow module, image handling
4. `docs/DATABASE.md` schema, RLS policies, RPC, storage
5. `docs/ADMIN_SPEC.md` every admin screen, field and rule
6. `docs/CONTENT.md` default copy, message templates, page drafts
7. `docs/CATALOG.md` starting products and which photo belongs to which
8. `docs/SEO.md` meta tags, JSON-LD, sitemap, prerendering
9. `docs/CONVENTIONS.md` code style, naming, git
10. `docs/TESTING.md` tests and QA to run each phase
11. `docs/SETUP_DEPLOY.md` environment, Supabase, Vercel, launch
12. `docs/BUILD_PLAN.md` phases with acceptance criteria
13. `docs/DECISIONS.md` and `docs/PROGRESS.md` log of choices and current status (you maintain both)

If two docs disagree, PRD wins on behaviour, DESIGN wins on visuals, DATABASE wins on data, ADMIN_SPEC wins on admin screens, CONTENT wins on wording.

## Stack (assumed, confirm in the first session)
- Vite, React 18, TypeScript (strict), React Router
- Tailwind CSS with design tokens as CSS variables
- Zustand for the cart (persist to localStorage, sync across tabs via the `storage` event)
- TanStack Query for server data
- Supabase: Postgres, Auth (email and password), Storage
- react-hook-form and zod for forms
- react-helmet-async for meta tags and JSON-LD
- Deploy on Vercel

## Commands
```
npm run dev        # local dev
npm run build      # type-check and production build
npm run lint
npm run seed       # loads docs/CATALOG.md products into Supabase (create in Phase 1)
npm run sitemap    # generates public/sitemap.xml from live products (Phase 8)
```

## Folder layout
```
src/
  app/            router, providers, layout shell
  components/     ui primitives and shared pieces (ProductCard, CartDrawer, Accordion)
  features/
    catalog/      shop, filters, product page
    cart/         store, drawer, message builders
    enquiries/    create_enquiry call, WhatsApp and Instagram links
    reviews/
    deals/
    pages/        CMS-driven pages (story, legal, contact)
    admin/        auth guard, products, media, deals, enquiries, reviews, settings, pages
  lib/            supabase client, money, seo, zod schemas
  styles/         tokens.css, globals.css
supabase/
  migrations/     numbered SQL files, never edited after they run
  seed/
docs/
```

## Rules that must never be broken
**Money**
- Store and compute prices as integer paise. Convert to rupees only at the display edge with one helper `formatINR(paise)`.
- Never use floats for money. Never trust a price sent from the browser.

**Order flow**
- Create the enquiry through the `create_enquiry` RPC before opening WhatsApp or Instagram. The server recomputes prices from the products table.
- If the RPC fails, show a clear error and do not open the chat.
- WhatsApp: `https://wa.me/<number>?text=<encodeURIComponent(message)>`.
- Instagram: copy the message to the clipboard, then open `https://ig.me/m/<handle>`. Tell the user the message was copied.
- The number, handle and email come from `site_settings`.

**Security**
- RLS is on for every table. The anon key can only read live data and create reviews, leads and contact messages.
- Admin checks use `is_admin()` in the database. A hidden route is not security.
- Never put the service role key in client code or in the repo.
- The review form has a honeypot field. Reject submissions where it is filled.
- Escape or sanitise anything rendered from admin-written markdown.

**Editable everything**
- No customer-facing text, price, image or contact detail is hard-coded. If a string is visible to customers, it comes from the database or from `site_settings` (fallback copy in code is allowed only as a default).

**Quality**
- Mobile first. Check 360px wide before desktop.
- Visible keyboard focus, alt text on every image, `prefers-reduced-motion` respected.
- Product images are lazy-loaded with explicit width and height to avoid layout shift.

## How to work
- Plan before coding: state the plan in a few lines, then build one phase at a time.
- Ask when something in the docs is ambiguous. Do not invent business rules.
- Small commits with clear messages. One concern per commit.
- After each phase: run build and lint, then update `docs/PROGRESS.md` with what changed, what is untested, and what is next.
- Database changes are new files in `supabase/migrations/`. Never edit a migration that has already run.
- Do not add libraries without saying why.

## Definition of done for any task
It works on mobile width, handles loading, empty and error states, has no console errors, passes build and lint, matches DESIGN.md, and PROGRESS.md is updated.
