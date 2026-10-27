# PROGRESS.md

Updated by the agent at the end of every session.

## Status
Phase: Phase 1 code complete (awaiting user DB migration & seed execution in Supabase)

## Done
- Initialized Git repository.
- Scaffolding with Vite, React 18, TypeScript strict mode, Tailwind CSS with DESIGN.md tokens (`tokens.css`, `globals.css`).
- Jost font integrated from Google Fonts with fallback.
- Configured ESLint (`.eslintrc.cjs`), Prettier (`.prettierrc`), `.gitignore` (ignoring `.env*` except `.env.example`), `.env.example`, `.env.local`, `vercel.json` (SPA rewrites).
- Swappable `<Logo />` component and SVG placeholder (`src/assets/logo.svg`).
- Theme toggle system using Zustand supporting light and dark modes with `prefers-color-scheme` and `localStorage` persistence.
- Layout shell (`Ticker`, `Header`, `Footer`, `Layout`) with responsive mobile menu and min 40px tap targets.
- All storefront routes and lazy-loaded admin routes configured in `router.tsx` with loading suspense.
- Placeholder pages for Home, Shop, ProductDetail, Deals, OurStory, Contact, Privacy, Terms, ShippingReturns, 404, AdminLogin, AdminLayout, AdminOverview, AdminProducts, AdminProductForm, AdminDeals, AdminEnquiries, AdminEnquiryDetail, AdminReviews, AdminContent.
- Supabase client initialized with typed `Database` schema in `src/lib/supabase.ts`.
- Money utility helpers in `src/lib/money.ts` (`formatINR`, `rupeesToPaise`, `savingPercent`).
- Migrations 001 to 007 created in `supabase/migrations/`:
  - `001_types_profiles.sql` (enums, profiles, on_auth_user_created trigger, `is_admin()`)
  - `002_catalogue.sql` (`products` with integer paise and options jsonb, `product_images`)
  - `003_deals_enquiries_orders.sql` (`deals`, `enquiries`, `orders`)
  - `004_reviews_content_leads.sql` (`reviews`, `site_settings`, `pages`, `newsletter_leads`, `contact_messages`)
  - `005_row_level_security.sql` (RLS policies for all 11 tables)
  - `006_create_enquiry_rpc.sql` (`create_enquiry` with server price calculation, discount_paise=0, coupon_code=null)
  - `007_storage.sql` (product-images storage bucket & public read/admin write policies)
- Hand-written TypeScript schema types in `src/lib/database.types.ts`.
- Idempotent seed script (`supabase/seed/seed.ts` via `npm run seed`) with 16 products from `CATALOG.md` (paise values), default specs, site settings, CMS pages from `CONTENT.md`, inactive FIRST10 deal, 3 offline testimonials, and resilient image upload.
- Security verification script (`supabase/seed/verify.ts` via `npm run verify:db`) validating anon read/write permissions, RLS protection on enquiries/pending reviews, and price tampering prevention in `create_enquiry`.
- Build (`tsc --noEmit && vite build`) and lint (`eslint`) passing cleanly with 0 errors/warnings.

## In progress
- (Phase 1 code complete. Awaiting user to run migrations and execute seed in live Supabase project)

## Next
- Phase 2: storefront read-only (Home, Shop filters/sort/badges, Product page gallery & accordions, live Supabase queries via TanStack Query, skeletons, empty states).

## Decisions made
- Stack confirmed: Vite, React 18, TypeScript strict, Tailwind CSS, Zustand, TanStack Query v5, Supabase, Vercel.
- Order hand-off UX: WhatsApp direct redirect with fallback modal; Instagram manual copy modal to prevent mobile clipboard permission denial.
- Defer coupon UI until Phase 6 (`discount_paise = 0`, `coupon_code = null`).
- Swappable Logo with serif typographic fallback and placeholder SVG.
- Schema types hand-written in `database.types.ts`; regeneration instructions documented for Supabase CLI.
- Resilient seed execution skipping missing photos with warning.

## Open questions for the owner
- Running migrations 001 to 007 in Supabase SQL editor or via CLI.
- Placing product photos in `supabase/seed/images/` before running `npm run seed`.
- Supplying live `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` to execute `npm run seed` and `npm run verify:db`.
