# PROGRESS.md

Updated by the agent at the end of every session.

## Status
Phase: Phase 0 complete

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
- Supabase client initialized with graceful handling of env variables in `src/lib/supabase.ts`.
- Money utility helpers in `src/lib/money.ts` (`formatINR`, `rupeesToPaise`, `savingPercent`).
- Verified build (`tsc --noEmit && vite build`) and lint (`eslint`) pass with 0 errors/warnings.

## In progress
- (Phase 0 complete, waiting for confirmation to start Phase 1)

## Next
- Phase 1: database and seed (run migrations 001 to 007, build `npm run seed`, upload product images, generate TypeScript types, verify anon RLS policies).

## Decisions made
- Stack confirmed: Vite, React 18, TypeScript strict, Tailwind CSS, Zustand, TanStack Query v5, Supabase, Vercel.
- Order hand-off UX: WhatsApp direct redirect with fallback modal; Instagram manual copy modal to prevent mobile clipboard permission denial.
- Defer coupon UI until Phase 6 (`discount_paise = 0`, `coupon_code = null`).
- Swappable Logo with serif typographic fallback and placeholder SVG.

## Open questions for the owner
- Product photos: User confirmed they will be placed in `supabase/seed/images/` before Phase 1.
- Supabase project: User will provide Supabase URL and anon key for migration/seed when ready, or local migrations can be created first.
- Real WhatsApp number (placeholder `919999999999` used for seed/settings).
- Real logo file (cream circle with maroon script "Raya", small "BY" above and ".co" after) when available.
