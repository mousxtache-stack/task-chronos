// src/pages/Index.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Task, Category, Subtask, Profile } from "@/lib/types"; // Assurez-vous que Profile est défini
import { TaskTimeline } from "@/components/TaskTimeline";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { EditTaskDialog } from "@/components/EditTaskDialog"; // Nécessaire pour la logique d'édition
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/lib/context/LayoutContext";
import { LayoutSettings } from "@/components/LayoutSettings";
import BlurText from "@/BlurText/BlurText";
import { useAlert } from "@/lib/context/AlertContext";
import { PremiumPopup } from "@/components/PremiumPopup";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useProfileData } from "@/lib/context/ProfileContext"; // Importé pour les données du profil
import { Separator } from "@/components/ui/separator"; // Pour la séparation visuelle potentielle

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter as FilterIcon, BookOpen as BookOpenIcon, Loader2, Pin as PinIconLucide } from "lucide-react"; // PinIconLucide pour éviter conflit avec type Pin
import * as LucideIcons from 'lucide-react';

const MAX_TASKS_FREE_TIER = 10;

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
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // États UI et contexte
  const { showAlert } = useAlert();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [showWelcome, setShowWelcome] = useState(true);

  // Utilisation du contexte de profil
  const { profile: userProfile, loadingProfile, fetchProfile: fetchContextProfile } = useProfileData();
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  // État de chargement pour les données de la page (tâches, catégories)
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  // État pour le dialogue d'ajout de tâche (utilisé par votre AddTaskDialog dans le header)
  // Si AddTaskDialog gère son propre état d'ouverture, cet état n'est pas nécessaire ici.
  // Pour l'instant, je le laisse commenté car votre JSX pour AddTaskDialog ne montre pas qu'il est contrôlé par un état ici.
  // const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);


  const navigate = useNavigate();
  const { layoutMode } = useLayout();

  const isUserPremium = useMemo(() => userProfile?.is_premium || false, [userProfile]);

  const loadTasks = async (userId: string) => {
    // Ne pas changer setIsLoadingPageData ici si ce n'est pas le seul chargement
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, category:categories(name)")
        .eq('user_id', userId)
        .order("is_pinned", { ascending: false, nullsFirst: false })
        .order("date", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data) {
        const formattedTasks = data.map((task): Task => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          date: new Date(task.date),
          completed: task.completed || false,
          categoryId: task.category_id || undefined,
          category_name: task.category?.name || undefined,
          urgency: task.urgency === null || typeof task.urgency === 'undefined' ? undefined : Number(task.urgency),
          user_id: task.user_id,
          created_at: task.created_at,
          subtasks: task.subtasks || [],
          is_pinned: task.is_pinned || false,
          recurrence_rule: task.recurrence_rule || null,
        }));
        setTasks(formattedTasks);
      }
    } catch (error: any) {
      showAlert("Erreur", "Impossible de charger les tâches: " + error.message, "error");
    }
  };

  const loadCategories = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });
      if (error) throw error;
      if (data) setCategories(data as Category[]);
    } catch (error: any) {
      showAlert("Erreur Catégories", "Impossible de charger les catégories: " + error.message, "error");
    }
  };

  useEffect(() => {
    setIsLoadingPageData(true); // Commencer le chargement global
    const checkUserAndLoadData = async () => {
      if (loadingProfile) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        setIsLoadingPageData(false);
        return;
      }
      if (session.user.id) {
        await Promise.all([
          loadTasks(session.user.id),
          loadCategories(session.user.id)
        ]);
      }
      setIsLoadingPageData(false); // Fin du chargement global
    };

    checkUserAndLoadData();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchContextProfile(); // Le useEffect ci-dessus réagira
      } else if (event === 'SIGNED_OUT') {
        setTasks([]);
        setCategories([]);
        navigate('/auth');
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, loadingProfile, fetchContextProfile]);


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHeaderVisible(currentScrollY <= 100 || currentScrollY < lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showWelcome) {
      const welcomeTimeout = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(welcomeTimeout);
    } else {
      if (!loadingProfile) {
        if (!isUserPremium) {
          const alreadyShownThisSession = sessionStorage.getItem('premiumPopupShown');
          if (!alreadyShownThisSession) {
            const popupTimer = setTimeout(() => {
              setShowPremiumPopup(true);
              sessionStorage.setItem('premiumPopupShown', 'true');
            }, 1500);
            return () => clearTimeout(popupTimer);
          }
        } else {
          setShowPremiumPopup(false);
        }
      }
    }
  }, [showWelcome, loadingProfile, isUserPremium]);


  const handleAddTask = async (
    title: string,
    description: string,
    date: Date,
    categoryId?: string,
    urgency?: number,
    // NOUVEAUX PARAMS (pour la signature, la logique d'utilisation est dans les dialogues)
    subtasksData?: Subtask[],
    recurrenceRuleData?: string
    // is_pinned n'est généralement pas défini à la création, mais à l'édition ou par une action séparée
  ) => {
    if (!userProfile?.id) {
      showAlert("Erreur", "Connectez-vous.", "error"); return;
    }
    if (!isUserPremium && tasks.length >= MAX_TASKS_FREE_TIER) {
      showAlert("Limite atteinte", `Premium > ${MAX_TASKS_FREE_TIER} tâches.`, "warning", 3000);
      setTimeout(() => navigate('/premium'), 2500); return;
    }

    const finalSubtasks = (isUserPremium && userProfile.enable_subtasks) ? subtasksData : null;
    const finalRecurrenceRule = (isUserPremium && userProfile.enable_smart_recurrence) ? recurrenceRuleData : null;

    try {
      const taskToInsert = {
        title, description: description || null, date: date.toISOString().split('T')[0],
        completed: false, user_id: userProfile.id, category_id: categoryId || null, urgency: urgency,
        subtasks: finalSubtasks, is_pinned: false, recurrence_rule: finalRecurrenceRule,
      };
      const { data: newTaskData, error } = await supabase.from("tasks").insert([taskToInsert])
        .select("*, category:categories(name)").single();
      if (error) throw error;
      if (newTaskData) {
        const newTask: Task = {
          id: newTaskData.id, title: newTaskData.title, description: newTaskData.description || undefined,
          date: new Date(newTaskData.date), completed: newTaskData.completed || false,
          categoryId: newTaskData.category_id || undefined, category_name: newTaskData.category?.name || undefined,
          urgency: newTaskData.urgency === null || typeof newTaskData.urgency === 'undefined' ? undefined : Number(newTaskData.urgency),
          user_id: newTaskData.user_id, created_at: newTaskData.created_at,
          subtasks: newTaskData.subtasks || [], is_pinned: newTaskData.is_pinned || false,
          recurrence_rule: newTaskData.recurrence_rule || null,
        };
        setTasks(prev => [...prev, newTask].sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1; if (!a.is_pinned && b.is_pinned) return 1;
            return a.date.getTime() - b.date.getTime();
        }));
        showAlert("Tâche ajoutée", "Succès.", "success");
        // Fermer le dialogue si AddTaskDialog est contrôlé par un état ici
        // setIsAddTaskDialogOpen(false);
      }
    } catch (error: any) { showAlert("Erreur", "Ajout impossible: " + error.message, "error"); }
  };

  const handleAddCategory = async (name: string, logo: string) => {
    if (!userProfile?.id) { showAlert("Erreur", "Connectez-vous.", "error"); return; }
    if (!isUserPremium) { showAlert("Accès Premium", "Création pour membres Premium.", "warning"); return; }
    try {
      const { data: newCategoryData, error } = await supabase.from('categories')
        .insert({ user_id: userProfile.id, name: name.trim(), logo: logo.trim() }).select().single();
      if (error) { if (error.code === '23505') showAlert("Erreur", "Nom catégorie existe.", "error"); else throw error; return; }
      if (newCategoryData) {
        setCategories(prev => [...prev, newCategoryData as Category].sort((a, b) => a.name.localeCompare(b.name)));
        showAlert("Catégorie créée", `"${name}" ok.`, "success");
      }
    } catch (error: any) { showAlert("Erreur Catégorie", "Création impossible: " + (error.message || "Erreur"), "error"); }
  };
  const handleUpdateCategory = async (id: string, name: string, logo: string) => {
    if (!userProfile?.id) { showAlert("Erreur", "Connectez-vous.", "error"); return; }
    if (!isUserPremium) { showAlert("Accès Premium", "Modification pour membres Premium.", "warning"); return; }
    try {
      const { data: updatedCategoryData, error } = await supabase.from('categories').update({ name: name.trim(), logo: logo.trim() })
        .eq('id', id).eq('user_id', userProfile.id).select().single();
      if (error) { if (error.code === '23505') showAlert("Erreur", "Nom catégorie existe.", "error"); else throw error; return; }
      if (updatedCategoryData) {
        setCategories(prev => prev.map(c => c.id === id ? (updatedCategoryData as Category) : c).sort((a,b)=>a.name.localeCompare(b.name)));
        showAlert("Catégorie MàJ", `"${name}" ok.`, "success");
      }
    } catch (error: any) { showAlert("Erreur MàJ", "Impossible: " + (error.message || "Erreur"), "error"); }
  };
  const handleDeleteCategory = async (id: string) => {
    if (!userProfile?.id) { showAlert("Erreur", "Connectez-vous.", "error"); return; }
    if (!isUserPremium) { showAlert("Accès Premium", "Suppression pour membres Premium.", "warning"); return; }
    try {
      await supabase.from('tasks').update({ category_id: null }).eq('category_id', id).eq('user_id', userProfile.id);
      await supabase.from('categories').delete().eq('id', id).eq('user_id', userProfile.id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setTasks(prev => prev.map(t => t.categoryId === id ? { ...t, categoryId: undefined, category_name: undefined } : t));
      showAlert("Catégorie supprimée", "Ok.", "success");
    } catch (error: any) { showAlert("Erreur suppression", "Impossible: " + (error.message || "Erreur"), "error"); }
  };

  const handleCompleteTask = async (id: string) => {
    if (!userProfile?.id) return;
    try {
      const taskToUpdate = tasks.find((t) => t.id === id);
      if (!taskToUpdate) return;
      const { data, error } = await supabase.from("tasks").update({ completed: !taskToUpdate.completed, updated_at: new Date().toISOString() })
        .eq("id", id).eq("user_id", userProfile.id).select('id, completed, updated_at').single();
      if (error) throw error;
      if (data) setTasks(tasks.map(t => t.id === id ? { ...t, completed: data.completed, updated_at: data.updated_at } : t));
    } catch (error: any) { showAlert("Erreur", "MàJ tâche: " + error.message, "error"); }
  };
  const handleDeleteTask = async (id: string) => {
    if (!userProfile?.id) return;
    try {
      await supabase.from("tasks").delete().eq("id", id).eq("user_id", userProfile.id);
      setTasks(tasks.filter(t => t.id !== id));
      showAlert("Tâche supprimée", "Ok.", "success");
    } catch (error: any) { showAlert("Erreur", "Suppression: " + error.message, "error"); }
  };

  const handleEditTask = async (
    id: string, title: string, description: string, date: Date, categoryId?: string, urgency?: number,
    subtasksData?: Subtask[], isPinnedData?: boolean, recurrenceRuleData?: string // Signature mise à jour
  ) => {
    if (!userProfile?.id) return;
    const finalSubtasks = (isUserPremium && userProfile.enable_subtasks) ? subtasksData : undefined;
    const finalIsPinned = (isUserPremium && userProfile.enable_pinned_tasks) ? isPinnedData : undefined;
    const finalRecurrenceRule = (isUserPremium && userProfile.enable_smart_recurrence) ? recurrenceRuleData : undefined;
    try {
      const updatePayload: any = { title, description: description || null, date: date.toISOString().split('T')[0],
        category_id: categoryId || null, urgency, updated_at: new Date().toISOString() };
      if (finalSubtasks !== undefined) updatePayload.subtasks = finalSubtasks;
      if (finalIsPinned !== undefined) updatePayload.is_pinned = finalIsPinned;
      if (finalRecurrenceRule !== undefined) updatePayload.recurrence_rule = finalRecurrenceRule;

      const { data, error } = await supabase.from("tasks").update(updatePayload).eq("id", id).eq("user_id", userProfile.id)
        .select("*, category:categories(name)").single();
      if (error) throw error;
      if (data) {
        const updatedTask: Task = {
          id: data.id, title: data.title, description: data.description || undefined, date: new Date(data.date),
          completed: data.completed || false, categoryId: data.category_id || undefined, category_name: data.category?.name || undefined,
          urgency: data.urgency === null || typeof data.urgency === 'undefined' ? undefined : Number(data.urgency),
          user_id: data.user_id, created_at: data.created_at, updated_at: data.updated_at,
          subtasks: data.subtasks || [], is_pinned: data.is_pinned || false, recurrence_rule: data.recurrence_rule || null,
        };
        setTasks(tasks.map(t => (t.id === id ? updatedTask : t)).sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1; if (!a.is_pinned && b.is_pinned) return 1;
            return a.date.getTime() - b.date.getTime();
        }));
        showAlert("Tâche modifiée", "Ok.", "success");
        setEditingTask(null);
      }
    } catch (error: any) { showAlert("Erreur", "Modification: " + error.message, "error"); }
  };

  const handleUpdateSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
    if (!userProfile?.id || !isUserPremium || !userProfile.enable_subtasks) return;
    const taskIdx = tasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1 || !tasks[taskIdx].subtasks) return;
    const updatedSubtasks = tasks[taskIdx].subtasks!.map(sub => sub.id === subtaskId ? { ...sub, is_completed: completed } : sub);
    try {
      await supabase.from('tasks').update({ subtasks: updatedSubtasks, updated_at: new Date().toISOString() })
        .eq('id', taskId).eq('user_id', userProfile.id);
      const newTasks = [...tasks];
      newTasks[taskIdx] = { ...newTasks[taskIdx], subtasks: updatedSubtasks };
      setTasks(newTasks);
    } catch (error: any) { showAlert("Erreur", "MàJ sous-tâche: " + error.message, "error"); }
  };

  const handleTogglePin = async (taskId: string) => {
    if (!userProfile?.id || !isUserPremium || !userProfile.enable_pinned_tasks) {
      showAlert("Accès Premium", "Épinglage pour Premium.", "warning"); return;
    }
    const taskIdx = tasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1) return;
    const newPinStatus = !tasks[taskIdx].is_pinned;
    try {
      await supabase.from('tasks').update({ is_pinned: newPinStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId).eq('user_id', userProfile.id);
      const newTasks = tasks.map(t => t.id === taskId ? { ...t, is_pinned: newPinStatus } : t)
        .sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1; if (!a.is_pinned && b.is_pinned) return 1;
            return a.date.getTime() - b.date.getTime();
        });
      setTasks(newTasks);
      showAlert(newPinStatus ? "Tâche épinglée" : "Tâche désépinglée", "Ok.", "success");
    } catch (error: any) { showAlert("Erreur", "Épinglage: " + error.message, "error"); }
  };

  const filteredTasks = useMemo(() => tasks.filter(task => {
    if (activeFilter === 'all') return true;
    return task.categoryId === activeFilter;
  }), [tasks, activeFilter]);

  const { pinnedTasksDisplay, regularTasksDisplay } = useMemo(() => {
    if (!isUserPremium || !userProfile?.enable_pinned_tasks) {
      return { pinnedTasksDisplay: [], regularTasksDisplay: filteredTasks };
    }
    const Pinned: Task[] = []; const Regular: Task[] = [];
    filteredTasks.forEach(task => task.is_pinned ? Pinned.push(task) : Regular.push(task));
    Pinned.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Tri secondaire
    return { pinnedTasksDisplay: Pinned, regularTasksDisplay: Regular };
  }, [filteredTasks, isUserPremium, userProfile]);

  const getFilterButtonLabel = () => {
    if (activeFilter === 'all') return 'Filtrer les tâches';
    const category = categories.find(cat => cat.id === activeFilter);
    return category ? category.name : 'Catégorie';
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <BlurText text={getWelcomeMessage()} delay={80} animateBy="words" direction="top"
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          onAnimationComplete={() => setShowWelcome(false)} />
      </div>
    );
  }

  if (loadingProfile || isLoadingPageData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!userProfile && !loadingProfile) { navigate('/auth'); return null; }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* VOTRE HEADER ORIGINAL - AUCUNE MODIFICATION DE STRUCTURE ICI */}
      <header className={
        `border-b bg-white/50 backdrop-blur-sm sticky top-16 z-10 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`
      }>
        <div className="max-w-7xl mx-auto flex flex-col gap-4 items-center justify-center py-8"> {/* Changé sm:flex-row et sm:py-6 en flex-col et py-8 pour matcher votre version */}
          <div className="flex items-center gap-4"> {/* Changé sm:gap-4 et sm:mb-0 en juste gap-4 */}
            <AddTaskDialog
                onAdd={handleAddTask} // Pass la fonction mise à jour
                categories={categories}
                isUserPremium={isUserPremium}
                profile={userProfile} // Passer le profil pour les options avancées
            />
            <LayoutSettings />
          </div>
          <div className="flex gap-2 mt-4"> {/* Reste mt-4 comme dans votre version */}
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
                  const Icon = category.logo && (LucideIcons as any)[category.logo] ? (LucideIcons as any)[category.logo] as LucideIcons.LucideIcon : null;
                  return (
                    <DropdownMenuItem key={category.id} onSelect={() => setActiveFilter(category.id)}>
                       {Icon ? <Icon size={16} className="mr-2" /> : <span className="mr-2 w-4 text-center">{category.logo?.charAt(0) || '•'}</span>}
                      {category.name}
                    </DropdownMenuItem>
                  );
                })}
                {categories.length === 0 && !isUserPremium && (<> <DropdownMenuSeparator /> <DropdownMenuItem disabled>Créez catégories (Premium)</DropdownMenuItem> </>)}
                {categories.length === 0 && isUserPremium && (<> <DropdownMenuSeparator /> <DropdownMenuItem disabled>Aucune catégorie créée</DropdownMenuItem> </>)}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className={`max-w-7xl mx-auto p-4 mt-4 layout-${layoutMode}`}>
        {isUserPremium && userProfile?.enable_pinned_tasks && pinnedTasksDisplay.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3 flex items-center text-primary">
                    <PinIconLucide className="mr-2 h-5 w-5" />
                    Tâches Épinglées
                </h2>
                <TaskTimeline
                    tasks={pinnedTasksDisplay}
                    onComplete={handleCompleteTask} onDelete={handleDeleteTask} onEdit={(id, title, desc, date, catId, urg) => {
                        const taskToEdit = tasks.find(t => t.id === id);
                        setEditingTask(taskToEdit || null); // Ouvre EditTaskDialog avec la tâche complète
                    }}
                    categories={categories} isUserPremium={isUserPremium}
                    profile={userProfile} onUpdateSubtask={handleUpdateSubtask} onTogglePin={handleTogglePin}
                />
                <Separator className="my-6" />
            </div>
        )}
        {(isUserPremium && userProfile?.enable_pinned_tasks && pinnedTasksDisplay.length > 0 && regularTasksDisplay.length > 0) && (
             <h2 className="text-xl font-semibold mb-3 text-foreground/80">Autres tâches</h2>
        )}
        <TaskTimeline
          tasks={regularTasksDisplay}
          onComplete={handleCompleteTask} onDelete={handleDeleteTask} onEdit={(id, title, desc, date, catId, urg) => {
            const taskToEdit = tasks.find(t => t.id === id);
            setEditingTask(taskToEdit || null);
          }}
          categories={categories} isUserPremium={isUserPremium}
          profile={userProfile} onUpdateSubtask={handleUpdateSubtask} onTogglePin={handleTogglePin}
        />
         {tasks.length === 0 && !isLoadingPageData && (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">{activeFilter === 'all' ? "Aucune tâche." : "Aucune tâche pour ce filtre."}</p>
            <p className="text-sm text-muted-foreground mt-2">{activeFilter === 'all' ? 'Cliquez "Nouvelle Tâche".' : "Essayez d'autres filtres."}</p>
          </div>
        )}
      </main>

      {!loadingProfile && userProfile && showPremiumPopup && !isUserPremium && (
        <PremiumPopup onClose={() => setShowPremiumPopup(false)} />
      )}
      {!loadingProfile && userProfile && (
        <FloatingActionButton
          onAddCategory={handleAddCategory} isUserPremium={isUserPremium}
          userCategories={categories} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory} 
        />
      )}

      {/* Dialogues : on passe la fonction handleAddTask/handleEditTask mise à jour */}
      {/* L'ouverture/fermeture d'AddTaskDialog est gérée par le composant lui-même ou par un état ici si besoin */}
      {/* Pour EditTaskDialog, on utilise l'état `editingTask` */}
      {editingTask && (
        <EditTaskDialog
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={editingTask} // Passe la tâche complète à éditer
          onEdit={handleEditTask} // La signature a été mise à jour
          categories={categories}
          isUserPremium={isUserPremium}
          profile={userProfile}
        />
      )}
    </div>
  );
};

export default Index;