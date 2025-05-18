// src/components/AddTaskDialog.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar as CalendarIcon, Star, ListChecks, Repeat, Lock, PanelRightOpen, X, GripVertical, ExternalLink as DetachIcon, Link2 as AttachIcon } from "lucide-react";
import React, { useState, FormEvent, useMemo, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Category, Subtask, Profile } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as LucideIcons from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import ShinyText from "./ShinyText";
import { AnimatePresence, motion, useDragControls, PanInfo } from "framer-motion"; // Ajout de PanInfo
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from '@/hooks/use-media-query';

const NO_CATEGORY_VALUE = "__NO_CATEGORY__";
const URGENCY_LEVELS = 4;
const ADVANCED_PANEL_WIDTH = 280; // Largeur du panneau en pixels
const ADVANCED_PANEL_MIN_HEIGHT = 300; // Hauteur minimale pour le calcul de position

interface AddTaskDialogProps {
  onAdd: (
    title: string, description: string, date: Date, categoryId?: string, urgency?: number,
    subtasks?: Subtask[], recurrenceRule?: string
  ) => void;
  categories: Category[];
  isUserPremium: boolean; // Gardé pour des vérifications rapides
  profile: Profile | null;
}

export function AddTaskDialog({ onAdd, categories, isUserPremium: propIsUserPremium, profile }: AddTaskDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [urgency, setUrgency] = useState<number>(0);
  const { toast } = useToast();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [subtasksInput, setSubtasksInput] = useState("");
  const [recurrenceRuleInput, setRecurrenceRuleInput] = useState("");

  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [isPanelDetached, setIsPanelDetached] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 }); // Sera initialisé lors du détachement
  
  const advancedPanelRef = useRef<HTMLDivElement>(null); // Pour le panneau lui-même
  const dialogContentRef = useRef<HTMLDivElement>(null); // Pour le DialogContent
  const dragControls = useDragControls();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isUserPremium = useMemo(() => profile?.is_premium || false, [profile, propIsUserPremium]);
  const canAddSubtasks = useMemo(() => isUserPremium && profile?.enable_subtasks, [isUserPremium, profile]);
  const canAddRecurrence = useMemo(() => isUserPremium && profile?.enable_smart_recurrence, [isUserPremium, profile]);
  const canUseDetachablePanel = isDesktop && (canAddSubtasks || canAddRecurrence || !isUserPremium);

  const resetForm = () => {
    setTitle(""); setDescription(""); setDate(undefined); setSelectedCategoryId(undefined);
    setUrgency(0); setSubtasksInput(""); setRecurrenceRuleInput("");
    setShowAdvancedPanel(false);
    setIsPanelDetached(false);
    // panelPosition sera réinitialisé au prochain détachement
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) { toast({ title: "Erreur", description: "Titre et date requis.", variant: "destructive" }); return; }
    const categoryIdToSend = selectedCategoryId === NO_CATEGORY_VALUE ? undefined : selectedCategoryId;
    const urgencyToSend = isUserPremium ? urgency : undefined;
    let subtasksToSend: Subtask[] | undefined = undefined;
    if (canAddSubtasks && subtasksInput.trim() !== "") {
      subtasksToSend = subtasksInput.split('\n').map(line => line.trim()).filter(line => line !== "").map(line => ({ id: crypto.randomUUID(), title: line, is_completed: false }));
    }
    const recurrenceRuleToSend = (canAddRecurrence && recurrenceRuleInput.trim() !== "") ? recurrenceRuleInput.trim() : undefined;
    onAdd(title, description, date, categoryIdToSend, urgencyToSend, subtasksToSend, recurrenceRuleToSend);
    resetForm(); setDialogOpen(false);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setDialogOpen(isOpen); if (!isOpen) resetForm();
  };





