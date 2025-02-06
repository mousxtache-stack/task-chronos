import { useState, useEffect } from "react";
import { Task } from "@/lib/types";
import { TaskTimeline } from "@/components/TaskTimeline";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq('user_id', user.id)
        .order("date", { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedTasks = data.map((task): Task => ({
          id: task.id,
          title: task.title,
          date: new Date(task.date),
          completed: task.completed || false,
        }));
        setTasks(formattedTasks);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les tâches",
        variant: "destructive",
      });
    }
  };

  const handleAddTask = async (title: string, date: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour ajouter une tâche",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([{ 
          title, 
          date: date.toISOString().split('T')[0], 
          completed: false,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTask: Task = {
          id: data.id,
          title: data.title,
          date: new Date(data.date),
          completed: false,
        };
        setTasks([...tasks, newTask]);
        toast({
          title: "Tâche ajoutée",
          description: "Votre tâche a été ajoutée avec succès",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la tâche",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la tâche",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setTasks(tasks.filter((task) => task.id !== id));
      toast({
        title: "Tâche supprimée",
        description: "Votre tâche a été supprimée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 items-center justify-center py-8">
          <AddTaskDialog onAdd={handleAddTask} />
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4">
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