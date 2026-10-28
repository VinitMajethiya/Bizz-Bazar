export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StockStatus = 'in_stock' | 'low_stock' | 'sold_out';
export type ChatChannel = 'whatsapp' | 'instagram';
export type EnquiryStatus = 'new' | 'handled' | 'dropped';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type DiscountType = 'percent' | 'flat' | 'fixed_price' | 'bundle';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'customer' | 'admin';
        };
        Insert: {
          id: string;
          role?: 'customer' | 'admin';
        };
        Update: {
          id?: string;
          role?: 'customer' | 'admin';
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: string;
          description: string | null;
          price_paise: number;
          compare_at_price_paise: number | null;
          stock_status: StockStatus;
          stock_qty: number | null;
          badge: string | null;
          options: {
            materials: string[];
            sizes: string[];
          };
          specs_json: Record<string, string>;
          is_featured: boolean;
          is_archived: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          category: string;
          description?: string | null;
          price_paise: number;
          compare_at_price_paise?: number | null;
          stock_status?: StockStatus;
          stock_qty?: number | null;
          badge?: string | null;
          options?: {
            materials: string[];
            sizes: string[];
          };
          specs_json?: Record<string, string>;
          is_featured?: boolean;
          is_archived?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          category?: string;
          description?: string | null;
          price_paise?: number;
          compare_at_price_paise?: number | null;
          stock_status?: StockStatus;
          stock_qty?: number | null;
          badge?: string | null;
          options?: {
            materials: string[];
            sizes: string[];
          };
          specs_json?: Record<string, string>;
          is_featured?: boolean;
          is_archived?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          storage_path: string | null;
          alt: string | null;
          is_hero: boolean;
          display_order: number;
          variant_key: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          storage_path?: string | null;
          alt?: string | null;
          is_hero?: boolean;
          display_order?: number;
          variant_key?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          storage_path?: string | null;
          alt?: string | null;
          is_hero?: boolean;
          display_order?: number;
          variant_key?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      deals: {
        Row: {
          id: string;
          title: string;
          code: string | null;
          discount_type: DiscountType;
          discount_value: number;
          bundle_config: Json | null;
          start_date: string;
          end_date: string | null;
          active: boolean;
          applicable_products: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          code?: string | null;
          discount_type: DiscountType;
          discount_value: number;
          bundle_config?: Json | null;
          start_date?: string;
          end_date?: string | null;
          active?: boolean;
          applicable_products?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          code?: string | null;
          discount_type?: DiscountType;
          discount_value?: number;
          bundle_config?: Json | null;
          start_date?: string;
          end_date?: string | null;
          active?: boolean;
          applicable_products?: string[] | null;
          created_at?: string;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          id: string;
          ref: string;
          items_json: Json;
          subtotal_paise: number;
          discount_paise: number;
          coupon_code: string | null;
          channel: ChatChannel;
          customer_note: string | null;
          internal_notes: string | null;
          status: EnquiryStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          ref: string;
          items_json: Json;
          subtotal_paise: number;
          discount_paise?: number;
          coupon_code?: string | null;
          channel: ChatChannel;
          customer_note?: string | null;
          internal_notes?: string | null;
          status?: EnquiryStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          ref?: string;
          items_json?: Json;
          subtotal_paise?: number;
          discount_paise?: number;
          coupon_code?: string | null;
          channel?: ChatChannel;
          customer_note?: string | null;
          internal_notes?: string | null;
          status?: EnquiryStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string | null;
          rating: number;
          reviewer_name: string;
          title: string | null;
          review_text: string;
          status: ReviewStatus;
          is_offline: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          rating: number;
          reviewer_name: string;
          title?: string | null;
          review_text: string;
          status?: ReviewStatus;
          is_offline?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          rating?: number;
          reviewer_name?: string;
          title?: string | null;
          review_text?: string;
          status?: ReviewStatus;
          is_offline?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
        };
        Insert: {
          key: string;
          value: Json;
        };
        Update: {
          key?: string;
          value?: Json;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          slug: string;
          title: string;
          body_md: string;
          meta_description: string | null;
          updated_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          body_md?: string;
          meta_description?: string | null;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          title?: string;
          body_md?: string;
          meta_description?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      newsletter_leads: {
        Row: {
          id: string;
          contact: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          contact: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      create_enquiry: {
        Args: {
          p_items: Json;
          p_channel: ChatChannel;
          p_note?: string | null;
          p_coupon?: string | null;
        };
        Returns: {
          ref: string;
          items: Json;
          subtotal_paise: number;
          discount_paise: number;
        };
      };
    };
    Enums: {
      stock_status: StockStatus;
      chat_channel: ChatChannel;
      enquiry_status: EnquiryStatus;
      review_status: ReviewStatus;
      discount_type: DiscountType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
