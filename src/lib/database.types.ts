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

export type FloatingElementType =
  | "sticker"
  | "post-it"
  | "sketch"
  | "note"
  | "image";
export type HabitLogStatus = "done" | "skipped";
export type AttachmentKind = "image" | "audio" | "video";
export type DiaryScope = "monthly" | "weekly" | "daily";
export type MenstrualFlow = "leve" | "medio" | "intenso";
export type PetLogKind = "medicine" | "vaccine" | "bath" | "weight" | "note";
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
          template: string | null;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          template?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          template?: string | null;
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
          color: string | null;
          font_size: number | null;
          font_family: string | null;
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
          color?: string | null;
          font_size?: number | null;
          font_family?: string | null;
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
          color?: string | null;
          font_size?: number | null;
          font_family?: string | null;
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
          detail: string | null;
        };
        Insert: {
          id?: string;
          meal_date?: string;
          name: string;
          done?: boolean;
          detail?: string | null;
        };
        Update: {
          id?: string;
          meal_date?: string;
          name?: string;
          done?: boolean;
          detail?: string | null;
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
      attachments: {
        Row: {
          id: string;
          owner_type: string;
          owner_id: string;
          kind: AttachmentKind;
          url: string;
          storage_path: string | null;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_type: string;
          owner_id: string;
          kind: AttachmentKind;
          url: string;
          storage_path?: string | null;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_type?: string;
          owner_id?: string;
          kind?: AttachmentKind;
          url?: string;
          storage_path?: string | null;
          caption?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      diary_notes: {
        Row: {
          id: string;
          scope: DiaryScope;
          period_key: string;
          field: string;
          content: string | null;
        };
        Insert: {
          id?: string;
          scope: DiaryScope;
          period_key: string;
          field: string;
          content?: string | null;
        };
        Update: {
          id?: string;
          scope?: DiaryScope;
          period_key?: string;
          field?: string;
          content?: string | null;
        };
        Relationships: [];
      };
      diary_tasks: {
        Row: {
          id: string;
          scope: DiaryScope;
          period_key: string;
          content: string;
          done: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          scope: DiaryScope;
          period_key: string;
          content?: string;
          done?: boolean;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          scope?: DiaryScope;
          period_key?: string;
          content?: string;
          done?: boolean;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      health_appointments: {
        Row: {
          id: string;
          specialty: string;
          appt_date: string | null;
          appt_time: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          specialty: string;
          appt_date?: string | null;
          appt_time?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          specialty?: string;
          appt_date?: string | null;
          appt_time?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      health_medications: {
        Row: {
          id: string;
          name: string;
          dosage: string | null;
          purpose: string | null;
          schedule: string | null;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          dosage?: string | null;
          purpose?: string | null;
          schedule?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          dosage?: string | null;
          purpose?: string | null;
          schedule?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      menstrual_cycles: {
        Row: {
          id: string;
          start_date: string;
          end_date: string | null;
          flow: MenstrualFlow | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          start_date: string;
          end_date?: string | null;
          flow?: MenstrualFlow | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          start_date?: string;
          end_date?: string | null;
          flow?: MenstrualFlow | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pets: {
        Row: {
          id: string;
          name: string;
          breed: string | null;
          birth_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          breed?: string | null;
          birth_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          breed?: string | null;
          birth_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pet_logs: {
        Row: {
          id: string;
          pet_id: string;
          kind: PetLogKind;
          log_date: string;
          detail: string | null;
          value: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          kind: PetLogKind;
          log_date?: string;
          detail?: string | null;
          value?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          kind?: PetLogKind;
          log_date?: string;
          detail?: string | null;
          value?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pet_logs_pet_id_fkey";
            columns: ["pet_id"];
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      entry_fields: {
        Row: {
          id: string;
          entry_id: string;
          field: string;
          value: string | null;
        };
        Insert: {
          id?: string;
          entry_id: string;
          field: string;
          value?: string | null;
        };
        Update: {
          id?: string;
          entry_id?: string;
          field?: string;
          value?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "entry_fields_entry_id_fkey";
            columns: ["entry_id"];
            referencedRelation: "commonplace_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      financial_goals: {
        Row: {
          id: string;
          title: string;
          target_amount: number;
          saved_amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          target_amount?: number;
          saved_amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          target_amount?: number;
          saved_amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          name: string;
          limit_amount: number;
          spent_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          limit_amount?: number;
          spent_amount?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          limit_amount?: number;
          spent_amount?: number;
          created_at?: string;
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
export type Attachment = Database["public"]["Tables"]["attachments"]["Row"];
export type DiaryNote = Database["public"]["Tables"]["diary_notes"]["Row"];
export type DiaryTask = Database["public"]["Tables"]["diary_tasks"]["Row"];
export type HealthAppointment =
  Database["public"]["Tables"]["health_appointments"]["Row"];
export type HealthMedication =
  Database["public"]["Tables"]["health_medications"]["Row"];
export type MenstrualCycle =
  Database["public"]["Tables"]["menstrual_cycles"]["Row"];
export type EntryField =
  Database["public"]["Tables"]["entry_fields"]["Row"];
export type Pet = Database["public"]["Tables"]["pets"]["Row"];
export type PetLog = Database["public"]["Tables"]["pet_logs"]["Row"];
export type FinancialGoal =
  Database["public"]["Tables"]["financial_goals"]["Row"];
export type Budget = Database["public"]["Tables"]["budgets"]["Row"];
