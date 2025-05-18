export interface Subtask {
  id: string; // Un ID unique pour la sous-tâche, peut être généré côté client (uuid)
  title: string;
  is_completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  completed: boolean;
  user_id?: string;
  subtasks?: Subtask[] | null;
  is_pinned?: boolean;
  recurrence_rule?: string | null; // Ex: une chaîne rrule
}

export interface TaskGroup {
  date: string;
  tasks: Task[];
}
export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  completed: boolean;
 // isHomework?: boolean;
 urgence?: number;
}

export interface Category { // Assurez-vous que 'export' est présent
  id: string;
  user_id: string;
  name: string;
  logo: string;     // Nom de l'icône Lucide ou URL
  created_at?: string;
}
export interface Profile {
    id: string;
    is_premium?: boolean;
    enable_subtasks?: boolean;
    enable_smart_recurrence?: boolean;
    enable_pinned_tasks?: boolean;
    // ... autres champs du profil que vous pourriez utiliser
    default_layout?: string;
}