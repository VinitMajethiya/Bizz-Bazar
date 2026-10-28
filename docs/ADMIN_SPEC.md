# ADMIN_SPEC.md

Design for a phone first. The owner will use this mostly from a phone, so use a bottom tab bar on mobile (Overview, Products, Enquiries, Reviews, More) and a side nav on desktop. All forms are single-column on mobile with large tap targets.

## Sign in
Email and password. No sign-up link. Show "Wrong email or password" on failure. After sign in, check `profiles.role = 'admin'`; otherwise sign out and show "This account doesn’t have admin access."

## Overview
Counters (tap to open the filtered list): New enquiries, Total enquiries, Live products, Low stock or sold out, Pending reviews, Drop-alert sign-ups. Below: the five latest enquiries.

## Products
**List**: thumbnail, name, category, price, stock status, archived flag. Search by name, filter by category and status. Button "Add product".

**Form fields**
| Field | Rules |
|-------|-------|
| Name | required, 2 to 80 characters |
| Slug | auto from name, editable, unique, lowercase letters, numbers, hyphens |
| Category | select: Earrings, Bracelets, Necklaces, Rings, Gift Sets (admin can add new) |
| Description | up to 600 characters |
| Price (₹) | required, number, 0 or more, saved as paise |
| Compare-at price (₹) | optional, must be higher than price |
| Stock status | In stock, Low stock, Sold out |
| Stock quantity | optional integer; if set and 0, status becomes Sold out automatically |
| Badge | none, New Drop, Bestseller, Limited Edition, Low Stock, Sale |
| Materials | chips input (Gold, Silver, Rose Gold, custom) |
| Sizes | chips input, optional (ring sizes 5 to 9, chain lengths) |
| Specs | key and value rows: Material, Plating, Stones, Weight, Size |
| Featured on home | toggle |
| Archived | toggle; archived products disappear from the store |

**Media panel** (inside the product form): upload one or many, drag to reorder (up and down buttons on mobile), star to set hero, optional "show for material" dropdown, alt text field, delete with confirmation.

**Actions**: Save, Save and add another, Archive, View on site. Warn on leaving with unsaved changes. Slug changes require confirmation warning about breaking links.

## Enquiries inbox
**List**: reference, channel icon, items summary, subtotal, age ("12 min ago"), status. Filters: status filter chips (New, Handled, Dropped, All), channel filter (All, WhatsApp, Instagram), search query by reference or item name. Realtime updates via Supabase realtime.

**Detail**: items table, subtotal, customer note, created time, channel, internal notes textarea (with blur autosave and toast feedback).

**Actions**:
- "Mark handled": sets status to handled.
- "Reopen": sets status back to new.
- "Mark as dropped": opens confirmation modal and sets status to dropped.
- "Copy reply message": copies pre-formatted template:
  `Hi! Thanks for your enquiry {ref} for {items}. Your total is {subtotal}. We’ll confirm availability and next steps here in chat.`

## Reviews
Tabs: Pending, Approved, Rejected. Each card shows product, stars, name, title, text, date. Actions: Approve, Reject, Delete. "Add testimonial": product (optional, blank means site-wide), name, rating, text; saved as approved with `is_offline = true`.

## Content
- **Pages**: pick a page (Our story, Privacy, Terms, How to order), edit title, body (markdown with live preview), meta description. Save shows the public link.
- **Site settings**: brand name, tagline, WhatsApp number (digits with country code, validated), Instagram handle (no @), support email, business hours, ticker text, hero headline, hero text, hero image upload, story teaser, footer text.
- **Home content**: guarantees (title and text rows), "On Instagram" strip images.
- **Leads and messages**: drop-alert sign-ups (copy all, delete) and contact messages (read, delete).

## Admin non-functional rules
- Every destructive action asks for confirmation with the item name.
- Every list has loading, empty and error states.
- Session expiry redirects to sign in and returns to the same page afterwards.
- No admin data is ever cached to localStorage.
