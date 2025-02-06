import { Task } from "@/lib/types";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  return (
    <div className={cn("task-card slide-in", task.completed && "opacity-50")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className={cn("font-medium", task.completed && "line-through")}>
            {task.title}
          </h3>
          {task.description && (
            <p className={cn("text-sm text-muted-foreground mt-1", task.completed && "line-through")}>
              {task.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onComplete(task.id)}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <Check
              size={16}
              className={cn(
                task.completed ? "text-primary" : "text-muted-foreground"
              )}
            />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
}