# CATALOG.md: starting products

Names, prices and descriptions are placeholders written from the product photos. The owner should rename each piece to match the names used on the Instagram page (`@by.raya.co`). Instagram shows more pieces than the photos supplied, for example a silver bead-chain necklace, a blue shell pendant (this is the Ocean Shell Pendant) and chunky gold chain bracelets (see the Stacked Chain Set). Add any missing ones in admin. The owner will edit them in admin. Prices are in rupees here; store as paise (multiply by 100).

Photo files are the uploaded WhatsApp images. Rename them to the slug shown and put them in `supabase/seed/images/` so `npm run seed` can upload them to the `product-images` bucket. The order below matches the order the images were uploaded (image 1 is the design reference, not a product).

| # | Slug | Name | Category | Price | Compare-at | Stock | Badge | Materials | Featured | Photo(s) |
|---|------|------|----------|-------|-----------|-------|-------|-----------|----------|----------|
| 1 | lilac-twist-hoops | Lilac Twist Hoops | Earrings | 499 | 699 | in_stock | New Drop | Gold, Rose Gold | yes | image 2 (close-up and worn) |
| 2 | ruby-claw-studs | Ruby Claw Studs | Earrings | 649 | | in_stock | Bestseller | Gold | yes | image 3 |
| 3 | seashell-cuff | Seashell Cuff | Bracelets | 899 | 1199 | in_stock | Limited Edition | Gold | yes | image 4 |
| 4 | golden-blossom-studs | Golden Blossom Studs | Earrings | 749 | | low_stock | Low Stock | Gold | yes | image 5, image 10 (worn) |
| 5 | turquoise-daisy-necklace | Turquoise Daisy Necklace | Necklaces | 999 | | in_stock | Bestseller | Gold | yes | image 6 |
| 6 | stacked-chain-set | Stacked Chain Set | Gift Sets | 1199 | 1499 | in_stock | Sale | Gold | yes | image 7 (worn) |
| 7 | ocean-shell-pendant | Ocean Shell Pendant | Necklaces | 849 | | in_stock | New Drop | Silver | no | image 8 |
| 8 | opal-halo-drops | Opal Halo Drops | Earrings | 799 | | in_stock | | Gold | no | image 9 |
| 9 | twisted-ball-cuff | Twisted Ball Cuff | Bracelets | 449 | | in_stock | | Gold, Silver | no | image 11 |
| 10 | laurel-leaf-hoops | Laurel Leaf Hoops | Earrings | 599 | | in_stock | Bestseller | Gold | no | image 12 |
| 11 | layered-cuff-stack | Layered Cuff Stack | Gift Sets | 1499 | | in_stock | | Gold | no | image 13 (worn) |
| 12 | amethyst-teardrop-drops | Amethyst Teardrop Drops | Earrings | 699 | | in_stock | | Gold | no | image 14 |
| 13 | butterfly-cuff | Butterfly Cuff | Bracelets | 999 | | in_stock | New Drop | Gold, Silver | yes | image 15 (gold), image 18 (silver, linked to option Silver) |
| 14 | petal-wing-studs | Petal Wing Studs | Earrings | 649 | | in_stock | | Pearl White, Sky Blue | no | image 16 (both colours in one shot; split later) |
| 15 | crystal-square-drops | Crystal Square Drops | Earrings | 549 | | sold_out | Sold Out | Gold | no | image 17 |
| 16 | bow-studs | Bow Studs | Earrings | 399 | | in_stock | | Gold | no | image 19 |

## Default specs text (editable per product)
- Material: anti-tarnish plated brass or stainless steel, nickel-free
- Care: keep dry, avoid perfume and lotion, store in the box
- Packaging: gift box and care card included
- Ordering: browse, then tap to order on WhatsApp or Instagram DM

## Seed pages and settings
- Settings: `brand_name` By Raya.co, `whatsapp_number` 919999999999 (placeholder, owner to supply), `instagram_handle` by.raya.co, `support_email` hello@byraya.co (placeholder), `tagline` "Effortless elegance for every occasion", `ticker_text` "Everyday luxury, without the luxury price. DM to order.", `hero_headline` "Effortless elegance for every occasion", `hero_text` "Everyday luxury, without the luxury price. Pick your piece and DM us to order."
- Pages: `our-story`, `privacy`, `terms`, `how-to-order` with short placeholder text the owner will replace.
- Sample deal for testing only: code FIRST10, 10 percent, active. Ask the owner before launching any real offer.
- Testimonials: three placeholders (Riya Pune, Sneha Mumbai, Anjali Kolhapur), stored as approved offline testimonials.
