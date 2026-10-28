# PRD: Jewellery storefront with chat ordering

## 1. Goal
Let By Raya.co (@by.raya.co) move from "DM to order" with a link-in-bio page to a proper storefront, still selling through WhatsApp and Instagram DMs with a polished storefront, and give the owner a mobile-friendly admin to run it without a developer.

## 2. Users
- **Shopper**: browses on a phone, picks a piece, taps order, finishes in chat.
- **Owner/admin**: manages catalogue, photos, deals, enquiries, reviews and page text, mostly from a phone.

## 3. Order flow
1. Shopper adds items (product, material option, quantity) to the bag or taps an order button on a product page.
2. Tap "Order on WhatsApp" or "Order on Instagram".
3. App calls `create_enquiry(items, channel, note, coupon)`. Server validates products, recomputes prices, stores an enquiry with status `new`, and returns a reference like `BR-7K3F9A`.
4. App builds a message and opens the chat:
```
Hi By Raya.co, I would like to order (ref BR-7K3F9A):
- Lilac Twist Hoops (Gold) x1 = ₹499
- Bow Studs (Gold) x2 = ₹798
Subtotal: ₹1,297
Gift note: Happy birthday Riya
```
5. Enquiry stays visible in admin even if the shopper never sends the message.
6. Owner confirms details in chat, and manages the enquiry in the admin inbox (marking it handled or dropped, and recording internal notes).

Sold-out products cannot be ordered. Quantity is limited to 1 to 10 per line and to stock where tracked.

## 4. Storefront pages
**Home `/`**: announcement ticker, hero (headline, text, image, call to action), bestsellers row, category tiles, guarantees, story teaser, testimonials, drop-alert signup (email or phone, validated, stored).

**Shop `/shop`**: category tabs (All, Earrings, Bracelets, Necklaces, Rings, Gift Sets), sort (Featured, Price low to high, Price high to low, Newest), cards with badges (New Drop, Bestseller, Limited Edition, Low Stock, Sold Out, Sale with percent), strike-through compare-at price. Filtering is instant and client-side. Category can be deep-linked with `?category=`.

**Product `/product/:slug`**: gallery with thumbnails and variant-aware images, title, category, price, compare-at, saving badge, stock indicator, material selector, quantity, three buttons (Order on WhatsApp, Order on Instagram, Add to bag), four accordions (Material and specifications, Sizing guide, Care and maintenance, Packaging and gifting), reviews with average and count, write-a-review form (stars, name, title, body, honeypot) saved as `pending`, related products from the same category.

**Pages**: `/our-story`, `/contact` (chat buttons, email, hours, enquiry form saved to the database), `/privacy`, `/terms`, `/how-to-order`. All body text is editable in admin.

**Bag drawer**: available on every page, persisted in localStorage, synced across tabs. Quantity controls, remove, live subtotal in ₹, free-text gift note, two order buttons.

## 5. Admin `/admin`
- Email and password sign in. Only users with role `admin` get in.
- **Overview**: counters for new enquiries, total enquiries, live products, low stock or sold out, pending reviews, drop-alert sign-ups.
- **Products**: create, edit, archive. Fields: name, slug, category, description, price, compare-at, stock status and quantity, badge, materials and sizes, specs (material, plating, stones, weight, size), featured flag.
- **Media**: upload to storage, reorder, set hero image, delete, optional link of an image to a material option.
- **Enquiries inbox**: live list with channel and age, filter chips (`New`, `Handled`, `Dropped`, `All`), search, detail view, internal notes with autosave, copy reply message, status updates (`handled`, `dropped`, reopen).
- **Reviews**: queue of pending, approve, reject, delete, add offline testimonials by hand.
- **Pages and settings**: edit WhatsApp number, Instagram handle, email, hours, ticker text, hero text and image, story and legal page text, home-page testimonials and guarantees.

## 6. SEO
Per-page title and description, Open Graph tags, JSON-LD (`Product` with offers and aggregate rating, `BreadcrumbList`, `Store`), `sitemap.xml`, `robots.txt`. Note: a client-rendered SPA is weaker for crawlers. Plan for prerendering product pages in Phase 8 and record the choice in PROGRESS.md.

## 7. Non-goals for v1
Online payments, coupons/deals/discounts, order fulfillment/courier tracking, customer accounts, inventory sync, multi-currency, shipping rate calculation.

## 8. Success checks
- A shopper can place an enquiry from a phone in under 30 seconds.
- Every enquiry that reaches the chat step exists in admin.
- The owner can change a price, a photo, the ticker and the story text without touching code.
- Lighthouse mobile performance 85 or higher on home and product pages.
