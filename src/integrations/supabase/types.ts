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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      crowd_samples: {
        Row: {
          id: string
          place_id: string
          place_name: string
          count: number
          status: 'Green' | 'Yellow' | 'Red'
          captured_at: string
          date: string
          day_of_week: string
        }
        Insert: {
          id?: string
          place_id: string
          place_name: string
          count: number
          status: 'Green' | 'Yellow' | 'Red'
          captured_at?: string
          // generated columns omitted on insert
        }
        Update: {
          id?: string
          place_id?: string
          place_name?: string
          count?: number
          status?: 'Green' | 'Yellow' | 'Red'
          captured_at?: string
        }
        Relationships: []
      }
      camera_sources: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string | null
          location: string
          name: string
          peer_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string | null
          location: string
          name: string
          peer_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string | null
          location?: string
          name?: string
          peer_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          alert_id: string
          created_at: string
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          message: string | null
          name: string
          phone_number: string
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          alert_id: string
          created_at?: string
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          message?: string | null
          name: string
          phone_number: string
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          alert_id?: string
          created_at?: string
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          message?: string | null
          name?: string
          phone_number?: string
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      found_person_reports: {
        Row: {
          age: number | null
          category: string | null
          clothing: string | null
          created_at: string
          found_location: string
          found_time: string
          gender: string | null
          id: string
          matched_with_report_id: string | null
          name: string | null
          notes: string | null
          photo: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          category?: string | null
          clothing?: string | null
          created_at?: string
          found_location: string
          found_time: string
          gender?: string | null
          id?: string
          matched_with_report_id?: string | null
          name?: string | null
          notes?: string | null
          photo?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          category?: string | null
          clothing?: string | null
          created_at?: string
          found_location?: string
          found_time?: string
          gender?: string | null
          id?: string
          matched_with_report_id?: string | null
          name?: string | null
          notes?: string | null
          photo?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lost_person_reports: {
        Row: {
          age: number
          authority_assigned_at: string | null
          authority_id: string | null
          authority_name: string | null
          authority_phone: string | null
          category: string | null
          clothing: string
          created_at: string
          found_by: string | null
          gender: string
          id: string
          last_seen_location: string
          last_seen_time: string
          name: string
          notes: string | null
          photo: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age: number
          authority_assigned_at?: string | null
          authority_id?: string | null
          authority_name?: string | null
          authority_phone?: string | null
          category?: string | null
          clothing: string
          created_at?: string
          found_by?: string | null
          gender: string
          id?: string
          last_seen_location: string
          last_seen_time: string
          name: string
          notes?: string | null
          photo?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          authority_assigned_at?: string | null
          authority_id?: string | null
          authority_name?: string | null
          authority_phone?: string | null
          category?: string | null
          clothing?: string
          created_at?: string
          found_by?: string | null
          gender?: string
          id?: string
          last_seen_location?: string
          last_seen_time?: string
          name?: string
          notes?: string | null
          photo?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone_number: string | null
          preferred_language: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone_number?: string | null
          preferred_language?: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          preferred_language?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          report_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          report_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          report_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_chat_messages_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "lost_person_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      screen_displays: {
        Row: {
          created_at: string
          id: string
          report_id: string | null
          screen_id: string
          screen_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_id?: string | null
          screen_id: string
          screen_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          report_id?: string | null
          screen_id?: string
          screen_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "screen_displays_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "lost_person_reports"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_alert_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
