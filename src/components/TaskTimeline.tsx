// src/components/TaskTimeline.tsx
import React, { useMemo } from "react";
import { Task, TaskGroup, Category } from "@/lib/types"; // MODIFIÉ: Importer Category
import { TaskCard } from "./TaskCard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useLayout } from "@/lib/context/LayoutContext";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

interface TaskTimelineProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    title: string,
    description: string,
    date: Date,
    //isHomework: boolean,
    categoryId?: string, // Assurez-vous que la signature de onEdit dans Index.tsx correspond
    urgency?: number // AJOUTER CECI
  ) => void;
  categories: Category[]; // MODIFIÉ: Ajouter la prop categories
  isUserPremium: boolean; // <-- DOIT ÊTRE DÉFINI ICI
}

export function TaskTimeline({ tasks, onComplete, onDelete, onEdit, categories, isUserPremium }: TaskTimelineProps) { // MODIFIÉ: Récupérer categories des props
  const { layoutMode } = useLayout();

  const groupedTasks = useMemo(() => {
    const tasksToGroup = tasks;
    return tasksToGroup.reduce((groups: TaskGroup[], task) => {
      const dateStr = format(task.date, "yyyy-MM-dd");
      const existingGroup = groups.find((g) => g.date === dateStr);
      if (existingGroup) {
        existingGroup.tasks.push(task);
      } else {
        groups.push({ date: dateStr, tasks: [task] });
      }
      return groups;
    }, []);
  }, [tasks]);

  const sortedGroupedTasks = useMemo(() => {
    return groupedTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [groupedTasks]);

  return (
    <div className="tasks-container">
      {sortedGroupedTasks.map((group) => (
        <div key={group.date} className={cn(
          "task-group mb-8",
          layoutMode === "compact" && "mb-4"
        )}>
          <h2 className={cn(
            "font-bold text-xl text-gray-800 border-b-2 border-gray-300 pb-2", // Vous pouvez ajuster les couleurs par défaut ici
            "dark:text-gray-200 dark:border-gray-700", // Ajout pour le mode sombre si vous l'implémentez
            layoutMode === "compact" && "text-lg pb-1"
          )}>
            {format(new Date(group.date), "EEEE d MMMM yyyy", { locale: fr })}
          </h2>
          <div className={cn(
            "tasks-list mt-4",
            layoutMode === "normal" && "space-y-4",
            layoutMode === "compact" && "space-y-2",
            layoutMode === "grid" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          )}>
            <AnimatePresence>
            // Dans src/components/TaskTimeline.tsx, dans le map de group.tasks
{group.tasks.map((task) => {
  console.log(`Task passée à TaskCard (ID: ${task.id}, Urgence: ${task.urgency}) DEPUIS TaskTimeline:`, JSON.stringify(task, null, 2));
  return (
    <div key={task.id} className={cn("task-item")}>
      <TaskCard
        task={task} // C'est cette prop task qu'on vérifie
        onComplete={onComplete}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    categories={categories} // MODIFIÉ: Passer la prop categories ici
                    isUserPremium={isUserPremium}
      />
    </div>
  );
})}
            </AnimatePresence>
            {group.tasks.length === 0 && (
                 <p className="text-muted-foreground text-sm col-span-full">Aucune tâche pour ce jour.</p>
             )}
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">Vous n'avez aucune tâche planifiée.</p>
      )}

      {layoutMode === "right" && (
        <div className="tasks-controls">
          <div className="bg-card p-4 rounded-lg shadow-md dark:bg-gray-800"> {/* Utilisation de bg-card pour theming */}
            <h3 className="font-semibold mb-2 text-card-foreground dark:text-gray-200">Statistiques</h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Total des tâches : {tasks.length}</p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Tâches complétées : {tasks.filter(t => t.completed).length}</p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Tâches en cours : {tasks.filter(t => !t.completed).length}</p>
          </div>
        </div>
      )}
    </div>
  );
}