# By Raya.co storefront

Mobile-first jewellery storefront with chat ordering (WhatsApp and Instagram DM) and an admin portal where the owner manages products, photos, deals, enquiries, reviews and page text.

## Docs
| File | Purpose |
|------|---------|
| `AGENTS.md` | Standing instructions for the coding agent. Read first. |
| `PROMPTS.md` | Startup prompt and follow-up prompts for your agentic IDE. |
| `docs/PRD.md` | What to build and how ordering works |
| `docs/DESIGN.md` | Visual system and page layouts |
| `docs/ARCHITECTURE.md` | Routes, layers, types, order flow module, image handling |
| `docs/DATABASE.md` | Schema, RLS, RPC, storage |
| `docs/ADMIN_SPEC.md` | Every admin screen, field and rule |
| `docs/CONTENT.md` | Default copy, message templates, page drafts |
| `docs/CATALOG.md` | Starting products and photo mapping |
| `docs/SEO.md` | Meta tags, JSON-LD, sitemap, prerendering |
| `docs/CONVENTIONS.md` | Code style, naming, git |
| `docs/TESTING.md` | Unit, end-to-end, security and manual QA |
| `docs/SETUP_DEPLOY.md` | Supabase, Vercel, env vars, launch routine |
| `docs/BUILD_PLAN.md` | Phases with acceptance criteria |
| `docs/DECISIONS.md` | Log of key decisions |
| `docs/PROGRESS.md` | Live status, updated every session |

## Quick start
1. Put your photos in `supabase/seed/images/` named by slug (see `docs/CATALOG.md`).
2. Follow `docs/SETUP_DEPLOY.md` for Supabase and environment variables.
3. Paste the startup prompt from `PROMPTS.md` into your IDE agent.
