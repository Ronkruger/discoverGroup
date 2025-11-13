// Supabase Database Types
// These types match the tables created in COMPLETE_SUPABASE_SETUP.sql

export interface Database {
  public: {
    Tables: {
      featured_videos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      map_markers: {
        Row: {
          id: string;
          city: string;
          country: string | null;
          top: string;
          left: string;
          description: string | null;
          tour_slug: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          city: string;
          country?: string | null;
          top: string;
          left: string;
          description?: string | null;
          tour_slug?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city?: string;
          country?: string | null;
          top?: string;
          left?: string;
          description?: string | null;
          tour_slug?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tour_images: {
        Row: {
          id: string;
          tour_slug: string;
          image_url: string;
          image_type: 'cover' | 'gallery' | 'thumbnail';
          display_order: number;
          alt_text: string | null;
          caption: string | null;
          is_active: boolean;
          storage_path: string | null;
          file_size: number | null;
          width: number | null;
          height: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tour_slug: string;
          image_url: string;
          image_type: 'cover' | 'gallery' | 'thumbnail';
          display_order?: number;
          alt_text?: string | null;
          caption?: string | null;
          is_active?: boolean;
          storage_path?: string | null;
          file_size?: number | null;
          width?: number | null;
          height?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tour_slug?: string;
          image_url?: string;
          image_type?: 'cover' | 'gallery' | 'thumbnail';
          display_order?: number;
          alt_text?: string | null;
          caption?: string | null;
          is_active?: boolean;
          storage_path?: string | null;
          file_size?: number | null;
          width?: number | null;
          height?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tour_pdfs: {
        Row: {
          id: string;
          tour_slug: string;
          pdf_url: string;
          pdf_type: 'booking' | 'itinerary' | 'terms' | 'brochure';
          title: string;
          description: string | null;
          file_size: number | null;
          storage_path: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tour_slug: string;
          pdf_url: string;
          pdf_type: 'booking' | 'itinerary' | 'terms' | 'brochure';
          title: string;
          description?: string | null;
          file_size?: number | null;
          storage_path?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tour_slug?: string;
          pdf_url?: string;
          pdf_type?: 'booking' | 'itinerary' | 'terms' | 'brochure';
          title?: string;
          description?: string | null;
          file_size?: number | null;
          storage_path?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      homepage_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: Record<string, unknown>;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value: Record<string, unknown>;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          setting_key?: string;
          setting_value?: Record<string, unknown>;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
