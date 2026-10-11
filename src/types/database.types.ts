// Tipos escritos à mão para bater com supabase/schema.sql.
// Depois que o projeto Supabase estiver criado, rode `npm run types:generate`
// (com SUPABASE_PROJECT_ID no ambiente) para substituir este arquivo pelo real.

export type TaskStatus = 'pending' | 'done' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type GoalStatus = 'active' | 'paused' | 'done' | 'abandoned';
export type AiMessageRole = 'user' | 'assistant' | 'system';
export type IntegrationProvider = 'harmony_hub';
export type IntegrationStatus = 'pending' | 'connected' | 'revoked' | 'error';

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          due_time: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency: HabitFrequency;
          target_days_per_week: number | null;
          color: string;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          logged_date: string;
          done: boolean;
          note: string | null;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          pinned: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_date: string | null;
          status: GoalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      goal_steps: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          title: string;
          done: boolean;
          order_index: number;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          remind_at: string;
          recurrence_rule: string | null;
          related_task_id: string | null;
          dismissed_at: string | null;
          created_at: string;
          google_event_id: string | null;
          google_calendar_id: string | null;
          google_synced_at: string | null;
          source: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_at: string;
          end_at: string | null;
          all_day: boolean;
          location: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      weekly_plans: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          summary: string | null;
          focus: string | null;
          generated_by_ai: boolean;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          role: AiMessageRole;
          content: string;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };

      routines: {
        Row: { id: string; user_id: string; name: string; created_at: string };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      routine_items: {
        Row: { id: string; routine_id: string; user_id: string; title: string; order_index: number; created_at: string };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      routine_settings: {
        Row: { user_id: string; day_start: string; day_end: string; updated_at: string };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      routine_activities: {
        Row: { id: string; user_id: string; title: string; duration_minutes: number; fixed_start: string | null; days_of_week: number[]; kind: 'daily' | 'task'; active: boolean; created_at: string };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      google_calendar_connections: {
        Row: { id: string; user_id: string; calendar_id: string; google_email: string | null; access_token_encrypted: string | null; refresh_token_encrypted: string; expires_at: string | null; created_at: string; updated_at: string };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      integrations: {
        Row: { id: string; user_id: string; provider: IntegrationProvider; status: IntegrationStatus; external_account_id: string | null; metadata: Record<string, unknown>; connected_at: string | null; created_at: string; updated_at: string };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      integration_permissions: {
        Row: { id: string; integration_id: string; user_id: string; scope: string; granted_at: string; revoked_at: string | null };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      task_status: TaskStatus;
      task_priority: TaskPriority;
      habit_frequency: HabitFrequency;
      goal_status: GoalStatus;
      ai_message_role: AiMessageRole;
      integration_provider: IntegrationProvider;
      integration_status: IntegrationStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
