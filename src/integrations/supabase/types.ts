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
      achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          created_at: string
          current_value: number | null
          id: string
          is_claimed: boolean | null
          is_completed: boolean | null
          reward_amount: number | null
          reward_type: string | null
          target_value: number | null
          unlock_timer: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          created_at?: string
          current_value?: number | null
          id?: string
          is_claimed?: boolean | null
          is_completed?: boolean | null
          reward_amount?: number | null
          reward_type?: string | null
          target_value?: number | null
          unlock_timer?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          created_at?: string
          current_value?: number | null
          id?: string
          is_claimed?: boolean | null
          is_completed?: boolean | null
          reward_amount?: number | null
          reward_type?: string | null
          target_value?: number | null
          unlock_timer?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          card_name: string
          card_type: string
          created_at: string
          id: string
          level: number | null
          mining_bonus: number | null
          price_coins: number | null
          price_stars: number | null
          price_ton: number | null
          unlock_timer: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_name: string
          card_type: string
          created_at?: string
          id?: string
          level?: number | null
          mining_bonus?: number | null
          price_coins?: number | null
          price_stars?: number | null
          price_ton?: number | null
          unlock_timer?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_name?: string
          card_type?: string
          created_at?: string
          id?: string
          level?: number | null
          mining_bonus?: number | null
          price_coins?: number | null
          price_stars?: number | null
          price_ton?: number | null
          unlock_timer?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_missions: {
        Row: {
          created_at: string
          current_value: number | null
          id: string
          is_claimed: boolean | null
          is_completed: boolean | null
          mission_name: string
          mission_type: string
          reward_amount: number | null
          reward_type: string | null
          target_value: number | null
          unlock_timer: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          id?: string
          is_claimed?: boolean | null
          is_completed?: boolean | null
          mission_name: string
          mission_type: string
          reward_amount?: number | null
          reward_type?: string | null
          target_value?: number | null
          unlock_timer?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          id?: string
          is_claimed?: boolean | null
          is_completed?: boolean | null
          mission_name?: string
          mission_type?: string
          reward_amount?: number | null
          reward_type?: string | null
          target_value?: number | null
          unlock_timer?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_rewards: {
        Row: {
          created_at: string
          current_day: number | null
          day: number
          id: string
          is_claimed: boolean | null
          last_claim_date: string | null
          reward_amount: number | null
          reward_type: string | null
          streak_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_day?: number | null
          day: number
          id?: string
          is_claimed?: boolean | null
          last_claim_date?: string | null
          reward_amount?: number | null
          reward_type?: string | null
          streak_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_day?: number | null
          day?: number
          id?: string
          is_claimed?: boolean | null
          last_claim_date?: string | null
          reward_amount?: number | null
          reward_type?: string | null
          streak_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      floating_cards: {
        Row: {
          card_name: string
          created_at: string
          id: string
          is_claimed: boolean | null
          is_unlocked: boolean | null
          position: number
          price_ton: number | null
          purchase_date: string | null
          reward_amount: number | null
          reward_type: string | null
          unlock_requirements: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_name: string
          created_at?: string
          id?: string
          is_claimed?: boolean | null
          is_unlocked?: boolean | null
          position: number
          price_ton?: number | null
          purchase_date?: string | null
          reward_amount?: number | null
          reward_type?: string | null
          unlock_requirements?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_name?: string
          created_at?: string
          id?: string
          is_claimed?: boolean | null
          is_unlocked?: boolean | null
          position?: number
          price_ton?: number | null
          purchase_date?: string | null
          reward_amount?: number | null
          reward_type?: string | null
          unlock_requirements?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "floating_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          referral_code: string | null
          referred_by: string | null
          telegram_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          referral_code?: string | null
          referred_by?: string | null
          telegram_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string | null
          referred_by?: string | null
          telegram_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          reward_claimed: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          reward_claimed?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_claimed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_wheel: {
        Row: {
          created_at: string
          id: string
          last_spin: string | null
          spins_used: number | null
          total_rewards_claimed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_spin?: string | null
          spins_used?: number | null
          total_rewards_claimed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_spin?: string | null
          spins_used?: number | null
          total_rewards_claimed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_wheel_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_items: {
        Row: {
          base_price_stars: number | null
          base_price_ton: number | null
          created_at: string
          current_price_stars: number | null
          current_price_ton: number | null
          id: string
          item_name: string
          item_type: string
          purchase_count: number | null
          unlock_timer: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price_stars?: number | null
          base_price_ton?: number | null
          created_at?: string
          current_price_stars?: number | null
          current_price_ton?: number | null
          id?: string
          item_name: string
          item_type: string
          purchase_count?: number | null
          unlock_timer?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price_stars?: number | null
          base_price_ton?: number | null
          created_at?: string
          current_price_stars?: number | null
          current_price_ton?: number | null
          id?: string
          item_name?: string
          item_type?: string
          purchase_count?: number | null
          unlock_timer?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stats: {
        Row: {
          coins: number | null
          created_at: string
          energy: number | null
          id: string
          last_energy_update: string | null
          level: number | null
          max_energy: number | null
          mining_rate: number | null
          spins: number | null
          stars: number | null
          ton_balance: number | null
          updated_at: string
          user_id: string
          xp: number | null
        }
        Insert: {
          coins?: number | null
          created_at?: string
          energy?: number | null
          id?: string
          last_energy_update?: string | null
          level?: number | null
          max_energy?: number | null
          mining_rate?: number | null
          spins?: number | null
          stars?: number | null
          ton_balance?: number | null
          updated_at?: string
          user_id: string
          xp?: number | null
        }
        Update: {
          coins?: number | null
          created_at?: string
          energy?: number | null
          id?: string
          last_energy_update?: string | null
          level?: number | null
          max_energy?: number | null
          mining_rate?: number | null
          spins?: number | null
          stars?: number | null
          ton_balance?: number | null
          updated_at?: string
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          referral_code: string | null
          referred_by: string | null
          telegram_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code?: string | null
          referred_by?: string | null
          telegram_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string | null
          referred_by?: string | null
          telegram_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
