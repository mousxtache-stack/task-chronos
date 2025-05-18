// src/components/TaskCard.tsx
import React, { useState, useMemo } from "react";
import { Task, Category, Subtask, Profile } from "@/lib/types";
// MODIFIÉ: Icônes nécessaires
import { Check, Trash2, BookOpen, PencilIcon, Eye, EyeOff, AlertTriangle, PlayCircle, ListChecks, Pin as PinIconLucide } from "lucide-react";
import * as LucideIcons from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLayout } from "@/lib/context/LayoutContext";
import { EditTaskDialog } from "./EditTaskDialog";
import { motion } from "framer-motion";
import { useFocusTimer } from "@/lib/context/FocusTimerContext";
import { PremiumFeatureModal } from "./PremiumFeatureModal";
import { Checkbox } from "@/components/ui/checkbox"; // Pour les sous-tâches
import { Button } from "@/components/ui/button";   // Pour le bouton d'épinglage (si nécessaire pour l'action)
// import { format } from "date-fns"; // Retiré si la date n'est plus affichée ici directement
// import { fr } from "date-fns/locale";

const HOMEWORK_CATEGORY_ID = "system_category_homework_id_unique";
const urgencyIconColors = [
  "text-green-500",
  "text-yellow-500",
  "text-orange-500",
  "text-red-500"
];

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    title: string,
    description: string,
    date: Date,
    categoryId?: string,
    urgency?: number,
    subtasks?: Subtask[],
    is_pinned?: boolean,
    recurrence_rule?: string
  ) => void;
  categories: Category[];
  isUserPremium: boolean;
  profile: Profile | null;
  onUpdateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
  onTogglePin: (taskId: string) => void;
}

