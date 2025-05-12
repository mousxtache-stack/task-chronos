import { Task } from "@/lib/types";
import { Check, Trash2, BookOpen, PencilIcon, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLayout } from "@/lib/context/LayoutContext";
import { EditTaskDialog } from "./EditTaskDialog";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description: string, date: Date, isHomework: boolean) => void;
}

export function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {
  const { layoutMode } = useLayout();
  const isGridMode = layoutMode === "grid";
  const [showControls, setShowControls] = useState(false);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <div className={cn(
      "task-card slide-in",
      isGridMode && "block w-full h-auto max-w-xl mx-auto",
      task.completed && "opacity-50",
      task.isHomework && "border-l-4 border-blue-500"
    )}>
      <div className={cn(
        isGridMode ? "block" : "flex items-start justify-between gap-2"
      )}>
        <div className={cn(isGridMode ? "mb-4" : "flex-1")}> 
          <div className="flex items-center gap-2 mb-2">
            {task.isHomework && (
              <BookOpen size={isGridMode ? 22 : 16} className="text-blue-500" />
            )}
            <h3 className={cn(
              "font-medium",
              task.completed && "line-through",
              isGridMode && "task-title text-lg"
            )}>
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className={cn(
              "text-sm text-muted-foreground mt-1",
              task.completed && "line-through",
              isGridMode && "task-description text-base"
            )}>
              {task.description}
            </p>
          )}
          {task.isHomework && (
            <span className={cn(
              "text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mt-2 inline-block",
              isGridMode && "task-badge"
            )}>
              Devoir
            </span>
          )}
        </div>
        <div className={cn(
          isGridMode ? "flex items-center gap-2" : "flex items-center gap-2",
          "justify-end"
        )}>
          {/* Le bouton compléter est toujours affiché */}
          <button
            onClick={() => onComplete(task.id)}
            className={cn(
              "p-1 rounded-full hover:bg-secondary transition-colors",
              isGridMode && "p-2"
            )}
          >
            <Check
              size={isGridMode ? 22 : 16}
              className={cn(
                task.completed ? "text-primary" : "text-muted-foreground"
              )}
            />
          </button>
          
          {/* Bouton œil pour contrôler la visibilité - déplacé après le bouton "fait" */}
          <button
            onClick={toggleControls}
            className={cn(
              "p-1 rounded-full hover:bg-secondary transition-colors",
              isGridMode && "p-2"
            )}
          >
            {showControls ? (
              <Eye
                size={isGridMode ? 22 : 16}
                className="text-blue-500"
              />
            ) : (
              <EyeOff
                size={isGridMode ? 22 : 16}
                className="text-gray-400"
              />
            )}
          </button>
          
          {/* Afficher conditionnellement les boutons d'édition et de suppression avec effet blur et translation */}
          <div className={cn(
            "flex transition-all duration-300 transform",
            showControls 
              ? "opacity-100 blur-none translate-x-0" 
              : "opacity-0 w-0 overflow-hidden blur-sm -translate-x-4"
          )}>
            <EditTaskDialog 
              task={task}
              onEdit={onEdit}
              trigger={
                <button
                  className={cn(
                    "p-1 rounded-full hover:bg-secondary transition-colors",
                    isGridMode && "p-2"
                  )}
                >
                  <PencilIcon
                    size={isGridMode ? 22 : 16}
                    className="text-amber-500"
                  />
                </button>
              }
            />
            <button
              onClick={() => onDelete(task.id)}
              className={cn(
                "p-1 rounded-full hover:bg-destructive/10 transition-colors",
                isGridMode && "p-2"
              )}
            >
              <Trash2 size={isGridMode ? 22 : 16} className="text-destructive" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}