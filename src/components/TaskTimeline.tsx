import React, { useMemo } from "react";
import { Task, TaskGroup } from "@/lib/types";
import { TaskCard } from "./TaskCard"; // Assurez-vous que TaskCard utilise motion.div comme racine et a une variante 'exit'
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useLayout } from "@/lib/context/LayoutContext";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion"; // Importez AnimatePresence

interface TaskTimelineProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description: string, date: Date, isHomework: boolean) => void;
  // Optionnel : Ajoutez un prop pour savoir si on doit afficher les tâches complétées
  // Si les tâches complétées sont filtrées AVANT d'être passées à ce composant,
  // l'animation fonctionnera quand onComplete est appelé.
  // showCompleted?: boolean;
}

export function TaskTimeline({ tasks, onComplete, onDelete, onEdit }: TaskTimelineProps) {
  const { layoutMode } = useLayout();

  // Regroupement des tâches par date
  const groupedTasks = useMemo(() => {
    // Important : Si les tâches complétées doivent disparaître avec animation,
    // elles doivent être filtrées *avant* ce regroupement, soit ici,
    // soit dans le composant parent qui fournit la prop 'tasks'.
    // Exemple de filtrage ici (si on ajoute un prop showCompleted):
    // const filteredTasks = showCompleted ? tasks : tasks.filter(task => !task.completed);
    const tasksToGroup = tasks; // Utilisez filteredTasks si vous ajoutez le filtrage

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
  }, [tasks /*, showCompleted */]); // Ajoutez showCompleted aux dépendances si utilisé

  // Trie des groupes de tâches par date
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
            "font-bold text-xl text-gray-800 border-b-2 border-gray-300 pb-2",
            layoutMode === "compact" && "text-lg pb-1"
          )}>
            {format(new Date(group.date), "EEEE d MMMM yyyy", { locale: fr })} {/* Format français amélioré */}
          </h2>
          <div className={cn(
            "tasks-list mt-4",
            layoutMode === "normal" && "space-y-4",
            layoutMode === "compact" && "space-y-2",
            layoutMode === "grid" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          )}>
            {/* --- Début de l'intégration AnimatePresence --- */}
            <AnimatePresence>
              {group.tasks.map((task) => (
                // La clé unique sur l'élément enfant direct d'AnimatePresence est ESSENTIELLE
                // Ici, c'est le div wrapper qui a la clé.
                // TaskCard doit avoir motion.div comme élément racine avec une prop 'exit'.
                <div key={task.id} className={cn(
                  // Note: Framer Motion 'layout' prop sur TaskCard gère mieux les transitions
                  // Vous pouvez supprimer 'transition-transform' et 'hover:scale-105' ici
                  // si vous voulez que Framer Motion gère tout.
                  "task-item",
                  // layoutMode !== "compact" && "hover:scale-105 transition-transform" // Optionnel si layout prop est sur TaskCard
                )}>
                  <TaskCard
                    task={task}
                    onComplete={onComplete}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                </div>
              ))}
            </AnimatePresence>
            {/* --- Fin de l'intégration AnimatePresence --- */}

            {/* Afficher un message si un groupe est vide après filtrage (si implémenté) */}
             {group.tasks.length === 0 && (
                 <p className="text-muted-foreground text-sm col-span-full">Aucune tâche pour ce jour.</p>
             )}
          </div>
        </div>
      ))}

      {/* Message si aucune tâche du tout */}
      {tasks.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">Vous n'avez aucune tâche planifiée.</p>
      )}

      {/* Section Statistiques (pas besoin d'AnimatePresence ici) */}
      {layoutMode === "right" && (
        <div className="tasks-controls">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Statistiques</h3>
            {/* Recalculer les stats sur les tâches originales (non filtrées si vous filtrez pour l'affichage) */}
            <p>Total des tâches : {tasks.length}</p>
            <p>Tâches complétées : {tasks.filter(t => t.completed).length}</p>
            <p>Tâches en cours : {tasks.filter(t => !t.completed).length}</p>
          </div>
        </div>
      )}
    </div>
  );
}