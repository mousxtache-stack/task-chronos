// src/components/EditTaskDialog.tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// MODIFIÉ: Ajout de Eye, EyeOff, Settings2
import { PencilIcon, Calendar as CalendarIcon, Wrench, ListChecks, Repeat, Lock, Star, Eye, EyeOff, Settings2 } from "lucide-react";
import { useState, useEffect, FormEvent, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Task, Category, Subtask, Profile } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as LucideIcons from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion"; // Pour l'animation

const NO_CATEGORY_VALUE = "__NO_CATEGORY__";
const URGENCY_LEVELS = 4;

interface EditTaskDialogProps { /* ... (props inchangées) ... */
    task: Task;
    onEdit: (id: string, title: string, description: string, date: Date, categoryId?: string, urgency?: number, subtasks?: Subtask[], is_pinned?: boolean, recurrence_rule?: string) => void;
    categories: Category[];
    isUserPremium: boolean;
    profile: Profile | null;
    trigger?: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export function EditTaskDialog({ task, onEdit, categories, isUserPremium: propIsUserPremium, profile, trigger, isOpen, onClose }: EditTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(NO_CATEGORY_VALUE);
  const { toast } = useToast();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [subtasksInput, setSubtasksInput] = useState("");
  const [recurrenceRuleInput, setRecurrenceRuleInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  // NOUVEL ÉTAT pour la visibilité des options avancées
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const IS_URGENCY_EDITING_IN_MAINTENANCE = true;

  const isUserPremium = useMemo(() => profile?.is_premium || false, [profile, propIsUserPremium]);
  const canEditSubtasks = useMemo(() => isUserPremium && profile?.enable_subtasks, [isUserPremium, profile]);
  const canEditRecurrence = useMemo(() => isUserPremium && profile?.enable_smart_recurrence, [isUserPremium, profile]);
  const canEditPinned = useMemo(() => isUserPremium && profile?.enable_pinned_tasks, [isUserPremium, profile]);

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDate(task.date ? new Date(task.date) : undefined);
      setSelectedCategoryId(task.categoryId || NO_CATEGORY_VALUE);
      setSubtasksInput(task.subtasks?.map(sub => sub.title).join('\n') || "");
      setRecurrenceRuleInput(task.recurrence_rule || "");
      setIsPinned(task.is_pinned || false);
      // Ne pas réinitialiser showAdvancedOptions ici pour qu'il conserve son état si l'utilisateur le rouvre
    } else if (!isOpen) {
        setShowAdvancedOptions(false); // Réinitialiser si le dialogue est fermé
    }
  }, [task, isOpen]);

  const handleSubmit = (e: FormEvent) => { /* ... (logique de soumission inchangée) ... */
    e.preventDefault();
    if (!title.trim() || !date) { toast({ title: "Erreur", description: "Titre et date requis.", variant: "destructive" }); return; }
    const categoryIdToSend = selectedCategoryId === NO_CATEGORY_VALUE ? undefined : selectedCategoryId;
    let subtasksToSend: Subtask[] | undefined = undefined;
    if (canEditSubtasks && subtasksInput.trim() !== "") {
        const existingSubtasksById = new Map(task.subtasks?.map(st => [st.title.toLowerCase(), st]));
        subtasksToSend = subtasksInput.split('\n').map(line => line.trim()).filter(line => line !== "").map(line => {
            const existingSubtask = existingSubtasksById.get(line.toLowerCase());
            return { id: existingSubtask?.id || crypto.randomUUID(), title: line, is_completed: existingSubtask?.is_completed || false };
        });
    } else if (canEditSubtasks) { subtasksToSend = []; }
    const recurrenceRuleToSend = (canEditRecurrence && recurrenceRuleInput.trim() !== "") ? recurrenceRuleInput.trim() : (canEditRecurrence ? null : undefined);
    const isPinnedToSend = canEditPinned ? isPinned : task.is_pinned; // Conserver l'état précédent si non modifiable
    onEdit(task.id, title, description, date, categoryIdToSend, task.urgency, subtasksToSend, isPinnedToSend, recurrenceRuleToSend);
    onClose();
  };

  const urgencyColors = [ "bg-green-500", "bg-yellow-500", "bg-orange-500", "bg-red-500" ];
  const urgencyLabels = [ "Pas urgent", "Normal", "Important", "Très urgent" ];
  const urgencyBarHeights = [ "h-2", "h-3", "h-4", "h-5" ];

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => { if (!openStatus) onClose?.(); }}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Modifier la tâche</DialogTitle>
          <DialogDescription>Modifiez le titre, la description, la date et la catégorie.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Champs Titre, Description, Date, Catégorie (inchangés) */}
          {/* ... */}
          <div className="space-y-1">
            <Label htmlFor={`edit-task-title-${task.id}`}>Titre</Label>
            <Input id={`edit-task-title-${task.id}`} value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-task-description-${task.id}`}>Description</Label>
            <Textarea id={`edit-task-description-${task.id}`} value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px] resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={`edit-task-date-trigger-${task.id}`}>Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} id={`edit-task-date-trigger-${task.id}`} className={cn("w-full justify-start text-left font-normal h-11", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : <span>Choisir</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={date} onSelect={(d) => {setDate(d); setCalendarOpen(false);}} initialFocus locale={fr} /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-task-category-${task.id}`}>Catégorie</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger id={`edit-task-category-${task.id}`} className="h-11"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY_VALUE}><span className="text-muted-foreground">Aucune</span></SelectItem>
                  {categories?.map((cat) => {
                    if (!cat || cat.id === "") return null;
                    const Icon = cat.logo && (LucideIcons as any)[cat.logo] ? (LucideIcons as any)[cat.logo] as LucideIcons.LucideIcon : null;
                    return (<SelectItem key={cat.id} value={String(cat.id)}><div className="flex items-center">{Icon && <Icon className="mr-2 h-4 w-4" />} {cat.name}</div></SelectItem>);
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section Urgence (inchangée) */}
          {/* ... (votre code pour l'urgence) ... */}
           <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between mb-1">
                <Label htmlFor={`edit-task-urgency-container-${task.id}`}>Niveau d'urgence</Label>
                {IS_URGENCY_EDITING_IN_MAINTENANCE && (<span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-700 dark:text-blue-300 flex items-center"><Wrench size={12} className="mr-1" /> Maintenance</span>)}
            </div>
            <div className="relative">
                <div id={`edit-task-urgency-container-${task.id}`} className="flex items-end justify-center space-x-1.5 h-8 pt-2">
                    {Array.from({ length: URGENCY_LEVELS }).map((_, index) => (
                        <div key={index} className={cn("w-5 rounded-sm", urgencyBarHeights[index], (typeof task.urgency === 'number' && index <= task.urgency) ? urgencyColors[task.urgency] : "bg-gray-300 dark:bg-gray-700")} />
                    ))}
                </div>
                {IS_URGENCY_EDITING_IN_MAINTENANCE && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-md cursor-not-allowed -top-1" title="Modification en maintenance."
                        onClick={() => { toast({ title: "Maintenance", description: "Modification de l'urgence indisponible."}); }}>
                        <Wrench size={24} className="text-muted-foreground mb-1" />
                        <p className="text-xs text-center font-medium text-muted-foreground">En maintenance</p>
                    </div>
                )}
            </div>
            <p className="text-xs text-muted-foreground text-center pt-1">
                {IS_URGENCY_EDITING_IN_MAINTENANCE ? (typeof task.urgency === 'number' ? `Actuel: ${urgencyLabels[task.urgency]}` : "Indisponible") : (typeof task.urgency === 'number' ? urgencyLabels[task.urgency] : "Non défini")}
            </p>
          </div>

          {/* Section Épingler (toujours visible si modifiable, car c'est un simple switch) */}
          {canEditPinned && (
            <div className="flex items-center justify-between space-x-2 pt-3 border-t mt-3">
              <Label htmlFor={`edit-task-pinned-${task.id}`} className="flex flex-col space-y-1">
                <span>Épingler la tâche</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">Garder en haut de liste.</span>
              </Label>
              <Switch id={`edit-task-pinned-${task.id}`} checked={isPinned} onCheckedChange={setIsPinned} />
            </div>
          )}
          {!canEditPinned && isUserPremium === false && ( /* Placeholder si non-premium */
            <div className="flex items-center justify-between space-x-2 pt-3 border-t mt-3 opacity-60 cursor-not-allowed">
              <Label htmlFor={`edit-task-pinned-disabled-${task.id}`} className="flex flex-col space-y-1">
                <span>Épingler la tâche (Premium)</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">Garder en haut de liste.</span>
              </Label>
              <Switch id={`edit-task-pinned-disabled-${task.id}`} disabled checked={task.is_pinned || false} />
            </div>
          )}

          {/* NOUVEAU: Bouton pour afficher/cacher les options avancées (Sous-tâches, Récurrence) */}
          {(canEditSubtasks || canEditRecurrence || !isUserPremium) && (
             <div className="pt-3 border-t mt-3">
                <Button type="button" variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                    {showAdvancedOptions ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                    {showAdvancedOptions ? "Cacher sous-tâches & récurrence" : "Afficher sous-tâches & récurrence"}
                    {!isUserPremium && <Star size={14} className="ml-auto text-yellow-500" />}
                </Button>
            </div>
          )}

          <AnimatePresence>
            {showAdvancedOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-4"
              >
                {/* SECTION: Sous-tâches */}
                {canEditSubtasks && (
                  <div className="space-y-1 pt-2">
                    <Label htmlFor={`edit-task-subtasks-${task.id}`}>Sous-tâches (une par ligne)</Label>
                    <Textarea id={`edit-task-subtasks-${task.id}`} placeholder="Ex: Relire le document..." value={subtasksInput}
                      onChange={(e) => setSubtasksInput(e.target.value)} className="min-h-[80px] resize-y text-sm" />
                    <div className="flex items-center text-xs text-muted-foreground"><ListChecks size={14} className="mr-1.5" /> Modifiable (Premium).</div>
                  </div>
                )}
                {!canEditSubtasks && isUserPremium === false && (
                  <div className="space-y-1 pt-2 opacity-60 cursor-not-allowed">
                    <Label htmlFor={`edit-task-subtasks-disabled-${task.id}`}>Sous-tâches (Premium)</Label>
                    <Textarea id={`edit-task-subtasks-disabled-${task.id}`} value={task.subtasks?.map(s => s.title).join('\n') || ""} className="min-h-[80px] resize-y bg-muted/50 text-sm" disabled />
                    <div className="flex items-center text-xs text-muted-foreground"><Lock size={14} className="mr-1.5" /> Passez à Premium.</div>
                  </div>
                )}

                {/* SECTION: Règle de récurrence */}
                {canEditRecurrence && (
                  <div className="space-y-1 pt-2">
                    <Label htmlFor={`edit-task-recurrence-${task.id}`}>Règle de récurrence (avancé)</Label>
                    <Input id={`edit-task-recurrence-${task.id}`} placeholder="Ex: 'FREQ=WEEKLY;BYDAY=MO'" value={recurrenceRuleInput}
                      onChange={(e) => setRecurrenceRuleInput(e.target.value)} className="h-10 text-sm" />
                    <div className="flex items-center text-xs text-muted-foreground"><Repeat size={14} className="mr-1.5" /> Modifiable (Premium).</div>
                  </div>
                )}
                {!canEditRecurrence && isUserPremium === false && (
                  <div className="space-y-1 pt-2 opacity-60 cursor-not-allowed">
                    <Label htmlFor={`edit-task-recurrence-disabled-${task.id}`}>Récurrence (Premium)</Label>
                    <Input id={`edit-task-recurrence-disabled-${task.id}`} value={task.recurrence_rule || ""} className="h-10 bg-muted/50 text-sm" disabled />
                    <div className="flex items-center text-xs text-muted-foreground"><Lock size={14} className="mr-1.5" /> Passez à Premium.</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="h-11 text-base font-medium">Enregistrer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}