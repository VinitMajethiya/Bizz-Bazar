# TESTING.md

## Tools
Vitest and React Testing Library for unit and component tests, Playwright for end-to-end, plus SQL checks for security.

## Unit tests (write with the code, not after)
- `formatINR`: 49900 gives ₹499, 129900 gives ₹1,299, 99 gives ₹0.99.
- `rupeesToPaise`: "499" gives 49900, "499.5" gives 49950, "0.1" plus "0.2" never produces float drift.
- `savingPercent`: 69900 compare, 49900 price gives 29.
- Cart store: add, merge same product and option, increment, decrement to zero removes, persist and rehydrate, cross-tab update.
- Message builder: matches the template in `CONTENT.md`, omits the gift note line when empty, encodes correctly for WhatsApp (emoji, ₹ symbol, line breaks).
- WhatsApp number cleaner: `+91 98765-43210` becomes `919876543210`.
- Zod schemas: product form, review form (honeypot filled means reject), contact form, drop alert (valid email or 10 to 13 digit phone).

## Component tests
ProductCard badges and sale price, sold-out disables ordering, filter tabs, sort order, accordion keyboard use, bag drawer focus trap and Esc to close.

## End-to-end (Playwright, mobile viewport 390x844 and desktop 1280x800)
1. Browse, filter, sort, open a product, change material, add to bag, change quantity, add a gift note.
2. Order on WhatsApp: an enquiry row exists with status `new` and correct totals, and the browser tried to open a `wa.me` URL whose text contains the reference.
3. Order on Instagram: clipboard contains the message and `ig.me` opens.
4. Sold-out product cannot be ordered.
5. Submit a review: not visible publicly. Approve in admin: visible.
6. Admin: sign in, create a product with two images, see it on the shop, change its price, see the change, archive it, see it disappear.
7. Admin: open enquiries inbox, filter by status and channel, search by ref, save internal notes, mark handled or dropped, copy pre-formatted reply message.
8. Edit the ticker and WhatsApp number in settings, see the storefront change after refresh.
9. Non-admin user cannot open `/admin` content.

## Security SQL checks (run as the anon role and as a normal signed-in user)
```
select count(*) from enquiries;                          -- must fail or return 0 rows
insert into products (...) values (...);                 -- must fail
select * from reviews where status = 'pending';          -- must return 0 rows
insert into reviews (..., status) values (..., 'approved'); -- must fail
select create_enquiry('[{"product_id":"<sold out id>","qty":1}]','whatsapp');  -- must raise
```
Also confirm that tampering with a price in the request payload has no effect on the stored `unit_price_paise`.

## Manual QA checklist (real devices)
- Android Chrome and iPhone Safari: bag, order buttons, WhatsApp opens with the text, Instagram DM opens, clipboard works.
- 360px width: no horizontal scroll anywhere, including the admin.
- Slow 3G: skeletons show, images lazy-load, nothing jumps.
- Keyboard only: reach every control, visible focus, Esc closes drawers.
- Screen reader spot check on product page and bag.
- Light and dark themes both readable.
- Lighthouse mobile: performance 85+, accessibility 95+, SEO 95+.
- View source of a product URL after prerender: title, description and JSON-LD present.
- Paste a product link into WhatsApp: correct preview.

## Definition of a passing phase
Unit tests for new logic exist and pass, relevant end-to-end steps pass, no console errors, build and lint clean.
