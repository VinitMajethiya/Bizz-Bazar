import { z } from 'zod';

/**
 * Cleans phone numbers to digits only.
 * E.g., "+91 98765-43210" -> "919876543210"
 */
export function cleanWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Validates either an email address or a 10 to 13 digit phone number.
 */
export const dropAlertSchema = z.object({
  contact: z
    .string()
    .trim()
    .min(1, 'Please enter an email or phone number')
    .refine((val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const digitsOnly = val.replace(/\D/g, '');
      const isPhone = digitsOnly.length >= 10 && digitsOnly.length <= 13;
      return emailRegex.test(val) || isPhone;
    }, 'Enter a valid email address or 10-13 digit phone number'),
});

export type DropAlertInput = z.infer<typeof dropAlertSchema>;

/**
 * Review submission schema with honeypot validation
 */
export const reviewFormSchema = z.object({
  rating: z.number().int().min(1, 'Please choose a rating').max(5),
  reviewer_name: z.string().trim().min(2, 'Name is required').max(80),
  title: z.string().trim().max(120).optional().or(z.literal('')),
  review_text: z.string().trim().min(5, 'Review must be at least 5 characters').max(2000),
  product_id: z.string().uuid().optional().nullable(),
  // Honeypot field: must remain empty!
  website_trap: z.string().max(0, 'Bot submission rejected').optional(),
});

export type ReviewFormInput = z.infer<typeof reviewFormSchema>;
