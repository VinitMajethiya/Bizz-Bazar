import { z } from 'zod';
import { rupeesToPaise } from '../money';

export const productCategories = [
  'Earrings',
  'Bracelets',
  'Necklaces',
  'Rings',
  'Gift Sets',
] as const;

export const stockStatusOptions = ['in_stock', 'low_stock', 'sold_out'] as const;

export const badgeOptions = [
  '',
  'New drop',
  'Bestseller',
  'Limited edition',
  'Low stock',
  'Sale',
] as const;

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name cannot exceed 80 characters'),
    slug: z
      .string()
      .trim()
      .min(2, 'Slug must be at least 2 characters')
      .max(80, 'Slug cannot exceed 80 characters')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug can only contain lowercase letters, numbers, and hyphens'
      ),
    category: z.string().trim().min(1, 'Category is required'),
    description: z
      .string()
      .trim()
      .max(600, 'Description cannot exceed 600 characters')
      .optional()
      .or(z.literal('')),
    priceRupees: z
      .union([
        z.number().min(0, 'Price must be 0 or more'),
        z.string().min(1, 'Price is required'),
      ])
      .refine(
        (val) => {
          const num = typeof val === 'number' ? val : Number(val);
          return !isNaN(num) && num >= 0;
        },
        { message: 'Price must be 0 or more' }
      ),
    compareAtPriceRupees: z
      .union([z.number().min(0), z.string(), z.null()])
      .optional(),
    stockStatus: z.enum(stockStatusOptions),
    stockQty: z
      .union([z.number().int().min(0), z.string(), z.null()])
      .optional(),
    badge: z.string().optional().nullable(),
    materials: z.array(z.string()),
    sizes: z.array(z.string()),
    specs: z.record(z.string(), z.string()),
    isFeatured: z.boolean(),
    isArchived: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const regularPrice =
      typeof data.priceRupees === 'number'
        ? data.priceRupees
        : Number(data.priceRupees);

    if (
      data.compareAtPriceRupees !== null &&
      data.compareAtPriceRupees !== undefined &&
      data.compareAtPriceRupees !== ''
    ) {
      const comparePrice =
        typeof data.compareAtPriceRupees === 'number'
          ? data.compareAtPriceRupees
          : Number(data.compareAtPriceRupees);

      if (!isNaN(comparePrice) && comparePrice <= regularPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Compare-at price must be higher than the regular price',
          path: ['compareAtPriceRupees'],
        });
      }
    }
  });

export type ProductFormInput = z.infer<typeof productFormSchema>;

export interface ProductDbPayload {
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price_paise: number;
  compare_at_price_paise: number | null;
  stock_status: 'in_stock' | 'low_stock' | 'sold_out';
  stock_qty: number | null;
  badge: string | null;
  options: {
    materials: string[];
    sizes: string[];
  };
  specs_json: Record<string, string>;
  is_featured: boolean;
  is_archived: boolean;
}

export function formInputToDbPayload(input: ProductFormInput): ProductDbPayload {
  const priceRupees =
    typeof input.priceRupees === 'number'
      ? input.priceRupees
      : Number(input.priceRupees);

  let compareAtPaise: number | null = null;
  if (
    input.compareAtPriceRupees !== null &&
    input.compareAtPriceRupees !== undefined &&
    input.compareAtPriceRupees !== ''
  ) {
    const num =
      typeof input.compareAtPriceRupees === 'number'
        ? input.compareAtPriceRupees
        : Number(input.compareAtPriceRupees);
    if (!isNaN(num)) {
      compareAtPaise = rupeesToPaise(num);
    }
  }

  let stockQtyNum: number | null = null;
  if (
    input.stockQty !== null &&
    input.stockQty !== undefined &&
    input.stockQty !== ''
  ) {
    const q =
      typeof input.stockQty === 'number'
        ? input.stockQty
        : parseInt(String(input.stockQty), 10);
    if (!isNaN(q)) {
      stockQtyNum = Math.max(0, q);
    }
  }

  const stockStatus = stockQtyNum === 0 ? 'sold_out' : input.stockStatus;

  return {
    name: input.name.trim(),
    slug: input.slug.trim(),
    category: input.category.trim(),
    description: input.description?.trim() || null,
    price_paise: rupeesToPaise(priceRupees),
    compare_at_price_paise: compareAtPaise,
    stock_status: stockStatus,
    stock_qty: stockQtyNum,
    badge: input.badge && input.badge.trim() ? input.badge.trim() : null,
    options: {
      materials: input.materials || [],
      sizes: input.sizes || [],
    },
    specs_json: input.specs || {},
    is_featured: input.isFeatured ?? false,
    is_archived: input.isArchived ?? false,
  };
}
