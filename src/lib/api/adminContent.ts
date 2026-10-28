import { supabase, isSupabaseConfigured } from '../supabase';
import type { SiteSettings } from '../types';
import type { Json } from '../database.types';
import type { CMSPage } from './pages';
import { cleanWhatsAppNumber } from '../validation/schemas';

export interface NewsletterLeadItem {
  id: string;
  contact: string;
  createdAt: string;
}

export interface ContactMessageItem {
  id: string;
  name: string;
  contact: string;
  message: string;
  createdAt: string;
}

/**
 * Save all site_settings keys to Supabase.
 */
export async function updateAdminSiteSettings(settings: SiteSettings): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  // Validate and normalize WhatsApp number and Instagram handle
  const normalizedSettings: SiteSettings = {
    ...settings,
    whatsapp_number: cleanWhatsAppNumber(settings.whatsapp_number),
    instagram_handle: settings.instagram_handle.replace(/^@+/, '').trim(),
  };

  const rows = Object.entries(normalizedSettings).map(([key, value]) => ({
    key,
    value: value as unknown as Json,
  }));

  for (const row of rows) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: row.key, value: row.value }, { onConflict: 'key' });

    if (error) {
      throw new Error(`Failed to update setting ${row.key}: ${error.message}`);
    }
  }
}

/**
 * Upload a hero banner image to Supabase Storage in the product-images bucket under hero/
 */
export async function uploadAdminHeroImage(file: File): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const filePath = `hero/banner-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (uploadError) {
    throw new Error(`Failed to upload hero image: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Fetch all CMS pages for admin editor.
 */
export async function fetchAdminCMSPages(): Promise<CMSPage[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('title', { ascending: true });

  if (error || !data) {
    throw new Error(error?.message || 'Failed to fetch pages.');
  }

  return data.map((p) => ({
    slug: p.slug,
    title: p.title,
    bodyMd: p.body_md,
    metaDescription: p.meta_description,
    updatedAt: p.updated_at,
  }));
}

/**
 * Update a CMS page.
 */
export async function updateAdminCMSPage(
  slug: string,
  updates: {
    title: string;
    metaDescription?: string | null;
    bodyMd: string;
  }
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('pages')
    .update({
      title: updates.title.trim(),
      meta_description: updates.metaDescription ? updates.metaDescription.trim() : null,
      body_md: updates.bodyMd,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug);

  if (error) {
    throw new Error(`Failed to update page ${slug}: ${error.message}`);
  }
}

/**
 * Fetch newsletter drop-alert leads.
 */
export async function fetchAdminNewsletterLeads(): Promise<NewsletterLeadItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('newsletter_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    throw new Error(error?.message || 'Failed to fetch newsletter leads.');
  }

  return data.map((l) => ({
    id: l.id,
    contact: l.contact,
    createdAt: l.created_at,
  }));
}

/**
 * Delete a drop-alert lead.
 */
export async function deleteAdminNewsletterLead(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('newsletter_leads')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetch contact messages.
 */
export async function fetchAdminContactMessages(): Promise<ContactMessageItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    throw new Error(error?.message || 'Failed to fetch contact messages.');
  }

  return data.map((m) => ({
    id: m.id,
    name: m.name,
    contact: m.contact,
    message: m.message,
    createdAt: m.created_at,
  }));
}

/**
 * Delete a contact message.
 */
export async function deleteAdminContactMessage(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