export function TaskCard({
  task,
  onComplete,
  onDelete,
  onEdit,
  categories,
  isUserPremium: propIsUserPremium,
  profile,
  onUpdateSubtask,
  onTogglePin,
}: TaskCardProps) {
  const { layoutMode } = useLayout();
  const isGridMode = layoutMode === "grid";
  const [showControls, setShowControls] = useState(false);
  const [showAllSubtasks, setShowAllSubtasks] = useState(false);

  const { startTimer, currentTask: activeFocusTask, isSessionActive } = useFocusTimer();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isUserPremium = useMemo(() => profile?.is_premium || false, [profile]);
  const canUseFocusMode = isUserPremium;
  const canShowSubtasks = useMemo(() => isUserPremium && profile?.enable_subtasks, [isUserPremium, profile]);
  const canPinTasks = useMemo(() => isUserPremium && profile?.enable_pinned_tasks, [isUserPremium, profile]);

  const handleStartFocus = () => {
    if (!canUseFocusMode) {
      setShowPremiumModal(true);
      return;
    }
    startTimer(task);
  };

  const isThisTaskInFocusSession = isSessionActive && activeFocusTask?.id === task.id;

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: task.completed ? 0.6 : 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } }
  };

  const taskCategoryDetails = categories.find(cat => cat.id === task.categoryId);
  const isTaskHomework = task.categoryId === HOMEWORK_CATEGORY_ID;

  const subtasksToDisplay = useMemo(() => {
    if (!task.subtasks || task.subtasks.length === 0) return [];
    if (showAllSubtasks || task.subtasks.length <= 2) return task.subtasks;
    return task.subtasks.slice(0, 2);
  }, [task.subtasks, showAllSubtasks]);

  return (
    <>
      <motion.div
        layout
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          "task-card p-4 rounded-lg shadow-md border", // Structure de classe principale conservée
          task.completed ? "bg-muted/50 border-dashed opacity-70" : "bg-card",
          isTaskHomework && !task.completed && "border-l-4 border-blue-500",
          isThisTaskInFocusSession && !task.completed && "ring-2 ring-primary shadow-lg shadow-primary/20",
          canPinTasks && task.is_pinned && !task.completed && "border-primary border-2 shadow-primary/25"
        )}
      >
        {/* VOTRE STRUCTURE ORIGINALE POUR LE CONTENU ET LES CONTRÔLES */}
        <div className={cn(isGridMode ? "block" : "flex items-start justify-between gap-2")}>
          {/* Section principale du contenu de la tâche */}
          <div className={cn(isGridMode ? "mb-4" : "flex-1 min-w-0")}>
            <div className="flex items-center gap-2 mb-1">
              {/* Icône d'épinglage, discrètement ajoutée au début si applicable */}
              {canPinTasks && task.is_pinned && (
                <PinIconLucide size={isGridMode ? 18 : 14} className="text-primary flex-shrink-0" />
              )}
              {isTaskHomework && (!canPinTasks || !task.is_pinned) && (
                <BookOpen size={isGridMode ? 20 : 16} className="text-blue-500 flex-shrink-0" />
              )}
              {taskCategoryDetails?.logo && !isTaskHomework && (!canPinTasks || !task.is_pinned) && (LucideIcons as any)[taskCategoryDetails.logo] && (
                React.createElement((LucideIcons as any)[taskCategoryDetails.logo], {
                  size: isGridMode ? 20 : 16, className: "text-muted-foreground flex-shrink-0",
                })
              )}
              <h3 className={cn("font-medium truncate", isGridMode && "task-title text-lg", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </h3>
              {typeof task.urgency === 'number' && task.urgency >= 1 && task.urgency < urgencyIconColors.length && !task.completed && (
                <AlertTriangle size={isGridMode ? 16 : 14} className={cn("ml-1 flex-shrink-0", urgencyIconColors[task.urgency])} aria-label={`Urgence ${task.urgency}`} />
              )}
            </div>

            {task.description && (
              <p className={cn("text-sm text-muted-foreground mt-1", isGridMode && "task-description text-base", task.completed && "line-through")}>
                 {task.description}
              </p>
            )}

            {taskCategoryDetails && (
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block",
                  task.completed ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                 : (isTaskHomework ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                   : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/80"),
                  isGridMode && "task-badge"
              )}>
                {taskCategoryDetails.name}
              </span>
            )}

            {/* Affichage des sous-tâches, s'insère ici avant la fin du div de contenu principal */}
            {canShowSubtasks && task.subtasks && task.subtasks.length > 0 && !task.completed && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-xs font-medium text-muted-foreground flex items-center">
                    <ListChecks size={14} className="mr-1.5" /> Sous-étapes ({task.subtasks.filter(s => s.is_completed).length}/{task.subtasks.length})
                  </h4>
                  {task.subtasks.length > 2 && (
                    <Button variant="link" size="xs" className="text-xs h-auto p-0" onClick={() => setShowAllSubtasks(!showAllSubtasks)}>
                        {showAllSubtasks ? "Moins" : "Voir tout"}
                    </Button>
                  )}
                </div>
                <ul className="space-y-1.5 pl-1">
                  {subtasksToDisplay.map((sub) => (
                    <li key={sub.id} className="flex items-center text-sm group">
                      <Checkbox id={`subtask-${task.id}-${sub.id}`} checked={sub.is_completed}
                        onCheckedChange={(checked) => onUpdateSubtask(task.id, sub.id, !!checked)}
                        className="mr-2 h-4 w-4 border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                        aria-label={`Sous-tâche ${sub.title}`} />
                      <label htmlFor={`subtask-${task.id}-${sub.id}`} className={cn("flex-grow cursor-pointer transition-colors group-hover:text-foreground/90",
                          sub.is_completed ? "line-through text-muted-foreground/80" : "text-foreground/80"
                        )}>
                        {sub.title}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div> {/* Fin de la section de contenu principale */}

          {/* Section des contrôles de la tâche (VOTRE STRUCTURE ORIGINALE) */}
          <div className={cn(isGridMode ? "flex items-center gap-2 mt-3 justify-end w-full" : "flex items-center gap-1 flex-shrink-0",)}>
            {/* Bouton Terminer */}
            <button onClick={() => onComplete(task.id)} aria-label={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
              className={cn("p-1 rounded-full hover:bg-secondary transition-colors", isGridMode && "p-2")}
              title={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}>
              <Check size={isGridMode ? 22 : 16} className={cn(task.completed ? "text-primary" : "text-muted-foreground")} />
            </button>

            {/* Bouton Épingler (s'insère ici) */}
            {canPinTasks && (
                <Button variant="ghost" size="icon"
                    className={cn("p-1 rounded-full hover:bg-secondary transition-colors h-auto w-auto", isGridMode && "p-2")}
                    onClick={() => onTogglePin(task.id)}
                    title={task.is_pinned ? "Désépingler" : "Épingler cette tâche"}
                    disabled={!isUserPremium} // Désactiver si pas premium
                >
                    <PinIconLucide size={isGridMode ? 22 : 15} className={cn(task.is_pinned ? "text-primary fill-primary/30" : "text-muted-foreground hover:text-primary/80")} />
                </Button>
            )}

            {/* Bouton Focus */}
            {!task.completed && (
              <button onClick={handleStartFocus} aria-label={isThisTaskInFocusSession ? "Tâche en mode focus" : "Démarrer le mode focus"}
                className={cn("p-1 rounded-full hover:bg-secondary transition-colors", isGridMode && "p-2", isThisTaskInFocusSession && canUseFocusMode && "bg-primary/20 hover:bg-primary/30")}
                title={isThisTaskInFocusSession && canUseFocusMode ? "En mode focus" : "Démarrer le mode focus"}
                disabled={isThisTaskInFocusSession && canUseFocusMode}>
                <PlayCircle size={isGridMode ? 22 : 16} className={cn(isThisTaskInFocusSession && canUseFocusMode ? "text-primary" : canUseFocusMode ? "text-green-500" : "text-muted-foreground opacity-60")} />
              </button>
            )}

            {/* Bouton Afficher/Cacher Options */}
            <button onClick={toggleControls} aria-label={showControls ? "Cacher les options" : "Afficher les options"}
              className={cn("p-1 rounded-full hover:bg-secondary transition-colors", isGridMode && "p-2")}
              title={showControls ? "Cacher les options" : "Afficher les options"}>
              {showControls ? <Eye size={isGridMode ? 22 : 16} className="text-blue-500" /> : <EyeOff size={isGridMode ? 22 : 16} className="text-muted-foreground" />}
            </button>

            {/* Conteneur pour les boutons Modifier/Supprimer (VOTRE STRUCTURE ORIGINALE) */}
            <div className={cn("flex items-center gap-1 transition-all duration-300 ease-in-out transform",
                showControls ? "opacity-100 max-w-xs translate-x-0" : "opacity-0 max-w-0 overflow-hidden -translate-x-2 pointer-events-none"
              )}>
              {/* EditTaskDialog est appelé via son trigger */}
              <EditTaskDialog
                task={task}
                onEdit={onEdit} // La signature de onEdit est mise à jour
                categories={categories}
                isUserPremium={isUserPremium} // isUserPremium (dérivé de profile) est passé
                profile={profile} // profile complet est passé
                trigger={ // Votre trigger original
                  <button aria-label="Modifier la tâche" className={cn("p-1 rounded-full hover:bg-secondary transition-colors", isGridMode && "p-2")} title="Modifier la tâche">
                    <PencilIcon size={isGridMode ? 22 : 16} className="text-amber-500" />
                  </button>
                }
              />
              <button onClick={() => onDelete(task.id)} aria-label="Supprimer la tâche"
                className={cn("p-1 rounded-full hover:bg-destructive/10 transition-colors", isGridMode && "p-2")}
                title="Supprimer la tâche">
                <Trash2 size={isGridMode ? 22 : 16} className="text-destructive" />
              </button>
            </div>
          </div> {/* Fin de la section des contrôles */}
        </div> {/* Fin du div flex principal (isGridMode ? "block" : "flex items-start justify-between gap-2") */}
        {/* La date n'est pas présente dans votre code original, donc je ne l'ajoute pas pour l'instant au footer.
            Si vous souhaitez un footer, il faudrait l'ajouter ici, en dehors du div flex principal.
        */}
      </motion.div>

      <PremiumFeatureModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)}
        featureName="Mode Focus" premiumPagePath="/premiumpage" />

      {/* EditTaskDialog n'est plus contrôlé par isEditDialogOpen ici, mais par son propre trigger.
          Si vous aviez une raison de le contrôler avec un état externe, il faudrait le réintégrer.
          Pour l'instant, on se fie au trigger de EditTaskDialog.
      */}
    </>
  );
}