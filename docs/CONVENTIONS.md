# CONVENTIONS.md

## TypeScript
Strict mode on. No `any` (use `unknown` and narrow). Generated Supabase types live in `src/lib/database.types.ts`; map database rows (snake_case) to app types (camelCase) in `lib/api/mappers.ts`, once.

## Files and naming
- Components `PascalCase.tsx`, hooks `useThing.ts`, utilities `camelCase.ts`, folders `kebab-case`.
- One component per file. Co-locate tests as `Thing.test.tsx`.
- Named exports, except route-level pages which use default exports for lazy loading.
- Import with the `@/` alias for `src/`.

## Styling
Tailwind utility classes with tokens from `styles/tokens.css` (`bg-surface`, `text-ink`, `text-muted`, `border-line`). No hard-coded hex values in components. No inline styles except dynamic values. Keep spacing on a 4px scale.

## React
Function components and hooks. Keep components under about 150 lines; split by responsibility. Derive state instead of duplicating it. Server state in TanStack Query, UI state local, only the cart and theme in Zustand.

## Forms
react-hook-form with a zod resolver. Show errors under the field in plain language, disable the submit button while saving, never lose typed input on a failed save.

## Data
Never write raw SQL strings in components. Use the api layer. Every mutation invalidates the right query keys. Prices are `Paise` everywhere in code.

## Accessibility
Use real `button`, `a`, `label`, `dialog` semantics. Every icon-only button has an `aria-label`. Focus moves into drawers and modals and returns on close.

## Git
- Branches: `phase-N-short-name`, `fix/short-name`, `feat/short-name`.
- Commits: imperative, one concern, for example `Add create_enquiry RPC call to cart drawer`.
- Do not commit `.env*` (except `.env.example`), `node_modules`, build output or service keys.
- Open a pull request per phase, even if solo, so the diff is reviewable.

## Comments and docs
Comment the why, not the what. When behaviour changes, update the relevant file in `docs/` in the same commit. Record non-obvious choices in `docs/DECISIONS.md`.

## Dependencies
Prefer the platform and the libraries already chosen. Before adding a package, state what it does, its size and why a few lines of code would not do.
