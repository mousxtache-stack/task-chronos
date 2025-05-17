// src/pages/Index.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Task, Category } from "@/lib/types";
import { TaskTimeline } from "@/components/TaskTimeline";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/lib/context/LayoutContext";
import { LayoutSettings } from "@/components/LayoutSettings";
import BlurText from "@/BlurText/BlurText";
import { useAlert } from "@/lib/context/AlertContext";
import { PremiumPopup } from "@/components/PremiumPopup";
import { FloatingActionButton } from "@/components/FloatingActionButton";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter as FilterIcon, BookOpen as BookOpenIcon } from "lucide-react"; // Icônes spécifiques
import * as LucideIcons from 'lucide-react'; // Pour les logos dynamiques des catégories

const MAX_TASKS_FREE_TIER = 10;
// const MAX_CATEGORIES_FREE_TIER = 3; // Optionnel

const getWelcomeMessage = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "Hello !";
  if (hour < 12) return "Good Morning !";
  if (hour < 18) return "Good Afternoon !";
  if (hour < 22) return "Good Evening !";
  return "Welcome !";
};

const Index = () => {
  // États principaux
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all'); // État pour le filtre actif

  // États UI et contexte
  const { showAlert } = useAlert();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [showWelcome, setShowWelcome] = useState(true);

  // États liés à l'utilisateur et Premium
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  const navigate = useNavigate();
  const { layoutMode } = useLayout();

  // Fonctions de chargement des données
  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error, status } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();
        if (error && status !== 406) {
            console.error("Erreur de chargement du profil:", error);
            setIsUserPremium(false); // Fallback en cas d'erreur
        } else {
           setIsUserPremium(profile?.is_premium || false);
        }
      } else {
        setIsUserPremium(false);
      }
    } catch (e) {
      console.error("Erreur catchée lors du fetchUserProfile:", e);
      setIsUserPremium(false);
    } finally {
      setProfileChecked(true);
    }
  };

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
          categoryId: task.category_id || undefined,
          urgency: task.urgency === null || typeof task.urgency === 'undefined' ? undefined : Number(task.urgency),
        }));
        setTasks(formattedTasks);
      }
    } catch (error: any) {
      showAlert("Erreur", "Impossible de charger les tâches: " + error.message, "error");
    }
  };

  const loadCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      if (error) throw error;
      if (data) setCategories(data as Category[]); // Typage explicite
    } catch (error: any) {
      showAlert("Erreur Catégories", "Impossible de charger les catégories: " + error.message, "error");
    }
  };

  // Effet pour l'authentification et le chargement initial des données
  useEffect(() => {
    const checkUserAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      await fetchUserProfile(); // Utiliser await
      await loadTasks();        // Utiliser await
      await loadCategories();   // Utiliser await
    };
    checkUserAndLoadData();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => { // Ajouter async ici
      if (event === 'SIGNED_IN' && session) { // Vérifier session
        await fetchUserProfile(); // Utiliser await
        await loadTasks();        // Utiliser await
        await loadCategories();   // Utiliser await
      } else if (event === 'SIGNED_OUT') {
        setTasks([]);
        setCategories([]);
        setIsUserPremium(false);
        setProfileChecked(false);
        navigate('/auth');
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Effet pour la visibilité du header au scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHeaderVisible(currentScrollY <= 100 || currentScrollY < lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effet pour le message de bienvenue et la popup premium
  useEffect(() => {
    if (showWelcome) {
      const welcomeTimeout = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(welcomeTimeout);
    } else {
      if (profileChecked && !isUserPremium) {
        const alreadyShownThisSession = sessionStorage.getItem('premiumPopupShown');
        if (!alreadyShownThisSession) {
          const popupTimer = setTimeout(() => {
            setShowPremiumPopup(true);
            sessionStorage.setItem('premiumPopupShown', 'true');
          }, 1500);
          return () => clearTimeout(popupTimer);
        }
      } else if (profileChecked && isUserPremium) {
        setShowPremiumPopup(false);
      }
    }
  }, [showWelcome, profileChecked, isUserPremium]);

  // Fonctions de gestion des tâches et catégories (CRUD)
  const handleAddTask = async (title: string, description: string, date: Date, categoryId?: string, urgency?: number) => {
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showAlert("Erreur", "Vous devez être connecté.", "error"); return;
      }
      if (!isUserPremium && tasks.length >= MAX_TASKS_FREE_TIER) {
        showAlert("Limite atteinte", `Passez à Premium pour plus de ${MAX_TASKS_FREE_TIER} tâches.`, "warning", 3000);
        setTimeout(() => navigate('/premium'), 2500); return;
      }

      // Créez l'objet à insérer
      const taskToInsert = {
        title,
        description: description || null,
        date: date.toISOString().split('T')[0],
        completed: false,
        user_id: user.id,
        category_id: categoryId || null,
        urgency: urgency, // <-- AJOUTEZ CETTE LIGNE
      };
      
      

      const { data: newTaskData, error } = await supabase.from("tasks")
        .insert([taskToInsert]) // Utilisez l'objet que vous venez de construire
        .select() // Assurez-vous de sélectionner 'urgency' ici aussi pour le retour
        .single();

      if (error) {
        console.error("Erreur Supabase lors de l'insertion:", error);
        throw error;
      }
      
      console.log("Index.tsx - handleAddTask: Réponse de Supabase insert (newTaskData):", newTaskData);

      if (newTaskData) {
        const newTask: Task = {
          id: newTaskData.id,
          title: newTaskData.title,
          description: newTaskData.description || undefined,
          date: new Date(newTaskData.date),
          completed: newTaskData.completed,
          categoryId: newTaskData.category_id || undefined,
          urgency: newTaskData.urgency === null || typeof newTaskData.urgency === 'undefined' ? undefined : Number(newTaskData.urgency), // Récupérez aussi l'urgence ici
        };
        setTasks(prev => [...prev, newTask].sort((a, b) => a.date.getTime() - b.date.getTime()));
        showAlert("Tâche ajoutée", "Succès.", "success");
      }
    } catch (error: any) { 
      showAlert("Erreur", "Impossible d'ajouter: " + error.message, "error"); 
    }
  };

  const handleAddCategory = async (name: string, logo: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { showAlert("Erreur", "Vous devez être connecté.", "error"); return; }
      if (!isUserPremium) { showAlert("Accès Premium", "La création de catégories est réservée aux membres Premium.", "warning"); return; }
      
      const { data: newCategoryData, error } = await supabase.from('categories')
        .insert({ user_id: user.id, name: name.trim(), logo: logo.trim() }).select().single();
      if (error) {
        if (error.code === '23505') showAlert("Erreur", "Ce nom de catégorie existe déjà.", "error");
        else throw error;
        return;
      }
      if (newCategoryData) {
        setCategories(prev => [...prev, newCategoryData as Category].sort((a, b) => a.name.localeCompare(b.name)));
        showAlert("Catégorie créée", `"${name}" créée.`, "success");
      }
    } catch (error: any) { showAlert("Erreur Catégorie", "Impossible de créer: " + (error.message || "Erreur inconnue"), "error"); }
  };

  const handleUpdateCategory = async (id: string, name: string, logo: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showAlert("Erreur", "Vous devez être connecté pour modifier une catégorie.", "error");
        return;
      }
      if (!isUserPremium) { showAlert("Accès Premium", "La modification de catégories est réservée aux membres Premium.", "warning"); return; }

      const { data: updatedCategoryData, error } = await supabase
        .from('categories')
        .update({ name: name.trim(), logo: logo.trim() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { 
          showAlert("Erreur", "Ce nom de catégorie est déjà utilisé.", "error");
        } else {
          console.error("Erreur Supabase (update category):", error);
          throw error;
        }
        return;
      }

      if (updatedCategoryData) {
        setCategories(prevCategories =>
          prevCategories.map(cat =>
            cat.id === id ? (updatedCategoryData as Category) : cat
          ).sort((a, b) => a.name.localeCompare(b.name))
        );
        showAlert("Catégorie mise à jour", `"${name}" mise à jour avec succès.`, "success");
      }
    } catch (error: any) {
      showAlert("Erreur de mise à jour", "Impossible de mettre à jour la catégorie: " + (error.message || "Erreur inconnue"), "error");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showAlert("Erreur", "Vous devez être connecté pour supprimer une catégorie.", "error");
        return;
      }
      if (!isUserPremium) { showAlert("Accès Premium", "La suppression de catégories est réservée aux membres Premium.", "warning"); return; }

      const { error: updateTasksError } = await supabase
        .from('tasks')
        .update({ category_id: null })
        .eq('category_id', id)
        .eq('user_id', user.id);

      if (updateTasksError) {
        console.error("Erreur lors de la dissociation des tâches de la catégorie:", updateTasksError);
        showAlert("Avertissement", "Impossible de dissocier toutes les tâches de cette catégorie, mais la suppression va continuer.", "warning");
      }

      const { error: deleteCategoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteCategoryError) throw deleteCategoryError;

      setCategories(prevCategories => prevCategories.filter(cat => cat.id !== id));
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.categoryId === id ? { ...task, categoryId: undefined } : task
        )
      );
      showAlert("Catégorie supprimée", "La catégorie a été supprimée.", "success");
    } catch (error: any) {
      showAlert("Erreur de suppression", "Impossible de supprimer la catégorie: " + (error.message || "Erreur inconnue"), "error");
    }
  };

  const handleCompleteTask = async (id: string) => { // Nom de fonction clarifié : handleCompleteTask
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const taskToUpdate = tasks.find((t) => t.id === id);
      if (!taskToUpdate) return;
      const { data, error } = await supabase.from("tasks")
        .update({ completed: !taskToUpdate.completed }).eq("id", id).eq("user_id", user.id)
        .select('id, completed').single();
      if (error) throw error;
      if (data) setTasks(tasks.map(task => task.id === id ? { ...task, completed: data.completed } : task));
    } catch (error: any) { showAlert("Erreur", "MàJ tâche impossible: " + error.message, "error"); }
  };

  const handleDeleteTask = async (id: string) => { // Nom de fonction clarifié : handleDeleteTask
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      setTasks(tasks.filter(task => task.id !== id));
      showAlert("Tâche supprimée", "Succès.", "success");
    } catch (error: any) { showAlert("Erreur", "Suppression impossible: " + error.message, "error"); }
  };

  const handleEditTask = async (id: string, title: string, description: string, date: Date, categoryId?: string, urgence?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const updateData = { title, description: description || null, date: date.toISOString().split('T')[0], category_id: categoryId || null };
      const { data, error } = await supabase.from("tasks").update(updateData).eq("id", id).eq("user_id", user.id).select().single();
      if (error) throw error;
      if (data) {
        const updatedTask: Task = {
          id: data.id, title: data.title, description: data.description || undefined, date: new Date(data.date),
          completed: data.completed, categoryId: data.category_id || undefined,
        };
        setTasks(tasks.map(task => (task.id === id ? updatedTask : task)).sort((a, b) => a.date.getTime() - b.date.getTime()));
        showAlert("Tâche modifiée", "Succès.", "success");
      }
    } catch (error: any) { showAlert("Erreur", "Modification impossible: " + error.message, "error"); }
  };

  // Logique de filtrage des tâches (dépend de `tasks` et `activeFilter`)
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    return task.categoryId === activeFilter; // Filtre par ID de catégorie
  });

  // Fonction pour obtenir le label du bouton de filtre (dépend de `activeFilter` et `categories`)
  const getFilterButtonLabel = () => {
    if (activeFilter === 'all') return 'Filtrer les tâches';
    const category = categories.find(cat => cat.id === activeFilter);
    return category ? category.name : 'Catégorie'; // Fallback si la catégorie n'est pas trouvée
  };

  // Affichage conditionnel du message de bienvenue
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <BlurText text={getWelcomeMessage()} delay={80} animateBy="words" direction="top"
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          onAnimationComplete={() => setShowWelcome(false)} />
      </div>
    );
  }

  // Rendu principal du composant


  // Rendu principal du composant
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <header className={
        `border-b bg-white/50 backdrop-blur-sm sticky top-16 z-10 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`
      }>
        <div className="max-w-7xl mx-auto flex flex-col gap-4 items-center justify-center py-8">
          <div className="flex items-center gap-4">
            <AddTaskDialog onAdd={handleAddTask} categories={categories} isUserPremium={isUserPremium} />
            <LayoutSettings />
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              size="sm"
            >
              Toutes les tâches
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <FilterIcon size={16} />
                  <span className="truncate max-w-[100px] sm:max-w-[150px]">{getFilterButtonLabel()}</span>
                  <ChevronDown size={16} className="ml-1 opacity-70 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrer par catégorie</DropdownMenuLabel>
                
                {categories.length > 0 && <DropdownMenuSeparator />}
                {categories.map(category => {
                  const Icon = category.logo && (LucideIcons as any)[category.logo]
                    ? (LucideIcons as any)[category.logo] as LucideIcons.LucideIcon
                    : null; // Fallback si logo non trouvé ou pas une icône Lucide
                  return (
                    <DropdownMenuItem key={category.id} onSelect={() => setActiveFilter(category.id)}>
                       {Icon ? <Icon size={16} className="mr-2" /> : <span className="mr-2 w-4 text-center">{category.logo || '•'}</span>}
                      {category.name}
                    </DropdownMenuItem>
                  );
                })}
                {categories.length === 0 && !isUserPremium && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>Créez des catégories (Premium)</DropdownMenuItem>
                  </>
                )}
                 {categories.length === 0 && isUserPremium && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>Aucune catégorie créée</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {/* <br /> Il n'est généralement pas recommandé d'utiliser <br /> pour l'espacement, préférez les marges/paddings CSS */}
      
      <main className={`max-w-7xl mx-auto p-4 mt-4 layout-${layoutMode}`}> {/* mt-4 ajouté pour remplacer <br /> */}
        <TaskTimeline
          tasks={filteredTasks}
          onComplete={handleCompleteTask} // Changé
          onDelete={handleDeleteTask}     // Changé
          onEdit={handleEditTask} // handleEditTask doit être mis à jour
          categories={categories} // Passez la liste complète des catégories
          isUserPremium={isUserPremium}
        />
         {tasks.length === 0 && profileChecked && ( // Message si aucune tâche, même si des filtres sont actifs mais ne retournent rien
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">
              {activeFilter === 'all' ? "Vous n'avez aucune tâche pour le moment." : "Aucune tâche ne correspond à vos filtres."}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {activeFilter === 'all' ? 'Cliquez sur "Nouvelle Tâche" pour commencer.' : "Essayez d'autres filtres ou ajoutez des tâches."}
            </p>
          </div>
        )}
      </main>

      {profileChecked && showPremiumPopup && !isUserPremium && (
        <PremiumPopup onClose={() => setShowPremiumPopup(false)} />
      )}

      {profileChecked && (
        <FloatingActionButton
          onAddCategory={handleAddCategory}
          isUserPremium={isUserPremium}
          userCategories={categories} 
          onUpdateCategory={handleUpdateCategory} 
          onDeleteCategory={handleDeleteCategory} 
        />
      )}
    </div>
  );
};

export default Index;