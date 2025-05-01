import { useState, useEffect, useRef } from "react";
import { Task } from "@/lib/types";
import { TaskTimeline } from "@/components/TaskTimeline";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useLayout } from "@/lib/context/LayoutContext";
import { LayoutSettings } from "@/components/LayoutSettings";
import BlurText from "@/BlurText/BlurText";
import { TaskCard } from "@/components/TaskCard";
import { useAlert } from "@/lib/context/AlertContext";

const getWelcomeMessage = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "Hello !";
  if (hour < 12) return "Good Morning !";
  if (hour < 18) return "Good Afternoon !";
  if (hour < 22) return "Good Evening !";
  return "Welcome !";
};

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'homework'>('all');
  const { showAlert } = useAlert();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showWelcome) return;
    const timeout = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timeout);
  }, [showWelcome]);

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
          description: task.description || undefined,
          date: new Date(task.date),
          completed: task.completed || false,
          isHomework: task.is_homework || false,
        }));
        setTasks(formattedTasks);
      }
    } catch (error: any) {
      showAlert("Erreur", "Impossible de charger les tâches", "error");
    }
  };

  const handleAddTask = async (title: string, description: string, date: Date, isHomework: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showAlert("Erreur", "Vous devez être connecté pour ajouter une tâche", "error");
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([{ 
          title, 
          description: description || null,
          date: date.toISOString().split('T')[0], 
          completed: false,
          user_id: user.id,
          is_homework: isHomework
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          date: new Date(data.date),
          completed: false,
          isHomework: data.is_homework || false,
        };
        setTasks([...tasks, newTask]);
        showAlert("Tâche ajoutée", "Votre tâche a été ajoutée avec succès", "success");
      }
    } catch (error: any) {
      showAlert("Erreur", "Impossible d'ajouter la tâche", "error");
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
      showAlert("Erreur", "Impossible de mettre à jour la tâche", "error");
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
      showAlert("Tâche supprimée", "Votre tâche a été supprimée avec succès", "success");
    } catch (error: any) {
      showAlert("Erreur", "Impossible de supprimer la tâche", "error");
    }
  };

  const handleEditTask = async (id: string, title: string, description: string, date: Date, isHomework: boolean) => {
    try {
      console.log("Début de l'édition de tâche:", { id, title, description, date, isHomework });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("Utilisateur non connecté");
        return;
      }

      // Formater la date correctement pour Supabase
      const formattedDate = date.toISOString().split('T')[0];
      console.log("Date formatée pour Supabase:", formattedDate);
      
      const updateData = { 
        title, 
        description: description || null,
        date: formattedDate,
        is_homework: isHomework
      };
      console.log("Données à envoyer à Supabase:", updateData);

      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }

      console.log("Réponse de Supabase:", data);
      
      // Mise à jour de l'état local
      setTasks(
        tasks.map((task) =>
          task.id === id ? { 
            ...task, 
            title, 
            description: description || undefined, 
            date,
            isHomework 
          } : task
        )
      );
      
      showAlert("Tâche modifiée", "Votre tâche a été modifiée avec succès", "success");
    } catch (error: any) {
      console.error("Erreur lors de la modification:", error);
      showAlert("Erreur", "Impossible de modifier la tâche: " + error.message, "error");
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.isHomework);

  const { layoutMode } = useLayout();

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <BlurText
          text={getWelcomeMessage()}
          delay={80}
          animateBy="words"
          direction="top"
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          onAnimationComplete={() => setShowWelcome(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <header className={
        `border-b bg-white/50 backdrop-blur-sm sticky top-16 z-10 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`
      }>
        <div className="max-w-7xl mx-auto flex flex-col gap-4 items-center justify-center py-8">
          <div className="flex items-center gap-4">
            <AddTaskDialog onAdd={handleAddTask} />
            <LayoutSettings />
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilter('all')}
              size="sm"
            >
              Toutes les tâches
            </Button>
            <Button 
              variant={filter === 'homework' ? 'default' : 'outline'} 
              onClick={() => setFilter('homework')}
              size="sm"
              className="flex items-center gap-1"
            >
              <BookOpen size={16} />
              Devoirs
            </Button>
          </div>
        </div>
      </header>
      <br />
      <main className={`max-w-7xl mx-auto p-4 layout-${layoutMode}`}>
        <TaskTimeline
          tasks={filteredTasks}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onEdit={handleEditTask}
        />
      </main>
    </div>
  );
};

export default Index;