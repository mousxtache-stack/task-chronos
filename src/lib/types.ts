export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  completed: boolean;
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
  isHomework?: boolean;
}

export interface Category { // Assurez-vous que 'export' est présent
  id: string;
  user_id: string;
  name: string;
  logo: string;     // Nom de l'icône Lucide ou URL
  created_at?: string;
}