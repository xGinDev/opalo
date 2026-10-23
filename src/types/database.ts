// Hand-written from supabase/migrations (0001–0004) in the `supabase gen types typescript` format.
// Regenerate with `pnpm db:types` after `supabase login`; the output should be equivalent.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string;
          admin_id: string | null;
          created_at: string;
          details: Json | null;
          id: number;
          target_profile_id: string | null;
        };
        Insert: {
          action: string;
          admin_id?: string | null;
          created_at?: string;
          details?: Json | null;
          id?: number;
          target_profile_id?: string | null;
        };
        Update: {
          action?: string;
          admin_id?: string | null;
          created_at?: string;
          details?: Json | null;
          id?: number;
          target_profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_actions_target_profile_id_fkey";
            columns: ["target_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      badges: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: number;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: number;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: number;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      link_clicks: {
        Row: {
          clicked_at: string;
          id: number;
          link_id: string | null;
          profile_id: string;
          visitor_hash: string | null;
        };
        Insert: {
          clicked_at?: string;
          id?: number;
          link_id?: string | null;
          profile_id: string;
          visitor_hash?: string | null;
        };
        Update: {
          clicked_at?: string;
          id?: number;
          link_id?: string | null;
          profile_id?: string;
          visitor_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "social_links";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "link_clicks_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          id: string;
          paid_at: string | null;
          profile_id: string;
          provider: string;
          provider_payment_id: string;
          raw: Json | null;
          refunded_at: string | null;
          status: Database["public"]["Enums"]["payment_status"];
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          currency?: string;
          id?: string;
          paid_at?: string | null;
          profile_id: string;
          provider: string;
          provider_payment_id: string;
          raw?: Json | null;
          refunded_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          paid_at?: string | null;
          profile_id?: string;
          provider?: string;
          provider_payment_id?: string;
          raw?: Json | null;
          refunded_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
        };
        Relationships: [
          {
            foreignKeyName: "payments_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_badges: {
        Row: {
          badge_id: number;
          granted_at: string;
          granted_by: string | null;
          profile_id: string;
        };
        Insert: {
          badge_id: number;
          granted_at?: string;
          granted_by?: string | null;
          profile_id: string;
        };
        Update: {
          badge_id?: number;
          granted_at?: string;
          granted_by?: string | null;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_badges_badge_id_fkey";
            columns: ["badge_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_badges_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_badges_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_settings: {
        Row: {
          accent_color: string;
          bg_blur: number;
          bg_color: string;
          bg_kind: Database["public"]["Enums"]["bg_kind"];
          bg_url: string | null;
          card_border: boolean;
          card_opacity: number;
          cursor_trail: boolean;
          enter_text: string | null;
          favicon_url: string | null;
          layout: Database["public"]["Enums"]["layout_type"];
          music_title: string | null;
          music_url: string | null;
          name_effect: Database["public"]["Enums"]["name_fx"];
          name_font: string;
          particles: Database["public"]["Enums"]["particle_kind"];
          presence_text: string | null;
          profile_id: string;
          show_badges: boolean;
          show_branding: boolean;
          show_location: boolean;
          show_online: boolean;
          show_player: boolean;
          show_presence: boolean;
          tab_title: string | null;
          tab_title_animated: boolean;
          tilt_3d: boolean;
          updated_at: string;
        };
        Insert: {
          accent_color?: string;
          bg_blur?: number;
          bg_color?: string;
          bg_kind?: Database["public"]["Enums"]["bg_kind"];
          bg_url?: string | null;
          card_border?: boolean;
          card_opacity?: number;
          cursor_trail?: boolean;
          enter_text?: string | null;
          favicon_url?: string | null;
          layout?: Database["public"]["Enums"]["layout_type"];
          music_title?: string | null;
          music_url?: string | null;
          name_effect?: Database["public"]["Enums"]["name_fx"];
          name_font?: string;
          particles?: Database["public"]["Enums"]["particle_kind"];
          presence_text?: string | null;
          profile_id: string;
          show_badges?: boolean;
          show_branding?: boolean;
          show_location?: boolean;
          show_online?: boolean;
          show_player?: boolean;
          show_presence?: boolean;
          tab_title?: string | null;
          tab_title_animated?: boolean;
          tilt_3d?: boolean;
          updated_at?: string;
        };
        Update: {
          accent_color?: string;
          bg_blur?: number;
          bg_color?: string;
          bg_kind?: Database["public"]["Enums"]["bg_kind"];
          bg_url?: string | null;
          card_border?: boolean;
          card_opacity?: number;
          cursor_trail?: boolean;
          enter_text?: string | null;
          favicon_url?: string | null;
          layout?: Database["public"]["Enums"]["layout_type"];
          music_title?: string | null;
          music_url?: string | null;
          name_effect?: Database["public"]["Enums"]["name_fx"];
          name_font?: string;
          particles?: Database["public"]["Enums"]["particle_kind"];
          presence_text?: string | null;
          profile_id?: string;
          show_badges?: boolean;
          show_branding?: boolean;
          show_location?: boolean;
          show_online?: boolean;
          show_player?: boolean;
          show_presence?: boolean;
          tab_title?: string | null;
          tab_title_animated?: boolean;
          tilt_3d?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_settings_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_stats: {
        Row: {
          clicks: number;
          profile_id: string;
          views: number;
        };
        Insert: {
          clicks?: number;
          profile_id: string;
          views?: number;
        };
        Update: {
          clicks?: number;
          profile_id?: string;
          views?: number;
        };
        Relationships: [
          {
            foreignKeyName: "profile_stats_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_views: {
        Row: {
          country: string | null;
          id: number;
          profile_id: string;
          referrer: string | null;
          viewed_at: string;
          visitor_hash: string | null;
        };
        Insert: {
          country?: string | null;
          id?: number;
          profile_id: string;
          referrer?: string | null;
          viewed_at?: string;
          visitor_hash?: string | null;
        };
        Update: {
          country?: string | null;
          id?: number;
          profile_id?: string;
          referrer?: string | null;
          viewed_at?: string;
          visitor_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          location: string | null;
          plan: Database["public"]["Enums"]["plan_type"];
          premium_since: string | null;
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["account_status"];
          updated_at: string;
          username: string;
          username_changed_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          location?: string | null;
          plan?: Database["public"]["Enums"]["plan_type"];
          premium_since?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["account_status"];
          updated_at?: string;
          username: string;
          username_changed_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          location?: string | null;
          plan?: Database["public"]["Enums"]["plan_type"];
          premium_since?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["account_status"];
          updated_at?: string;
          username?: string;
          username_changed_at?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          reason: string;
          reported_profile_id: string;
          reporter_id: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          status: Database["public"]["Enums"]["report_status"];
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason: string;
          reported_profile_id: string;
          reporter_id?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason?: string;
          reported_profile_id?: string;
          reporter_id?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
        };
        Relationships: [
          {
            foreignKeyName: "reports_reported_profile_id_fkey";
            columns: ["reported_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reserved_usernames: {
        Row: {
          username: string;
        };
        Insert: {
          username: string;
        };
        Update: {
          username?: string;
        };
        Relationships: [];
      };
      social_links: {
        Row: {
          created_at: string;
          enabled: boolean;
          id: string;
          platform: string;
          position: number;
          profile_id: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          id?: string;
          platform: string;
          position?: number;
          profile_id: string;
          value: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          id?: string;
          platform?: string;
          position?: number;
          profile_id?: string;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_links_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      username_history: {
        Row: {
          available_at: string;
          profile_id: string | null;
          username: string;
        };
        Insert: {
          available_at: string;
          profile_id?: string | null;
          username: string;
        };
        Update: {
          available_at?: string;
          profile_id?: string | null;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "username_history_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_overview: { Args: { p_days?: number }; Returns: Json };
      admin_resolve_reports: {
        Args: { p_action: string; p_profile: string };
        Returns: undefined;
      };
      admin_set_plan: {
        Args: {
          p_note?: string;
          p_plan: Database["public"]["Enums"]["plan_type"];
          p_profile: string;
        };
        Returns: undefined;
      };
      admin_set_status: {
        Args: {
          p_note?: string;
          p_profile: string;
          p_status: Database["public"]["Enums"]["account_status"];
        };
        Returns: undefined;
      };
      check_username: { Args: { p_username: string }; Returns: boolean };
      get_my_link_stats: {
        Args: { p_days?: number };
        Returns: {
          clicks: number;
          link_id: string;
          platform: string;
        }[];
      };
      get_my_stats: {
        Args: { p_days?: number };
        Returns: {
          clicks: number;
          day: string;
          views: number;
        }[];
      };
      get_public_profile: { Args: { p_username: string }; Returns: Json };
      is_admin: { Args: never; Returns: boolean };
      is_privileged: { Args: never; Returns: boolean };
      is_valid_username: { Args: { p: string }; Returns: boolean };
      normalize_username: { Args: { p: string }; Returns: string };
      register_click: {
        Args: { p_link_id: string; p_visitor_hash?: string };
        Returns: undefined;
      };
      register_view: {
        Args: {
          p_country?: string;
          p_referrer?: string;
          p_username: string;
          p_visitor_hash?: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      account_status: "active" | "reported" | "suspended";
      bg_kind: "color" | "image" | "video";
      layout_type: "card" | "center";
      name_fx: "glow" | "sparkle" | "rainbow" | "none";
      particle_kind: "stars" | "rain" | "snow" | "petals" | "none";
      payment_status: "pending" | "paid" | "refunded" | "failed";
      plan_type: "free" | "premium";
      report_status: "open" | "dismissed" | "actioned";
      user_role: "user" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "reported", "suspended"],
      bg_kind: ["color", "image", "video"],
      layout_type: ["card", "center"],
      name_fx: ["glow", "sparkle", "rainbow", "none"],
      particle_kind: ["stars", "rain", "snow", "petals", "none"],
      payment_status: ["pending", "paid", "refunded", "failed"],
      plan_type: ["free", "premium"],
      report_status: ["open", "dismissed", "actioned"],
      user_role: ["user", "admin"],
    },
  },
} as const;
