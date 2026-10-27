# ARCHITECTURE.md

## Routes
| Path | Screen | Data |
|------|--------|------|
| `/` | Home | settings, featured products, testimonials, guarantees |
| `/shop` | Catalogue (`?category=`, `?sort=`) | live products + hero images |
| `/product/:slug` | Product | product, images, approved reviews, related |
| `/deals` | Deals | live deals + their products |
| `/our-story`, `/about` (redirect) | CMS page | `pages` row |
| `/contact` | Contact | settings + `contact_messages` insert |
| `/privacy`, `/terms`, `/shipping-returns` | CMS pages | `pages` row |
| `/admin/login` | Sign in | Supabase Auth |
| `/admin` | Overview | counters |
| `/admin/products`, `/admin/products/new`, `/admin/products/:id` | Catalogue and media | products, product_images |
| `/admin/deals` | Deals | deals |
| `/admin/enquiries`, `/admin/enquiries/:id` | Enquiries and orders | enquiries, orders |
| `/admin/reviews` | Moderation | reviews |
| `/admin/content` | Pages, settings, testimonials, leads, messages | pages, site_settings, newsletter_leads, contact_messages |
| `*` | 404 | none |

Admin routes are lazy-loaded so shoppers never download admin code.

## Layers
```
UI components  ->  feature hooks (TanStack Query)  ->  api functions (lib/api/*.ts)  ->  supabase client
                              \-> stores (Zustand: cart, theme)
```
- Components never call Supabase directly. They use hooks like `useProducts()`, `useProduct(slug)`, `useSettings()`.
- `lib/api/*.ts` holds one function per query or mutation, returns typed data, throws typed errors.
- Query keys: `['products', {category}]`, `['product', slug]`, `['settings']`, `['pages', slug]`, `['reviews', productId]`, `['deals']`, admin keys prefixed with `'admin'`.
- Settings and pages: `staleTime` 5 minutes. Products: 1 minute. Admin lists: realtime subscription plus invalidate on mutation.

## Core types (sketch)
```ts
export type Paise = number; // integer, never a float

export interface Product {
  id: string; slug: string; name: string; category: string; description: string | null;
  pricePaise: Paise; compareAtPricePaise: Paise | null;
  stockStatus: 'in_stock' | 'low_stock' | 'sold_out'; stockQty: number | null;
  badge: string | null; options: { materials: string[]; sizes: string[] };
  specs: Record<string, string>; isFeatured: boolean; images: ProductImage[];
}
export interface CartLine { productId: string; options: { material?: string; size?: string }; qty: number }
export interface CartState { lines: CartLine[]; note: string }
```
The cart stores only ids, options and quantity. Names and prices are looked up from fresh product data, so a price change in admin shows up in the bag.

## Money helper
```ts
export const formatINR = (p: Paise) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const rupeesToPaise = (r: number | string) => Math.round(Number(r) * 100);
export const savingPercent = (price: Paise, compare: Paise | null) =>
  compare && compare > price ? Math.round((1 - price / compare) * 100) : 0;
```

## Order flow module (`features/enquiries`)
```ts
placeOrder(channel: 'whatsapp' | 'instagram', lines: CartLine[], note: string): Promise<void>
```
1. Validate: at least one line, no sold-out product.
2. Call RPC `create_enquiry`. On error: toast "We couldn’t save your enquiry. Check your connection and try again." and stop.
3. Build the message from the RPC response (server prices), not from client data.
4. WhatsApp: `window.location.href = https://wa.me/<digits only>?text=<encoded>` on mobile, `window.open` on desktop. Strip `+`, spaces and dashes from the number.
5. Instagram: `navigator.clipboard.writeText(message)`, toast "Order copied. Paste it in the chat.", then open `https://ig.me/m/<handle>`. If the clipboard call fails, show the message in a modal with a Copy button.
6. Clear the bag only for a bag checkout, and only after the chat link has been opened.

Open the link inside the click handler's call stack where possible, otherwise mobile browsers block the popup. If an async gap makes this unreliable, show a "Continue to WhatsApp" button after the enquiry is saved.

## Image handling
- Admin upload: resize in the browser to 1600px long edge, convert to WebP (JPEG fallback), upload to `product-images/<productId>/<uuid>.webp`, insert `product_images` row with the public URL and storage path.
- Display: use Supabase image transformations if the plan supports them, otherwise serve the stored 1600px file with `srcset` omitted and `loading="lazy"`.
- Delete: remove the storage object and the row together. If the deleted image was the hero, promote the next image.

## Cross-tab bag sync
Zustand `persist` with a storage key `byraya-bag`. Add a `window.addEventListener('storage', ...)` handler that rehydrates the store when that key changes.

## Error handling
- Global error boundary with a friendly page and a reload button.
- Every query shows a skeleton while loading, an empty state when there is no data, and an inline error with Retry on failure.
- Admin mutations show a toast on success and on failure. Never fail silently.

## Realtime (admin only)
Subscribe to `enquiries` inserts so the new-enquiry counter and list update live. Unsubscribe on unmount.
