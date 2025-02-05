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
      title: "Task added",
      description: "Your task has been added successfully",
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
      title: "Task deleted",
      description: "Your task has been deleted successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Timeline Tasks</h1>
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