export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          address_city: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          avatar_url: string | null
          bio: string | null
          email: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          category: Database["public"]["Enums"]["tool_category"]
          tool_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["tool_category"]
          tool_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["tool_category"]
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_categories_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_requests: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string
          requester_id: string | null
          return_date: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          tool_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          requester_id?: string | null
          return_date?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          tool_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          requester_id?: string | null
          return_date?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          tool_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_requests_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          brand: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          maintenance_notes: string | null
          model: string | null
          name: string
          owner_id: string
          purchase_date: string | null
          status: Database["public"]["Enums"]["tool_status"]
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          maintenance_notes?: string | null
          model?: string | null
          name: string
          owner_id: string
          purchase_date?: string | null
          status?: Database["public"]["Enums"]["tool_status"]
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          maintenance_notes?: string | null
          model?: string | null
          name?: string
          owner_id?: string
          purchase_date?: string | null
          status?: Database["public"]["Enums"]["tool_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_borrowing_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      get_user_lending_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      request_status: "pending" | "approved" | "rejected" | "returned"
      tool_category:
        | "Kids"
        | "Music"
        | "Electronics"
        | "Exercise"
        | "Emergency"
        | "Household"
        | "Gardening"
        | "Tools"
        | "Kitchen"
        | "Other"
        | "Games"
        | "Outdoors"
      tool_status: "available" | "requested" | "checked_out"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
