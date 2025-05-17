// src/components/TaskCard.tsx
import React, { useState } from "react";
import { Task, Category } from "@/lib/types";
import { Check, Trash2, BookOpen, PencilIcon, Eye, EyeOff, AlertTriangle } from "lucide-react";
import * as LucideIcons from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLayout } from "@/lib/context/LayoutContext";
import { EditTaskDialog } from "./EditTaskDialog";
import { motion } from "framer-motion";

// Assurez-vous que cet ID est le même que celui défini dans Index.tsx
const HOMEWORK_CATEGORY_ID = "system_category_homework_id_unique";

// Couleurs pour l'icône d'urgence (classes de texte Tailwind)
// L'index 0 (vert) ne sera pas utilisé pour AlertTriangle avec la condition task.urgency >= 1
const urgencyIconColors = [ 
  "text-green-500",   // Urgence 0 (Pas urgent)
  "text-yellow-500",  // Urgence 1 (Normal/Faible)
  "text-orange-500",  // Urgence 2 (Important)
  "text-red-500"      // Urgence 3 (Très urgent)
];

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    title: string,
    description: string,
    date: Date,
    categoryId?: string,
    urgency?: number // Assurez-vous que la signature correspond à Index.tsx et TaskTimeline.tsx
  ) => void;
  categories: Category[];
  isUserPremium: boolean;
}

export function TaskCard({ task, onComplete, onDelete, onEdit, categories, isUserPremium }: TaskCardProps) {
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

  const taskCategoryDetails = categories.find(cat => cat.id === task.categoryId);
  const isTaskHomework = task.categoryId === HOMEWORK_CATEGORY_ID;

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "task-card p-4 rounded-lg shadow-md border",
        task.completed ? "bg-muted/50 border-dashed opacity-70" : "bg-card",
        isTaskHomework && !task.completed && "border-l-4 border-blue-500", // Bordure pour Devoir
      )}
    >
      <div className={cn(isGridMode ? "block" : "flex items-start justify-between gap-2")}>
        <div className={cn(isGridMode ? "mb-4" : "flex-1 min-w-0")}> {/* min-w-0 pour gestion du truncate */}
          <div className="flex items-center gap-2 mb-1"> {/* Conteneur pour icônes, titre et icône d'urgence */}
            {/* Icône de catégorie / Devoir */}
            {isTaskHomework && (
              <BookOpen size={isGridMode ? 20 : 16} className="text-blue-500 flex-shrink-0" />
            )}
            {taskCategoryDetails?.logo && !isTaskHomework && (LucideIcons as any)[taskCategoryDetails.logo] && (
              React.createElement((LucideIcons as any)[taskCategoryDetails.logo], {
                size: isGridMode ? 20 : 16, className: "text-muted-foreground flex-shrink-0",
              })
            )}
            {/* Titre de la tâche */}
            <h3 className={cn(
              "font-medium truncate", // truncate pour les titres longs
              isGridMode && "task-title text-lg",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>

            {/* Indicateur d'urgence avec une icône AlertTriangle colorée */}
            {/* S'affiche si urgence est définie, >= 1, et que la tâche n'est pas complétée */}
            {typeof task.urgency === 'number' && task.urgency >= 1 && task.urgency < urgencyIconColors.length && !task.completed && (
              <AlertTriangle 
                size={isGridMode ? 16 : 14}
                className={cn(
                  "ml-1 flex-shrink-0", // Marge à gauche et s'assure qu'elle ne rétrécit pas
                  urgencyIconColors[task.urgency] // Applique la couleur d'urgence
                )} 
                aria-label={`Urgence niveau ${task.urgency + 1}`}
              />
            )}
          </div>

          {task.description && (
            <p className={cn(
              "text-sm text-muted-foreground mt-1",
              isGridMode && "task-description text-base",
              task.completed && "line-through"
            )}>
               {task.description}
            </p>
          )}
          
          {taskCategoryDetails && (
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block",
              task.completed ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300" 
                             : (isTaskHomework 
                               ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                               : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/80"),
              isGridMode && "task-badge"
            )}>
              {taskCategoryDetails.name}
            </span>
          )}
        </div>
        
         <div className={cn(
          isGridMode ? "flex items-center gap-2 mt-3 justify-end w-full" : "flex items-center gap-1 flex-shrink-0",
        )}>
          <button
            onClick={() => onComplete(task.id)}
            aria-label="Marquer comme complétée"
            className={cn("p-1 rounded-full hover:bg-secondary transition-colors", isGridMode && "p-2")}
          >
            <Check size={isGridMode ? 22 : 16} className={cn(task.completed ? "text-primary" : "text-muted-foreground")} />
          </button>

          <button
            onClick={toggleControls}
            aria-label={showControls ? "Cacher les options" : "Afficher les options"}
            className={cn("p-1 rounded-full hover:bg-secondary transition-colors", isGridMode && "p-2")}
          >
            {showControls ? <Eye size={isGridMode ? 22 : 16} className="text-blue-500" /> : <EyeOff size={isGridMode ? 22 : 16} className="text-muted-foreground" />}
          </button>

          <div className={cn(
            "flex items-center gap-1 transition-all duration-300 ease-in-out transform",
            showControls ? "opacity-100 max-w-xs translate-x-0" : "opacity-0 max-w-0 overflow-hidden -translate-x-2 pointer-events-none"
          )}>
            <EditTaskDialog
              task={task}
              onEdit={onEdit}
              categories={categories}
              // Si EditTaskDialog a besoin de savoir si l'utilisateur est premium pour l'édition de l'urgence:
              isUserPremium={isUserPremium} // Cette prop devrait venir de Index -> TaskTimeline -> TaskCard
              trigger={
                <button aria-label="Modifier la tâche" className={cn("p-1 rounded-full hover:bg-secondary transition-colors", isGridMode && "p-2")}>
                  <PencilIcon size={isGridMode ? 22 : 16} className="text-amber-500" />
                </button>
              }
            />
            <button
              onClick={() => onDelete(task.id)}
              aria-label="Supprimer la tâche"
              className={cn("p-1 rounded-full hover:bg-destructive/10 transition-colors", isGridMode && "p-2")}
            >
              <Trash2 size={isGridMode ? 22 : 16} className="text-destructive" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}