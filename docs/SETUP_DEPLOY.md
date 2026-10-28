# SETUP_DEPLOY.md

## Accounts
GitHub, Supabase, Vercel. Optional: domain registrar.

## Local setup
```
git clone <repo> && cd <repo>
cp .env.example .env.local
npm install
npm run dev
```

## Environment variables
| Name | Where | Notes |
|------|-------|-------|
| `VITE_SUPABASE_URL` | client | project URL |
| `VITE_SUPABASE_ANON_KEY` | client | safe to expose, protected by RLS |
| `VITE_SITE_URL` | client and build | canonical URL, for example `https://byraya.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | local only, for `npm run seed` | **never** prefix with `VITE_`, never commit, never put on Vercel client env |
| `VERCEL_DEPLOY_HOOK_URL` | optional, server side | rebuild prerendered pages after product edits |

Commit `.env.example` with empty values. `.env.local` is in `.gitignore`.

## Supabase steps
1. Create a project (choose the region closest to India, for example Mumbai if available).
2. Run the migrations in `supabase/migrations/` in order or execute the consolidated `supabase/schema.sql` in the Supabase SQL Editor.
3. Authentication settings: turn **off** "Allow new users to sign up". Create the owner's user from the dashboard (Authentication, Users, Add user) with a strong password.
4. Promote the owner: `update profiles set role='admin' where id='<user id>';`
5. Storage: confirm the `product-images` bucket exists and is public, with the admin-only write policies.
6. Run `npm run seed` locally with the service role key in `.env.local`.
7. Verify with the SQL checks in `docs/TESTING.md` (anon cannot read enquiries or write products).
8. Enable daily backups (paid plan) or schedule a weekly export. Know where the restore button is.

## Vercel steps
1. Import the GitHub repo. Framework preset: Vite.
2. Add the environment variables above (client ones only).
3. Add `vercel.json` so client-side routes work:
```json
{ "rewrites": [{ "source": "/((?!assets|robots.txt|sitemap.xml).*)", "destination": "/index.html" }] }
```
4. Deploy. Then add the custom domain and force HTTPS.
5. Add Supabase Auth URL settings: set the Site URL and redirect URLs to the production domain.

## Rate limiting and abuse
`create_enquiry`, review inserts, newsletter and contact inserts are public. Before launch add one of: Cloudflare in front with rate rules, a Vercel Edge Function that proxies these calls with per-IP limits, or a Supabase Edge Function with a small `rate_limits` table. Add Cloudflare Turnstile or hCaptcha to the review and contact forms if spam appears.

## Post-launch routine
- Check the Supabase dashboard weekly for unusual enquiry volume.
- Back up database records regularly.
- Rotate the admin password if a device is lost.
- Update the Instagram link in bio to the new site (replace the old dm2buy link) once the owner confirms the site is ready.
