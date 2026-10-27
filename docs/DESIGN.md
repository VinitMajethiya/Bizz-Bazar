# DESIGN.md

Brand: **By Raya.co** (@by.raya.co). Logo is a cream circle with a maroon script "Raya", a small "BY" above and ".co" after. Use the supplied logo file in the header (wordmark text is the fallback) and as the favicon.

Direction: quiet, editorial, minimal. The jewellery is the only colour on the page. Based on the supplied reference (a light, airy jewellery site with a centred wordmark, a full-bleed hero photo, products floating on white, and a mosaic of pale grey category tiles).

## Principles
1. Products are the hero. No heavy borders, shadows or gradients around them.
2. Small, light type. Generous white space. Let photography carry the mood.
3. One memorable moment: the full-bleed hero photograph. Everything else stays quiet.
4. Copy is short and plain: sentence case, active verbs ("Order on WhatsApp", "Add to bag").
5. Avoid template tells: no tracked-out all-caps eyebrow labels above headings, no numbered markers unless the content is a sequence, no "→" on every link, no identical rounded cards with shadows. The wordmark may be letter-spaced capitals because it is a logo.

## Tokens
```css
:root {
  --bg: #fffdf9;           /* warm white, from the logo circle */
  --surface: #f6f1ea;      /* tile and card backdrop, like the reference */
  --ink: #2a1f1e;
  --muted: #7d726f;
  --line: #ebe4dc;
  --accent: #7a2e2a;       /* maroon from the logo, used for sale prices, links on hover and focus rings only */
  --danger: #b3261e;
  --radius: 0px;           /* sharp corners on images and tiles */
  --radius-ui: 2px;        /* inputs and buttons */
}
[data-theme="dark"] { --bg:#171313; --surface:#211b1a; --ink:#f3ece6; --muted:#a39a95; --line:#322927; --accent:#d9908a; }
```
Support light and dark. Follow `prefers-color-scheme` with a manual override stored in localStorage.

## Typography
- Family: **Jost** (300, 400, 500) from Google Fonts, fallback `'Helvetica Neue', Arial, sans-serif`. One family only.
- Scale: body 14px/1.55, small 12px, product name 13px, section title 18px weight 400, hero headline clamp(34px, 5vw, 60px) weight 300 with line-height 1.05.
- Line length under 70 characters for paragraphs.
- Use `’` and `“ ”` in all customer-facing text.

## Layout
- Max content width 1180px, side padding 20px (mobile) and 32px (desktop).
- Header: left = menu and "Catalogue", centre = wordmark, right = search, wishlist (later), bag with count. Sticky, 1px bottom line.
- Announcement ticker above the header: slow marquee, ink background, 12px text, pauses when reduced motion is on.
- Grid: 2 columns on mobile, 4 on desktop, 22px row gap, 16px column gap.

## Page layouts
**Home**
1. Hero: full-bleed photograph, short headline bottom-left over the image (white text with a soft dark scrim if needed), one underlined text link "Go to the catalogue". On mobile the image sits on top and text below.
2. Bestsellers: title left, "View all" underlined link right, 4 products on white with no card chrome. Name 13px, price 12px muted.
3. Category mosaic: pale grey tiles (`--surface`) with a product photo and the category name bottom-left. Three across, then a wide tile with a lifestyle photo (for example a hand wearing a bracelet).
4. Guarantees: four short columns (anti-tarnish finish, skin-friendly, small batches, gift ready). Text only, no icons in circles.
5. Story teaser: photo and short paragraph, link to `/our-story`.
6. Testimonials: three plain quotes with first name and city.
7. Drop alert: one field and one button.
8. Footer: contact links, policies, Instagram.

**Shop**: tabs and sort on one row. Cards are image on `--surface`, then name and price. Badges are small, top-left, background `--bg`, 11px.

**Product**: two columns on desktop (gallery left, details right). Gallery has a large image, thumbnails, tap to zoom. Material selector as outlined chips. Primary button "Order on WhatsApp" solid ink, second button outlined, third outlined. Accordions use a thin top border and a plus or minus.

**Bag drawer**: slides from the right, full width on mobile. Line items with small thumbnail, option, quantity stepper. Gift note textarea. Two order buttons pinned at the bottom.

## Components to build first
Button (solid, outline, link), Input, Select, Chips, Accordion, Badge, Drawer, Modal, Toast, ProductCard, PriceTag (handles sale and strike-through), StarRating, Skeleton.

## Imagery rules
- Square 1:1 crops for grid cards, `object-fit: cover`. Product photos on neutral backgrounds.
- Provide width and height, `loading="lazy"` below the fold, AVIF or WebP via storage transforms if available.
- Missing image: show the tile with the product initial and the text "Photo coming soon". Never a broken image.

## Motion
Only motion that answers a tap: drawer slide (250ms), accordion expand, toast. One hero image fade on first load at most. No scroll-triggered animations on every section.

## Accessibility
Contrast AA, visible focus ring in `--accent`, all controls reachable by keyboard, Esc closes drawers and modals, drawers trap focus, images have meaningful alt text, tap targets at least 40px.

## Voice
The Instagram page speaks in a friendly, lowercase, Gen-Z voice ("POV: you found the necklace that makes a simple outfit look expensive", "no matter how small your business is, be proud"). On the site keep that warmth but write in sentence case and stay clear and short. Keep the tagline wording from the bio: "effortless elegance for every occasion" and "everyday luxury, without the luxury price". A light touch of the POV style is welcome in the home hero caption and in testimonials, never in buttons or errors.

## Imagery from Instagram
The feed uses close-up lifestyle shots: pieces on a hand, a neck, a wrist, and soft cream satin backgrounds. Use that style for the hero, the wide category tile and the story section. Add an "On Instagram" strip near the footer with a link to @by.raya.co (a 4 to 6 image grid the owner uploads in admin; do not hot-link Instagram).

## Tone for copy
Warm and brief. Errors say what happened and what to do ("We couldn’t save your enquiry. Check your connection and try again.").
