// Tipos escritos à mão para bater com supabase/schema.sql.
// Depois que o projeto Supabase estiver criado, rode `npm run types:generate`
// (com SUPABASE_PROJECT_ID no ambiente) para substituir este arquivo pelo real.

export type TaskStatus = 'pending' | 'done' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type GoalStatus = 'active' | 'paused' | 'done' | 'abandoned';
export type AiMessageRole = 'user' | 'assistant' | 'system';

export interface Database {
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
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
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
        Insert: Partial<Database['public']['Tables']['tasks']['Row']> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['tasks']['Row']>;
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
        Insert: Partial<Database['public']['Tables']['habits']['Row']> & {
          user_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['habits']['Row']>;
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
        Insert: Partial<Database['public']['Tables']['habit_logs']['Row']> & {
          habit_id: string;
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['habit_logs']['Row']>;
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
        Insert: Partial<Database['public']['Tables']['notes']['Row']> & { user_id: string };
        Update: Partial<Database['public']['Tables']['notes']['Row']>;
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
        Insert: Partial<Database['public']['Tables']['goals']['Row']> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['goals']['Row']>;
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
        Insert: Partial<Database['public']['Tables']['goal_steps']['Row']> & {
          goal_id: string;
          user_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['goal_steps']['Row']>;
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
        };
        Insert: Partial<Database['public']['Tables']['reminders']['Row']> & {
          user_id: string;
          title: string;
          remind_at: string;
        };
        Update: Partial<Database['public']['Tables']['reminders']['Row']>;
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
        Insert: Partial<Database['public']['Tables']['calendar_events']['Row']> & {
          user_id: string;
          title: string;
          start_at: string;
        };
        Update: Partial<Database['public']['Tables']['calendar_events']['Row']>;
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
        Insert: Partial<Database['public']['Tables']['weekly_plans']['Row']> & {
          user_id: string;
          week_start_date: string;
        };
        Update: Partial<Database['public']['Tables']['weekly_plans']['Row']>;
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
        Insert: Partial<Database['public']['Tables']['ai_conversations']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['ai_conversations']['Row']>;
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
        Insert: Partial<Database['public']['Tables']['ai_messages']['Row']> & {
          conversation_id: string;
          user_id: string;
          role: AiMessageRole;
          content: string;
        };
        Update: Partial<Database['public']['Tables']['ai_messages']['Row']>;
        Relationships: [];
      };
    };
  };
}
