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
          achievement_id: string
          claimed: boolean | null
          claimed_at: string | null
          created_at: string | null
          id: string
          progress: number | null
          target: number | null
          unlocked: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id: string
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          unlocked?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          unlocked?: boolean | null
          updated_at?: string | null
          user_id?: string | null
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
      boosters: {
        Row: {
          active: boolean | null
          booster_type: string
          created_at: string | null
          end_time: string | null
          id: string
          multiplier: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          booster_type: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          multiplier?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          booster_type?: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          multiplier?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boosters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      card_timers: {
        Row: {
          card_id: number
          completed_at: string | null
          created_at: string
          duration_hours: number
          id: string
          payment_amount: number | null
          payment_currency: string | null
          skipped_with_payment: boolean | null
          started_at: string
          user_id: string
        }
        Insert: {
          card_id: number
          completed_at?: string | null
          created_at?: string
          duration_hours?: number
          id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          skipped_with_payment?: boolean | null
          started_at?: string
          user_id: string
        }
        Update: {
          card_id?: number
          completed_at?: string | null
          created_at?: string
          duration_hours?: number
          id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          skipped_with_payment?: boolean | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          card_id: number
          click_boost: number | null
          created_at: string | null
          id: string
          is_locked: boolean | null
          level: number | null
          mining_boost: number | null
          owned: boolean | null
          type: string | null
          updated_at: string | null
          upgrade_time_remaining: string | null
          user_id: string | null
        }
        Insert: {
          card_id: number
          click_boost?: number | null
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          level?: number | null
          mining_boost?: number | null
          owned?: boolean | null
          type?: string | null
          updated_at?: string | null
          upgrade_time_remaining?: string | null
          user_id?: string | null
        }
        Update: {
          card_id?: number
          click_boost?: number | null
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          level?: number | null
          mining_boost?: number | null
          owned?: boolean | null
          type?: string | null
          updated_at?: string | null
          upgrade_time_remaining?: string | null
          user_id?: string | null
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
          claimed: boolean | null
          completed: boolean | null
          created_at: string | null
          id: string
          last_reset: string | null
          mission_id: string
          progress: number | null
          target: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          claimed?: boolean | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_reset?: string | null
          mission_id: string
          progress?: number | null
          target?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          claimed?: boolean | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_reset?: string | null
          mission_id?: string
          progress?: number | null
          target?: number | null
          updated_at?: string | null
          user_id?: string | null
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
          claimed_days: number[] | null
          created_at: string | null
          id: string
          last_claim: string | null
          streak: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          claimed_days?: number[] | null
          created_at?: string | null
          id?: string
          last_claim?: string | null
          streak?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          claimed_days?: number[] | null
          created_at?: string | null
          id?: string
          last_claim?: string | null
          streak?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      floating_cards: {
        Row: {
          card_key: string
          cooldown_hours: number | null
          created_at: string | null
          id: string
          last_claimed: string | null
          locked_until: string | null
          reward_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          card_key: string
          cooldown_hours?: number | null
          created_at?: string | null
          id?: string
          last_claimed?: string | null
          locked_until?: string | null
          reward_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_key?: string
          cooldown_hours?: number | null
          created_at?: string | null
          id?: string
          last_claimed?: string | null
          locked_until?: string | null
          reward_type?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      rewards_wheel: {
        Row: {
          created_at: string | null
          id: string
          last_spin: string | null
          next_free_spin: string | null
          spins_available: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_spin?: string | null
          next_free_spin?: string | null
          spins_available?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_spin?: string | null
          next_free_spin?: string | null
          spins_available?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_wheel_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stats: {
        Row: {
          cards_owned: number | null
          click_rate: number | null
          coins: number | null
          created_at: string | null
          energy: number | null
          friends_invited: number | null
          id: string
          last_login: string | null
          mining_rate: number | null
          total_clicks: number | null
          total_coins_earned: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cards_owned?: number | null
          click_rate?: number | null
          coins?: number | null
          created_at?: string | null
          energy?: number | null
          friends_invited?: number | null
          id?: string
          last_login?: string | null
          mining_rate?: number | null
          total_clicks?: number | null
          total_coins_earned?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cards_owned?: number | null
          click_rate?: number | null
          coins?: number | null
          created_at?: string | null
          energy?: number | null
          friends_invited?: number | null
          id?: string
          last_login?: string | null
          mining_rate?: number | null
          total_clicks?: number | null
          total_coins_earned?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          item_id: string | null
          status: string
          telegram_payment_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency: string
          id?: string
          item_id?: string | null
          status?: string
          telegram_payment_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          item_id?: string | null
          status?: string
          telegram_payment_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          connected_at: string
          id: string
          last_balance_update: string | null
          telegram_stars: number | null
          ton_balance: number | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          connected_at?: string
          id?: string
          last_balance_update?: string | null
          telegram_stars?: number | null
          ton_balance?: number | null
          user_id: string
          wallet_address: string
        }
        Update: {
          connected_at?: string
          id?: string
          last_balance_update?: string | null
          telegram_stars?: number | null
          ton_balance?: number | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          level: number | null
          telegram_id: number | null
          ton_balance: number | null
          updated_at: string | null
          username: string | null
          wallet_address: string | null
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number | null
          telegram_id?: number | null
          ton_balance?: number | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number | null
          telegram_id?: number | null
          ton_balance?: number | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
          xp?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_timer_remaining_seconds: {
        Args: { timer_started_at: string; duration_hours: number }
        Returns: number
      }
      initialize_user_data: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      is_timer_expired: {
        Args: { timer_started_at: string; duration_hours: number }
        Returns: boolean
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
