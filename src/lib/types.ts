// Unified types used across the app

export interface Subtask {
  id: string; // Unique ID for the subtask (uuid on client is fine)
  title: string;
  is_completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date; // Always handled as Date in the UI layer
  completed: boolean;

  // Server-related/meta
  user_id?: string;
  created_at?: string;
  updated_at?: string;

  // Features
  categoryId?: string; // Local mapping of category_id
  category_name?: string; // Joined category name for display
  urgency?: number; // 0..3
  subtasks?: Subtask[] | null;
  is_pinned?: boolean;
  recurrence_rule?: string | null;
}

export interface TaskGroup {
  date: string;
  tasks: Task[];
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  logo: string; // Lucide icon name or URL
  created_at?: string;
}

export interface Profile {
  id: string;
  is_premium?: boolean;
  enable_subtasks?: boolean;
  enable_smart_recurrence?: boolean;
  enable_pinned_tasks?: boolean;
  default_layout?: string;
}
