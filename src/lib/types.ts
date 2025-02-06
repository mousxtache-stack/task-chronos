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