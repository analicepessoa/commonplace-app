/**
 * Tipos do banco de dados (Supabase / PostgreSQL).
 *
 * Espelha o schema definido em
 * `supabase/migrations/20260616_init_schema.sql`.
 *
 * Cada tabela expõe três formatos:
 *  - Row:    linha retornada em SELECT
 *  - Insert: payload aceito em INSERT (campos com default são opcionais)
 *  - Update: payload aceito em UPDATE (tudo opcional)
 *
 * Quando o projeto Supabase estiver conectado, este arquivo pode ser
 * regenerado automaticamente com:
 *   npx supabase gen types typescript --project-id <ID> > src/lib/database.types.ts
 */

export type FloatingElementType = "sticker" | "post-it" | "sketch" | "note";
export type HabitLogStatus = "done" | "skipped";
export type TransactionType = "income" | "expense" | "savings";
export type TransactionStatus = "paid" | "pending";

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          color_hex: string;
        };
        Insert: {
          id?: string;
          name: string;
          color_hex: string;
        };
        Update: {
          id?: string;
          name?: string;
          color_hex?: string;
        };
        Relationships: [];
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      commonplace_entries: {
        Row: {
          id: string;
          subcategory_id: string | null;
          title: string;
          body_content: string | null;
          audio_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subcategory_id?: string | null;
          title: string;
          body_content?: string | null;
          audio_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subcategory_id?: string | null;
          title?: string;
          body_content?: string | null;
          audio_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commonplace_entries_subcategory_id_fkey";
            columns: ["subcategory_id"];
            referencedRelation: "subcategories";
            referencedColumns: ["id"];
          },
        ];
      };
      floating_elements: {
        Row: {
          id: string;
          entry_id: string | null;
          type: FloatingElementType;
          content_data: string | null;
          pos_x: number;
          pos_y: number;
          scale: number;
          rotation: number;
          z_index: number;
          width: number | null;
          height: number | null;
        };
        Insert: {
          id?: string;
          entry_id?: string | null;
          type: FloatingElementType;
          content_data?: string | null;
          pos_x?: number;
          pos_y?: number;
          scale?: number;
          rotation?: number;
          z_index?: number;
          width?: number | null;
          height?: number | null;
        };
        Update: {
          id?: string;
          entry_id?: string | null;
          type?: FloatingElementType;
          content_data?: string | null;
          pos_x?: number;
          pos_y?: number;
          scale?: number;
          rotation?: number;
          z_index?: number;
          width?: number | null;
          height?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "floating_elements_entry_id_fkey";
            columns: ["entry_id"];
            referencedRelation: "commonplace_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          title: string;
          amount: number;
          type: TransactionType;
          due_date: string | null;
          status: TransactionStatus;
          receipt_media_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          amount: number;
          type: TransactionType;
          due_date?: string | null;
          status?: TransactionStatus;
          receipt_media_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          amount?: number;
          type?: TransactionType;
          due_date?: string | null;
          status?: TransactionStatus;
          receipt_media_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          name: string;
          color_hex: string;
          created_at: string;
          days_of_week: number[] | null;
        };
        Insert: {
          id?: string;
          name: string;
          color_hex?: string;
          created_at?: string;
          days_of_week?: number[] | null;
        };
        Update: {
          id?: string;
          name?: string;
          color_hex?: string;
          created_at?: string;
          days_of_week?: number[] | null;
        };
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          log_date: string;
          status: HabitLogStatus;
        };
        Insert: {
          id?: string;
          habit_id: string;
          log_date?: string;
          status?: HabitLogStatus;
        };
        Update: {
          id?: string;
          habit_id?: string;
          log_date?: string;
          status?: HabitLogStatus;
        };
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey";
            columns: ["habit_id"];
            referencedRelation: "habits";
            referencedColumns: ["id"];
          },
        ];
      };
      water_intake: {
        Row: {
          id: string;
          intake_date: string;
          glasses: number;
          goal: number;
        };
        Insert: {
          id?: string;
          intake_date?: string;
          glasses?: number;
          goal?: number;
        };
        Update: {
          id?: string;
          intake_date?: string;
          glasses?: number;
          goal?: number;
        };
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          meal_date: string;
          name: string;
          done: boolean;
        };
        Insert: {
          id?: string;
          meal_date?: string;
          name: string;
          done?: boolean;
        };
        Update: {
          id?: string;
          meal_date?: string;
          name?: string;
          done?: boolean;
        };
        Relationships: [];
      };
      routines: {
        Row: {
          id: string;
          title: string;
          location: string | null;
          start_time: string;
          travel_minutes: number;
          created_at: string;
          days_of_week: number[] | null;
        };
        Insert: {
          id?: string;
          title: string;
          location?: string | null;
          start_time: string;
          travel_minutes?: number;
          created_at?: string;
          days_of_week?: number[] | null;
        };
        Update: {
          id?: string;
          title?: string;
          location?: string | null;
          start_time?: string;
          travel_minutes?: number;
          created_at?: string;
          days_of_week?: number[] | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Atalhos de conveniência para uso na aplicação
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Subcategory = Database["public"]["Tables"]["subcategories"]["Row"];
export type CommonplaceEntry =
  Database["public"]["Tables"]["commonplace_entries"]["Row"];
export type FloatingElement =
  Database["public"]["Tables"]["floating_elements"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];
export type WaterIntake = Database["public"]["Tables"]["water_intake"]["Row"];
export type Meal = Database["public"]["Tables"]["meals"]["Row"];
export type Routine = Database["public"]["Tables"]["routines"]["Row"];
