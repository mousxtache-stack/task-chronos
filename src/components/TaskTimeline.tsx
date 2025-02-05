import { Task, TaskGroup } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { format } from "date-fns";

interface TaskTimelineProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskTimeline({ tasks, onComplete, onDelete }: TaskTimelineProps) {
  const groupedTasks = tasks.reduce((groups: TaskGroup[], task) => {
    const dateStr = format(task.date, "yyyy-MM-dd");
    const existingGroup = groups.find((g) => g.date === dateStr);
    
    if (existingGroup) {
      existingGroup.tasks.push(task);
    } else {
      groups.push({ date: dateStr, tasks: [task] });
    }
    
    return groups;
  }, []);

  groupedTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="task-timeline">
      {groupedTasks.map((group) => (
        <div key={group.date} className="task-group">
          <h2 className="font-semibold text-lg">
            {format(new Date(group.date), "MMMM d, yyyy")}
          </h2>
          <div className="space-y-3">
            {group.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onComplete}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}