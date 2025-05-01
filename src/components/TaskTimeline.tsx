import React, { useMemo } from "react";
import { Task, TaskGroup } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useLayout } from "@/lib/context/LayoutContext";
import { cn } from "@/lib/utils";

interface TaskTimelineProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description: string, date: Date, isHomework: boolean) => void;
}

export function TaskTimeline({ tasks, onComplete, onDelete, onEdit }: TaskTimelineProps) {
  const { layoutMode } = useLayout();

  // Regroupement des tâches par date
  const groupedTasks = useMemo(() => {
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
  }, [tasks]);

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
            {format(new Date(group.date), "MMMM d, yyyy", { locale: fr })}
          </h2>
          <div className={cn(
            "tasks-list mt-4",
            layoutMode === "normal" && "space-y-4",
            layoutMode === "compact" && "space-y-2",
            layoutMode === "grid" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          )}>
            {group.tasks.map((task) => (
              <div key={task.id} className={cn(
                "task-item transition-transform",
                layoutMode !== "compact" && "hover:scale-105"
              )}>
                <TaskCard 
                  task={task} 
                  onComplete={onComplete} 
                  onDelete={onDelete} 
                  onEdit={onEdit}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {layoutMode === "right" && (
        <div className="tasks-controls">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Statistiques</h3>
            <p>Total des tâches : {tasks.length}</p>
            <p>Tâches complétées : {tasks.filter(t => t.completed).length}</p>
            <p>Tâches en cours : {tasks.filter(t => !t.completed).length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
