# PROMPTS.md: how to drive your agentic IDE

## Setup (5 minutes)
1. Create an empty repo and open it in your IDE.
2. Copy `AGENTS.md` to the repo root. Copy the `docs/` folder. If your IDE reads a different filename (CLAUDE.md, .cursorrules, GEMINI.md and so on), copy `AGENTS.md` to that name too.
3. Create `supabase/seed/images/` and drop in your product photos, renamed to the slugs in `docs/CATALOG.md`.
4. Create a Supabase project and keep the URL and anon key ready.
5. Paste the startup prompt below.

---

## 1. Startup prompt (paste once, at the very start)

```
You are the lead engineer building a mobile-first jewellery storefront with an admin portal.

Before writing any code:
1. Read AGENTS.md, then every file in /docs in the order AGENTS.md lists.
2. Reply with: (a) a 10-line summary of what you understood, (b) the stack you will use and any change you want to propose with a reason, (c) a numbered list of ambiguities or missing information, (d) anything in the docs you think is wrong or risky.
3. Stop and wait for my answers. Do not scaffold anything yet.

After I answer, do Phase 0 from docs/BUILD_PLAN.md only. When it is done, run build and lint, update docs/PROGRESS.md, show me how to check it, and stop. Do not start the next phase until I say so.

Working rules: follow AGENTS.md strictly (money in paise, enquiry saved before the chat opens, RLS everywhere, nothing customer-facing hard-coded). Keep changes small and explain each commit in one line. If something in the docs conflicts, ask instead of guessing.
```

## 2. Phase prompt (reuse for every phase)

```
Start Phase <N> from docs/BUILD_PLAN.md.
First re-read AGENTS.md, docs/PROGRESS.md and the sections of PRD, DESIGN and DATABASE that this phase touches.
Give me a short plan (files you will create or change, and the order). Then build it.
Finish by running build and lint, checking the acceptance criteria one by one (say pass or fail for each), updating docs/PROGRESS.md, and listing anything untested. Then stop.
```

## 3. Database prompt (Phase 1)

```
Create the Supabase migrations from docs/DATABASE.md as numbered files in supabase/migrations/, in order, without changing their meaning. Then write the seed script using docs/CATALOG.md and the images in supabase/seed/images/. Prices go in as paise. Generate TypeScript types. Finally write a small script or test that proves: anon can read live products, anon cannot read enquiries, anon cannot insert into products, and create_enquiry rejects a sold-out product.
```

## 4. Follow-up prompts

**Match the design**
```
Compare the current <page or component> with docs/DESIGN.md at 360px and 1280px. List every difference (spacing, type size, colours, layout, states). Fix them. Do not add decoration that DESIGN.md does not describe.
```

**Fix a bug**
```
Bug: <what I did, what I expected, what happened, device and browser>.
Find the root cause before changing code and explain it in two sentences. Fix it with the smallest change. Add or update a test if the project has a test setup. Check that the order flow and the admin still work.
```

**Add a feature**
```
I want to add: <feature>.
Check docs/PRD.md for conflicts. Tell me what tables, routes, components and admin screens it touches and what could break. Wait for my OK, then implement it, update the docs that changed (PRD, DATABASE, BUILD_PLAN) and PROGRESS.md.
```

**Change data safely**
```
I need this schema change: <change>. Write a new migration file (never edit an old one), update RLS policies and generated types, update DATABASE.md, and check every query that touches the table.
```

**Security review**
```
Review the project as a security auditor. Check: RLS on every table, anon access paths, the create_enquiry function, admin routes and API calls without a session, storage policies, markdown rendering for XSS, secrets in the repo or the bundle, rate limiting on public endpoints, the review honeypot. Report findings by severity with file and line, then fix the high ones.
```

**Performance pass**
```
Run a production build and audit the home, shop and product pages at mobile width. Report bundle size, largest images, layout shift and render-blocking resources. Fix the top five issues. Re-measure and show before and after.
```

**Content editability audit**
```
Search the whole codebase for customer-facing strings, prices, images and contact details that are hard-coded. List them, then move each to site_settings, pages or the products tables, with an admin control to edit it.
```

**Replace placeholder photos**
```
Here is the new photo set. Match each file to a product by name, resize and upload through the same pipeline the admin uses, set hero images and display order, and print a table of product, image count and any product left without a photo.
```

**Pre-launch checklist**
```
Run the launch checklist: production env vars, admin user promoted, real WhatsApp number and Instagram handle in settings, a test enquiry on both channels from a phone, sitemap and robots, JSON-LD validation, 404 page, backups on, no console errors, Lighthouse on home and a product page. Output pass or fail per item and fix any fails.
```

## 5. Session hygiene

**Start of every new session**
```
Read AGENTS.md and docs/PROGRESS.md. Tell me in five lines where we are and what is next. Do not change anything yet.
```

**End of every session**
```
Update docs/PROGRESS.md: what is done, what is half-done, decisions made and why, what is untested, and the exact next step. Commit the docs change.
```

**When the agent drifts or over-builds**
```
Stop. Re-read AGENTS.md and the current phase in docs/BUILD_PLAN.md. List what you changed that is outside this phase. Revert or park it, and continue only with the phase scope.
```

## 6. Tips
- Give the agent one phase at a time. Big prompts like "build the whole site" produce shallow results.
- Test the order flow on a real phone early, in Phase 3, because WhatsApp and Instagram links behave differently on mobile and desktop.
- Keep the brand name, WhatsApp number and handle in the settings table, not in code, so the owner can change them from admin.
- When you change your mind, change the docs first, then tell the agent to follow them.