const toggleDetachPanel = () => {
  if (!isDesktop) return;
  
  if (isPanelDetached) { // Si on RATTACHE
      setIsPanelDetached(false);
  } else { // Si on DÉTACHE
      let initialX = 0;
      let initialY = 0;
      // Offset négatif pour que le panneau détaché commence *avant* le bord droit du dialogue,
      // le faisant ainsi se superposer. Ajustez -50 selon vos préférences.
      // Une valeur plus grande (ex: -100) le superposera davantage.
      // Une valeur plus petite (ex: -20) le superposera moins.
      const overlapAmount = -300; // De combien de pixels le panneau détaché doit-il chevaucher vers l'intérieur ?

      if (dialogContentRef.current) {
          const dialogRect = dialogContentRef.current.getBoundingClientRect();

          // Positionner pour qu'il chevauche le bord droit du dialogue
          initialX = dialogRect.right - ADVANCED_PANEL_WIDTH + overlapAmount;
          // Vous pouvez aussi ajouter un petit décalage vertical si besoin:
          initialY = dialogRect.top + 20; // Commence 20px en dessous du haut du dialogue

          // --- Vérifications pour rester dans la fenêtre ---
          const viewportPadding = 20; // Marge minimale par rapport aux bords de la fenêtre

          // Ajustement pour X (gauche et droite)
          if (initialX + ADVANCED_PANEL_WIDTH > window.innerWidth - viewportPadding) {
              initialX = window.innerWidth - ADVANCED_PANEL_WIDTH - viewportPadding; // Coller au bord droit
          }
          if (initialX < viewportPadding) {
              initialX = viewportPadding; // Coller au bord gauche
          }

          // Ajustement pour Y (haut et bas)
          const panelHeightEstimate = Math.max(ADVANCED_PANEL_MIN_HEIGHT, advancedPanelRef.current?.offsetHeight || ADVANCED_PANEL_MIN_HEIGHT);
          if (initialY + panelHeightEstimate > window.innerHeight - viewportPadding) {
              initialY = window.innerHeight - panelHeightEstimate - viewportPadding; // Coller au bord bas
          }
          if (initialY < viewportPadding) {
              initialY = viewportPadding; // Coller au bord haut
          }

      } else {
          // Fallback (si la référence au dialogue n'est pas disponible)
          initialX = window.innerWidth - ADVANCED_PANEL_WIDTH - 20; // Proche du bord droit
          initialY = 100; // Un peu en dessous du haut de la page
      }
      
      setPanelPosition({ x: initialX, y: initialY });
      setIsPanelDetached(true);
  }
};





  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {

    setPanelPosition(prevPos => ({ 
        x: prevPos.x + info.offset.x, 
        y: prevPos.y + info.offset.y 
    }));
  };
  
  const urgencyColors = ["bg-green-500", "bg-yellow-500", "bg-orange-500", "bg-red-500"];
  const urgencyLabels = ["Pas urgent", "Normal", "Important", "Très urgent"];
  const urgencyBarHeights = ["h-2", "h-3", "h-4", "h-5"];

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#1111] border border-[#637a7a] text-[#637a7a] text-base font-medium px-4 py-2 rounded-full shadow-sm backdrop-blur-sm hover:scale-105 transition-all duration-300 w-fit">
          <Plus size={20} />
          <ShinyText text="Ajouter une tâche" disabled={false} speed={3} className='custom-class' />
        </Button>
      </DialogTrigger>
      <DialogContent
        ref={dialogContentRef} // Référence au DialogContent
        className={cn(
          "sm:max-w-[425px] transition-all duration-300 ease-in-out overflow-visible",
          showAdvancedPanel && canUseDetachablePanel && !isPanelDetached && "sm:max-w-[750px] md:max-w-[800px]"
      )}>
        {/* Ce div est le conteneur pour le formulaire principal ET le panneau attaché */}
        <motion.div layout className={cn("flex flex-row gap-0")}> {/* Ajout de motion.div layout */}
          <div className={cn(
            "flex-grow transition-all duration-300 ease-in-out",
            showAdvancedPanel && canUseDetachablePanel && !isPanelDetached && "md:pr-6"
          )}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">Nouvelle tâche</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {/* Champs Titre, Description, Date, Catégorie, Urgence */}
               <div className="space-y-1">
                    <Label htmlFor="task-title">Titre</Label>
                    <Input id="task-title" placeholder="Titre de la tâche" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea id="task-description" placeholder="Description (optionnelle)" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                    <Label htmlFor="task-date-trigger">Date</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                        <Button variant={"outline"} id="task-date-trigger" className={cn("w-full justify-start text-left font-normal h-11", !date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={(d) => {setDate(d); setCalendarOpen(false);}} initialFocus disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() -1))} locale={fr} />
                        </PopoverContent>
                    </Popover>
                    </div>
                    <div className="space-y-1">
                    <Label htmlFor="task-category">Catégorie</Label>
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger id="task-category" className="h-11"><SelectValue placeholder="Choisir..." /></SelectTrigger>
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
                <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="task-urgency-container-horizontal">Niveau d'urgence</Label>
                        {isUserPremium && ( <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 flex items-center"><Star size={12} className="mr-1" /> Premium</span> )}
                    </div>
                    <div className="relative">
                        <div id="task-urgency-container-horizontal" className="flex items-end justify-center space-x-1.5 h-8 pt-2">
                            {Array.from({ length: URGENCY_LEVELS }).map((_, index) => (
                                <button type="button" key={index} onClick={() => { if (isUserPremium) setUrgency(index); }} disabled={!isUserPremium}
                                    className={cn("w-5 rounded-sm transition-all duration-150 ease-in-out", urgencyBarHeights[index], "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                                        index <= urgency && isUserPremium ? urgencyColors[index] : "bg-muted", !isUserPremium && "bg-gray-300 dark:bg-gray-600", isUserPremium && index > urgency && "hover:bg-muted/80"
                                    )} aria-label={`Niveau d'urgence ${index + 1} - ${urgencyLabels[index]}`} />
                            ))}
                        </div>
                        {!isUserPremium && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-md cursor-not-allowed -top-1"
                                onClick={() => { toast({ title: "Fonctionnalité Premium", description: "Passez à Premium pour définir l'urgence."}); }}>
                                <Lock size={24} className="text-muted-foreground mb-1" />
                                <p className="text-xs text-center font-medium text-muted-foreground">Urgence (Premium)</p>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{isUserPremium ? urgencyLabels[urgency] : "Niveau d'urgence (Premium)"}</p>
                </div>

              {canUseDetachablePanel && (
                <div className="pt-3 border-t mt-3">
                  <Button type="button" variant="outline" className="w-full justify-center text-sm"
                    onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}>
                    <PanelRightOpen size={16} className="mr-2" />
                    {showAdvancedPanel ? (isPanelDetached ? "Masquer le panneau avancé" : "Masquer options") : "Options avancées"}
                    {!isUserPremium && <Star size={14} className="ml-2 text-yellow-500" />}
                  </Button>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
                <Button type="submit" className="h-11 text-base font-medium">Ajouter la tâche</Button>
              </div>
            </form>
          </div>

          {/* PANNEAU AVANCÉ ATTACHÉ */}
          {canUseDetachablePanel && !isPanelDetached && showAdvancedPanel && (
            <motion.div
              key="advanced-panel-attached"
              layout // Important pour l'animation de la largeur du formulaire principal
              initial={{ width: 0, opacity: 0, marginLeft: 0 }}
              animate={{ width: `${ADVANCED_PANEL_WIDTH}px`, opacity: 1, marginLeft: "1.5rem" }}
              exit={{ width: 0, opacity: 0, marginLeft: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-muted/50 p-4 rounded-lg border-l overflow-y-auto space-y-3 custom-scrollbar relative"
              style={{ maxHeight: 'calc(100vh - 200px)' }} // Hauteur max pour le mode attaché
            >
              <AdvancedPanelContent
                onClose={() => setShowAdvancedPanel(false)}
                onToggleDetach={toggleDetachPanel}
                isDetached={false}
                isDesktop={isDesktop}
                canAddSubtasks={canAddSubtasks} subtasksInput={subtasksInput} setSubtasksInput={setSubtasksInput}
                canAddRecurrence={canAddRecurrence} recurrenceRuleInput={recurrenceRuleInput} setRecurrenceRuleInput={setRecurrenceRuleInput}
                isUserPremium={isUserPremium} dragControls={dragControls}
              />
            </motion.div>
          )}
        </motion.div> {/* Fin du motion.div flex principal */}

        {/* PANNEAU AVANCÉ DÉTACHÉ - Rendu en dehors du flux normal du dialogue */}
        {/* Il est un frère du motion.div flex principal, à l'intérieur de DialogContent */}
        <AnimatePresence>
          {canUseDetachablePanel && isPanelDetached && showAdvancedPanel && (
            <motion.div
              key="advanced-panel-detached"
              ref={advancedPanelRef}
              drag
              dragListener={false}
              dragControls={dragControls}
              dragMomentum={false}
              onDragEnd={handleDragEnd} // Mettre à jour la position après le drag
              dragConstraints={{ // Contraintes pour ne pas sortir de l'écran
                left: 0,
                right: window.innerWidth - ADVANCED_PANEL_WIDTH,
                top: 0,
                bottom: window.innerHeight - ADVANCED_PANEL_MIN_HEIGHT,
              }}
              initial={{ opacity: 0, scale: 0.9, x: panelPosition.x, y: panelPosition.y }}
              animate={{ opacity: 1, scale: 1, x: panelPosition.x, y: panelPosition.y }}
              exit={{ opacity: 0, scale: 0.9, x: panelPosition.x, y: panelPosition.y -30, transition: { duration: 0.2 } }} // Petite animation de sortie vers le haut
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                position: 'fixed', // Important pour le détachement
                width: `${ADVANCED_PANEL_WIDTH}px`,
                // x et y sont gérés par framer-motion via les props initial/animate
                zIndex: 100, 
              }}
              className="bg-card p-4 rounded-lg border shadow-2xl overflow-y-auto space-y-3 custom-scrollbar"
            >
              <AdvancedPanelContent
                onClose={() => { setShowAdvancedPanel(false); setIsPanelDetached(false);}} // Si on ferme le panneau détaché, il se cache et se rattache logiquement
                onToggleDetach={toggleDetachPanel}
                isDetached={true}
                isDesktop={isDesktop}
                canAddSubtasks={canAddSubtasks} subtasksInput={subtasksInput} setSubtasksInput={setSubtasksInput}
                canAddRecurrence={canAddRecurrence} recurrenceRuleInput={recurrenceRuleInput} setRecurrenceRuleInput={setRecurrenceRuleInput}
                isUserPremium={isUserPremium} dragControls={dragControls}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Composant séparé pour le contenu du panneau avancé (identique à la version précédente)
interface AdvancedPanelContentProps {
  onClose: () => void;
  onToggleDetach: () => void;
  isDetached: boolean;
  isDesktop: boolean;
  canAddSubtasks: boolean;
  subtasksInput: string;
  setSubtasksInput: (value: string) => void;
  canAddRecurrence: boolean;
  recurrenceRuleInput: string;
  setRecurrenceRuleInput: (value: string) => void;
  isUserPremium: boolean;
  dragControls: any;
}

function AdvancedPanelContent({
  onClose, onToggleDetach, isDetached, isDesktop,
  canAddSubtasks, subtasksInput, setSubtasksInput,
  canAddRecurrence, recurrenceRuleInput, setRecurrenceRuleInput,
  isUserPremium, dragControls
}: AdvancedPanelContentProps) {
  return (
    <>
      <div
        className="flex justify-between items-center mb-2 pb-2 border-b"
        onPointerDown={(event) => {if (isDetached && isDesktop) dragControls.start(event);}} // Drag seulement si détaché et desktop
        style={{ cursor: (isDetached && isDesktop) ? 'grab' : 'default' }}
      >
        <div className="flex items-center">
          {(isDetached && isDesktop) && <GripVertical size={18} className="mr-2 text-muted-foreground cursor-grab" />}
          <h3 className="text-md font-semibold">Options Avancées</h3>
        </div>
        <div className="flex items-center">
            {isDesktop && (
                <Button variant="ghost" size="icon" onClick={onToggleDetach} className="h-7 w-7 mr-1" title={isDetached ? "Rattacher le panneau" : "Détacher le panneau"}>
                    {isDetached ? <AttachIcon size={16} /> : <DetachIcon size={16} />}
                </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                <X size={16} />
            </Button>
        </div>
      </div>

      {canAddSubtasks && (
        <div className="space-y-1.5">
          <Label htmlFor="task-subtasks-panel" className="text-sm font-medium">Sous-tâches</Label>
          <Textarea id="task-subtasks-panel" placeholder="Une par ligne..." value={subtasksInput}
            onChange={(e) => setSubtasksInput(e.target.value)}
            className="min-h-[90px] resize-y text-xs bg-background/70 border-border/50" />
          <div className="flex items-center text-xs text-muted-foreground"><ListChecks size={14} className="mr-1.5" /> Pour Premium.</div>
        </div>
      )}
      {!canAddSubtasks && !isUserPremium && (
        <div className="space-y-1.5 opacity-70">
          <Label htmlFor="task-subtasks-panel-disabled" className="text-sm font-medium">Sous-tâches (Premium)</Label>
          <Textarea id="task-subtasks-panel-disabled" placeholder="Divisez votre tâche..." className="min-h-[90px] resize-y text-xs bg-muted cursor-not-allowed border-border/50" disabled />
          <div className="flex items-center text-xs text-muted-foreground"><Lock size={14} className="mr-1.5" /> Devenez Premium.</div>
        </div>
      )}

      <Separator className="my-3" />

      {canAddRecurrence && (
        <div className="space-y-1.5">
          <Label htmlFor="task-recurrence-panel" className="text-sm font-medium">Récurrence</Label>
          <Input id="task-recurrence-panel" placeholder="Ex: 'Tous les lundis'" value={recurrenceRuleInput}
            onChange={(e) => setRecurrenceRuleInput(e.target.value)} className="h-9 text-xs bg-background/70 border-border/50" />
          <div className="flex items-center text-xs text-muted-foreground"><Repeat size={14} className="mr-1.5" /> Pour Premium.</div>
        </div>
      )}
      {!canAddRecurrence && !isUserPremium && (
        <div className="space-y-1.5 opacity-70">
          <Label htmlFor="task-recurrence-panel-disabled" className="text-sm font-medium">Récurrence (Premium)</Label>
          <Input id="task-recurrence-panel-disabled" placeholder="Planifiez..." className="h-9 text-xs bg-muted cursor-not-allowed border-border/50" disabled />
          <div className="flex items-center text-xs text-muted-foreground"><Lock size={14} className="mr-1.5" /> Devenez Premium.</div>
        </div>
      )}
    </>
  );
}