// src/components/TaskTimeline.tsx
import React, { useMemo } from "react";
// MODIFIÉ: Ajout de Profile et Subtask aux types importés
import { Task, TaskGroup, Category, Profile, Subtask } from "@/lib/types";
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
  // MODIFIÉ: Signature de onEdit mise à jour pour inclure les nouveaux champs de Task
  onEdit: (
    id: string,
    title: string,
    description: string,
    date: Date,
    categoryId?: string,
    urgency?: number,
    // Nouveaux paramètres pour les fonctionnalités avancées
    subtasks?: Subtask[],
    is_pinned?: boolean,
    recurrence_rule?: string
  ) => void;
  categories: Category[];
  isUserPremium: boolean; // Reste utile pour des vérifications rapides dans TaskTimeline si besoin
  // NOUVELLES PROPS
  profile: Profile | null; // Profil utilisateur pour les permissions
  onUpdateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
  onTogglePin: (taskId: string) => void;
}

// Interface pour les colonnes Kanban (reste inchangée)
interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
}

export function TaskTimeline({
  tasks,
  onComplete,
  onDelete,
  onEdit,
  categories,
  isUserPremium,
  // NOUVELLES PROPS DÉSTRUCTURÉES
  profile,
  onUpdateSubtask,
  onTogglePin,
}: TaskTimelineProps) {
  const { layoutMode } = useLayout();

  // --- LOGIQUE POUR LE GROUPEMENT PAR DATE (MODES NORMAUX) --- (INCHANGÉE)
  const groupedTasksByDate = useMemo(() => {
    if (layoutMode === 'kanban') return [];
    return tasks.reduce((groups: TaskGroup[], task) => {
      const dateStr = format(task.date, "yyyy-MM-dd");
      const existingGroup = groups.find((g) => g.date === dateStr);
      if (existingGroup) {
        existingGroup.tasks.push(task);
      } else {
        groups.push({ date: dateStr, tasks: [task] });
      }
      return groups;
    }, []);
  }, [tasks, layoutMode]);

  const sortedGroupedTasksByDate = useMemo(() => {
    if (layoutMode === 'kanban') return [];
    return groupedTasksByDate.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [groupedTasksByDate, layoutMode]);


  // --- LOGIQUE POUR LES COLONNES KANBAN --- (INCHANGÉE)
  const kanbanColumns = useMemo((): KanbanColumn[] => {
    if (layoutMode !== 'kanban') return [];
    const todoTasks = tasks.filter(task => !task.completed);
    const doneTasks = tasks.filter(task => task.completed);
    return [
      { id: "todo", title: "À Faire", tasks: todoTasks },
      { id: "done", title: "Terminé", tasks: doneTasks },
    ].filter(column => column.tasks.length > 0 || column.id === 'todo' || column.id === 'done');
  }, [tasks, layoutMode]);


  // --- RENDU CONDITIONNEL BASÉ SUR layoutMode ---

  if (layoutMode === 'kanban') {
    return (
      <div className="p-4 md:p-6 h-full flex flex-col">
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.length > 0 ? kanbanColumns.map(column => (
            <div key={column.id} className="w-72 md:w-80 lg:w-96 flex-shrink-0 bg-muted/30 p-3 rounded-lg flex flex-col">
              <h2 className="text-lg font-semibold mb-3 px-1 sticky top-0 bg-muted/30 py-2 z-10 border-b">
                {column.title} <span className="text-sm font-normal text-muted-foreground">({column.tasks.length})</span>
              </h2>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 task-column-scroll">
                {column.tasks.length > 0 ? (
                  column.tasks.map((task) => ( // Retiré 'index' car non utilisé et task.id est la clé
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={onComplete}
                      onDelete={onDelete}
                      onEdit={onEdit} // La signature de onEdit est mise à jour au niveau de la prop de TaskTimeline
                      categories={categories}
                      isUserPremium={isUserPremium}
                      // NOUVELLES PROPS PASSÉES À TASKCARD
                      profile={profile}
                      onUpdateSubtask={onUpdateSubtask}
                      onTogglePin={onTogglePin}
                      // layoutMode="compact" // TaskCard utilise useLayout maintenant, donc pas besoin de forcer ici sauf si spécifique
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground p-4 text-center italic">
                      Aucune tâche dans cette colonne.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )) : (
             <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Aucune tâche à afficher dans le tableau Kanban.</p>
             </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDU POUR LES AUTRES MODES (NORMAL, GRID, COMPACT, RIGHT) ---
  return (
    <div className={cn(
        "tasks-container p-4 md:p-6", // Retiré p-4 md:p-6 car déjà présent dans Index.tsx <main>
        layoutMode === "right" ? "grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6" : ""
    )}>
      <div className="task-groups-area">
        {sortedGroupedTasksByDate.length > 0 ? sortedGroupedTasksByDate.map((group) => (
          <div key={group.date} className={cn("task-group mb-8", layoutMode === "compact" && "mb-4")}>
            <h2 className={cn("font-bold text-xl pb-2 mb-4 border-b-2 border-border dark:text-gray-200", layoutMode === "compact" && "text-lg pb-1 mb-2")}>
              {format(new Date(group.date), "EEEE d MMMM yyyy", { locale: fr })}
            </h2>
            <div className={cn("tasks-list", layoutMode === "normal" && "space-y-4", layoutMode === "compact" && "space-y-2",
                layoutMode === "grid" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            )}>
              <AnimatePresence>
                {group.tasks.map((task) => (
                  <div key={task.id} className={cn("task-item")}>
                    <TaskCard
                      task={task}
                      onComplete={onComplete}
                      onDelete={onDelete}
                      onEdit={onEdit} // La signature de onEdit est mise à jour au niveau de la prop de TaskTimeline
                      categories={categories}
                      isUserPremium={isUserPremium}
                      // NOUVELLES PROPS PASSÉES À TASKCARD
                      profile={profile}
                      onUpdateSubtask={onUpdateSubtask}
                      onTogglePin={onTogglePin}
                      // layoutMode={layoutMode} // TaskCard utilise useLayout maintenant
                    />
                  </div>
                ))}
              </AnimatePresence>
              {group.tasks.length === 0 && (
                   <p className="text-muted-foreground text-sm col-span-full">Aucune tâche pour ce jour.</p>
               )}
            </div>
          </div>
        )) : (
             (!tasks || tasks.length === 0) && ( // Condition légèrement ajustée pour plus de clarté
                 <p className="text-center text-muted-foreground mt-8">
                     Vous n'avez aucune tâche planifiée.
                 </p>
             )
        )}
      </div>

      {layoutMode === "right" && (
        <div className="tasks-controls sticky top-[calc(var(--header-height,60px)+1.5rem)] h-fit">
          <div className="bg-card p-4 rounded-lg shadow-md border dark:bg-gray-800">
            <h3 className="font-semibold mb-3 text-card-foreground dark:text-gray-200 border-b pb-2">Statistiques</h3>
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground dark:text-gray-400">Total : {tasks.length}</p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Complétées : {tasks.filter(t => t.completed).length}</p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">En cours : {tasks.filter(t => !t.completed).length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}