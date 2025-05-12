// Dans TaskCard.tsx

import { Task } from "@/lib/types";
import { Check, Trash2, BookOpen, PencilIcon, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLayout } from "@/lib/context/LayoutContext";
import { EditTaskDialog } from "./EditTaskDialog";
import { useState } from "react";
import { motion } from "framer-motion";

// ... (interface et autres imports)

export function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {
  const { layoutMode } = useLayout();
  const isGridMode = layoutMode === "grid";
  const [showControls, setShowControls] = useState(false);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: task.completed ? 0.6 : 1, y: 0, transition: { duration: 0.3 } },
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "task-card",
        isGridMode && "block w-full h-auto max-w-xl mx-auto",
        task.isHomework && "border-l-4 border-blue-500",
        task.completed && "task-card-completed"
      )}
    >
      <div className={cn(
        isGridMode ? "block" : "flex items-start justify-between gap-2"
      )}>
        <div className={cn(isGridMode ? "mb-4" : "flex-1")}>
          <div className="flex items-center gap-2 mb-2">
            {task.isHomework && (
              <BookOpen size={isGridMode ? 22 : 16} className="text-blue-500" />
            )}
            {/* h3 ne porte plus les classes de la barre */}
            <h3 className={cn(
              "font-medium",
              isGridMode && "task-title text-lg"
            )}>
              {/* Le span interne porte les classes pour la barre */}
              <span className={cn(
                 "relative strikethrough-target", // Position relative et cible pour ::after
                 task.completed && "is-completed" // Classe d'activation
              )}>
                {task.title}
              </span>
            </h3>
          </div>
          {task.description && (
             // p ne porte plus les classes de la barre
            <p className={cn(
              "text-sm text-muted-foreground mt-1",
              isGridMode && "task-description text-base"
            )}>
               {/* Le span interne porte les classes pour la barre */}
              <span className={cn(
                 "relative strikethrough-target", // Position relative et cible pour ::after
                 task.completed && "is-completed" // Classe d'activation
              )}>
                 {task.description}
              </span>
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
        {/* ... reste du composant (boutons, etc.) ... */}
         <div className={cn(
          isGridMode ? "flex items-center gap-2" : "flex items-center gap-2",
          "justify-end"
        )}>
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
    </motion.div>
  );
}