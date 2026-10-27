import { supabase, isSupabaseConfigured } from '../supabase';
import type { SiteSettings } from '../types';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand_name: 'By Raya.co',
  whatsapp_number: '919999999999',
  instagram_handle: 'by.raya.co',
  support_email: 'hello@byraya.co',
  tagline: 'Effortless elegance for every occasion',
  business_hours: 'Mon – Sat: 10:00 AM – 7:00 PM IST',
  ticker_text: 'Everyday luxury, without the luxury price. DM to order.',
  hero_headline: 'Effortless elegance for every occasion',
  hero_text: 'Everyday luxury, without the luxury price. Pick your piece and DM us to order.',
  hero_image_url: '',
  story_teaser: 'By Raya.co is jewellery for everyday wear: pieces that look expensive without the price tag.',
  guarantees: [
    { title: 'Anti-tarnish finish', text: 'Plated and sealed for daily wear.' },
    { title: 'Skin-friendly', text: 'Nickel-free and hypoallergenic.' },
    { title: 'Gift ready', text: 'Every order is packed in a gift box.' },
    { title: 'Order by DM', text: 'Message us and we’ll confirm everything in chat.' },
  ],
  footer_text: 'Effortless elegance for every occasion. Everyday luxury, without the luxury price.',
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) {
    return DEFAULT_SITE_SETTINGS;
  }

  try {
    const { data, error } = await supabase.from('site_settings').select('*');

    if (error || !data || data.length === 0) {
      return DEFAULT_SITE_SETTINGS;
    }

    const settingsMap: Record<string, unknown> = {};
    for (const row of data) {
      settingsMap[row.key] = row.value;
    }

    return {
      brand_name: (settingsMap.brand_name as string) || DEFAULT_SITE_SETTINGS.brand_name,
      whatsapp_number: (settingsMap.whatsapp_number as string) || DEFAULT_SITE_SETTINGS.whatsapp_number,
      instagram_handle: (settingsMap.instagram_handle as string) || DEFAULT_SITE_SETTINGS.instagram_handle,
      support_email: (settingsMap.support_email as string) || DEFAULT_SITE_SETTINGS.support_email,
      tagline: (settingsMap.tagline as string) || DEFAULT_SITE_SETTINGS.tagline,
      business_hours: (settingsMap.business_hours as string) || DEFAULT_SITE_SETTINGS.business_hours,
      ticker_text: (settingsMap.ticker_text as string) || DEFAULT_SITE_SETTINGS.ticker_text,
      hero_headline: (settingsMap.hero_headline as string) || DEFAULT_SITE_SETTINGS.hero_headline,
      hero_text: (settingsMap.hero_text as string) || DEFAULT_SITE_SETTINGS.hero_text,
      hero_image_url: (settingsMap.hero_image_url as string) || DEFAULT_SITE_SETTINGS.hero_image_url,
      story_teaser: (settingsMap.story_teaser as string) || DEFAULT_SITE_SETTINGS.story_teaser,
      guarantees: (settingsMap.guarantees as SiteSettings['guarantees']) || DEFAULT_SITE_SETTINGS.guarantees,
      footer_text: (settingsMap.footer_text as string) || DEFAULT_SITE_SETTINGS.footer_text,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
