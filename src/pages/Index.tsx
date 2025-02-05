import { useState } from "react";
import { Task } from "@/lib/types";
import { TaskTimeline } from "@/components/TaskTimeline";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  const handleAddTask = (title: string, date: Date) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      date,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    toast({
      title: "Tâche ajoutée",
      description: "Votre tâche a été ajoutée avec succès",
    });
  };

  const handleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast({
      title: "Tâche supprimée",
      description: "Votre tâche a été supprimée avec succès",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 items-center justify-center py-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Timeline Tasks
          </h1>
          <AddTaskDialog onAdd={handleAddTask} />
        </div>
      </header>
      <main className="max-w-7xl mx-auto">
        <TaskTimeline
          tasks={tasks}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
};

export default Index;