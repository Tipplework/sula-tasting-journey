export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      consent_logs: {
        Row: {
          browser_language: string | null
          consent_version: string
          created_at: string
          device_type: string | null
          flight_id: string | null
          guest_name: string | null
          hashed_ip: string | null
          id: string
          metadata: Json
          privacy_version: string
          session_id: string | null
          source: string
          user_agent: string | null
        }
        Insert: {
          browser_language?: string | null
          consent_version: string
          created_at?: string
          device_type?: string | null
          flight_id?: string | null
          guest_name?: string | null
          hashed_ip?: string | null
          id?: string
          metadata?: Json
          privacy_version: string
          session_id?: string | null
          source?: string
          user_agent?: string | null
        }
        Update: {
          browser_language?: string | null
          consent_version?: string
          created_at?: string
          device_type?: string | null
          flight_id?: string | null
          guest_name?: string | null
          hashed_ip?: string | null
          id?: string
          metadata?: Json
          privacy_version?: string
          session_id?: string | null
          source?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      content_analytics: {
        Row: {
          content_item_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_index: number | null
          page_slug: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          content_item_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_index?: number | null
          page_slug?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          content_item_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_index?: number | null
          page_slug?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_assets: {
        Row: {
          alt_text: string | null
          asset_type: Database["public"]["Enums"]["asset_type"]
          caption: string | null
          content_item_id: string
          created_at: string
          file_url: string
          height: number | null
          id: string
          sort_order: number
          thumbnail_url: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          asset_type: Database["public"]["Enums"]["asset_type"]
          caption?: string | null
          content_item_id: string
          created_at?: string
          file_url: string
          height?: number | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          asset_type?: Database["public"]["Enums"]["asset_type"]
          caption?: string | null
          content_item_id?: string
          created_at?: string
          file_url?: string
          height?: number | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_assets_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          category: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          description: string | null
          featured: boolean
          id: string
          og_image_url: string | null
          page_count: number
          primary_file_url: string | null
          published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
          video_provider: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          og_image_url?: string | null
          page_count?: number
          primary_file_url?: string | null
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          video_provider?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          og_image_url?: string | null
          page_count?: number
          primary_file_url?: string | null
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_provider?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      deletion_requests: {
        Row: {
          contact: string
          created_at: string
          guest_name: string | null
          id: string
          notes: string | null
          processed_at: string | null
          request_type: string
          status: string
          updated_at: string
        }
        Insert: {
          contact: string
          created_at?: string
          guest_name?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          request_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact?: string
          created_at?: string
          guest_name?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          request_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          enabled: boolean
          id: string
          image_url: string | null
          item_slugs: string[]
          section_type: string
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          enabled?: boolean
          id?: string
          image_url?: string | null
          item_slugs?: string[]
          section_type?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          enabled?: boolean
          id?: string
          image_url?: string | null
          item_slugs?: string[]
          section_type?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      privacy_notice_versions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          sections: Json
          updated_at: string
          version: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          sections?: Json
          updated_at?: string
          version: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          sections?: Json
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          hero_cta_label: string | null
          hero_cta_url: string | null
          hero_eyebrow: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          singleton: boolean
          updated_at: string
        }
        Insert: {
          hero_cta_label?: string | null
          hero_cta_url?: string | null
          hero_eyebrow?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          hero_cta_label?: string | null
          hero_cta_url?: string | null
          hero_eyebrow?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      asset_type: "page_image" | "gallery_image" | "thumbnail" | "download"
      content_type: "pdf" | "video" | "gallery"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      asset_type: ["page_image", "gallery_image", "thumbnail", "download"],
      content_type: ["pdf", "video", "gallery"],
    },
  },
} as const
