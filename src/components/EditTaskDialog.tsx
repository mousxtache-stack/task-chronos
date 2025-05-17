// src/components/EditTaskDialog.tsx
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
import { PencilIcon, Calendar as CalendarIcon, Wrench } from "lucide-react"; // Wrench pour maintenance
import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Task, Category } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as LucideIcons from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const NO_CATEGORY_VALUE = "__NO_CATEGORY__";
const URGENCY_LEVELS = 4;

interface EditTaskDialogProps {
  task: Task;
  onEdit: (
    id: string,
    title: string,
    description: string,
    date: Date,
    categoryId?: string,
    urgency?: number // On garde le paramètre, mais on passera l'urgence actuelle de la tâche
  ) => void;
  categories: Category[];
  isUserPremium: boolean; // On garde la prop, même si la fonctionnalité d'édition de l'urgence est en maintenance
  trigger?: React.ReactNode;
}

export function EditTaskDialog({ task, onEdit, categories, isUserPremium, trigger }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  // L'état 'urgency' n'est plus activement modifié par l'utilisateur dans ce mode "maintenance"
  // const [urgency, setUrgency] = useState<number>(0); 
  const { toast } = useToast(); // Gardé pour d'autres notifications potentielles
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Constante pour indiquer que la modification de l'urgence est en maintenance
  const IS_URGENCY_EDITING_IN_MAINTENANCE = true;

  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDate(task.date ? new Date(task.date) : undefined);
      setSelectedCategoryId(task.categoryId || NO_CATEGORY_VALUE);
      // Pas besoin d'initialiser un état 'urgency' modifiable si la fonction est en maintenance
    }
  }, [task, open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      toast({ title: "Erreur", description: "Veuillez remplir le titre et la date.", variant: "destructive" });
      return;
    }
    
    const categoryIdToSend = selectedCategoryId === NO_CATEGORY_VALUE ? undefined : selectedCategoryId;
    
    // Puisque la modification de l'urgence est en maintenance, on envoie toujours l'urgence actuelle de la tâche.
    // Le paramètre 'urgency' dans onEdit est toujours là pour la future réactivation.
    onEdit(task.id, title, description, date, categoryIdToSend, task.urgency);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const urgencyColors = [ "bg-green-500", "bg-yellow-500", "bg-orange-500", "bg-red-500" ];
  const urgencyLabels = [ "Pas urgent", "Normal", "Important", "Très urgent" ];
  const urgencyBarHeights = [ "h-2", "h-3", "h-4", "h-5" ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="icon" variant="ghost" className="rounded-full hover:bg-secondary transition-colors p-1" aria-label="Modifier la tâche">
            <PencilIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Modifier la tâche</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Champs Titre, Description, Date, Catégorie */}
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
                    {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={date} onSelect={(d) => {setDate(d); setCalendarOpen(false);}} initialFocus locale={fr} /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-task-category-${task.id}`}>Catégorie</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger id={`edit-task-category-${task.id}`} className="h-11"><SelectValue placeholder="Choisir une catégorie..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY_VALUE}><span className="text-muted-foreground">Aucune catégorie</span></SelectItem>
                  {categories?.map((cat) => {
                    if (!cat || cat.id === "") return null;
                    const Icon = cat.logo && (LucideIcons as any)[cat.logo] ? (LucideIcons as any)[cat.logo] as LucideIcons.LucideIcon : null;
                    return (<SelectItem key={cat.id} value={String(cat.id)}><div className="flex items-center">{Icon && <Icon className="mr-2 h-4 w-4" />} {cat.name}</div></SelectItem>);
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section Urgence - Toujours visible, mais floutée et marquée "En maintenance" */}
          <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor={`edit-task-urgency-container-${task.id}`}>Niveau d'urgence</Label>
                {/* Badge de maintenance, toujours visible si la fonctionnalité est en maintenance */}
                {IS_URGENCY_EDITING_IN_MAINTENANCE && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-700 dark:text-blue-300 flex items-center">
                      <Wrench size={12} className="mr-1" /> Maintenance
                  </span>
                )}
              </div>
              <div className="relative"> {/* Conteneur pour l'overlay */}
                {/* Structure des barres (visibles mais non interactives sous le flou) */}
                <div 
                  id={`edit-task-urgency-container-${task.id}`}
                  className="flex items-end justify-center space-x-1.5 h-8 pt-2"
                >
                  {Array.from({ length: URGENCY_LEVELS }).map((_, index) => (
                    <div // Remplacer button par div pour les rendre non cliquables
                      key={index}
                      className={cn(
                        "w-5 rounded-sm", // Garde la largeur
                        urgencyBarHeights[index], // Garde la hauteur
                        // Affiche la couleur de l'urgence actuelle de la tâche, ou une couleur neutre
                        (typeof task.urgency === 'number' && index <= task.urgency) 
                          ? urgencyColors[task.urgency] // Couleur de l'urgence actuelle
                          : "bg-gray-300 dark:bg-gray-700", // Couleur de fond pour les barres non actives
                      )}
                      aria-label={`Niveau d'urgence ${index + 1}`} // Peut être conservé pour la structure
                    />
                  ))}
                </div>
                {/* Overlay de maintenance, toujours visible si la constante est true */}
                {IS_URGENCY_EDITING_IN_MAINTENANCE && (
                  <div 
                    className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-md cursor-not-allowed -top-1"
                    title="La modification de l'urgence est actuellement en maintenance."
                    onClick={() => { // Optionnel: Informer l'utilisateur au clic
                        toast({ title: "Maintenance", description: "La modification du niveau d'urgence est temporairement indisponible."});
                    }}
                  >
                    <Wrench size={24} className="text-muted-foreground mb-1" />
                    <p className="text-xs text-center font-medium text-muted-foreground">
                        En maintenance
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center pt-1">
                {/* Affiche l'urgence actuelle de la tâche ou un message si en maintenance */}
                {IS_URGENCY_EDITING_IN_MAINTENANCE 
                  ? (typeof task.urgency === 'number' ? `Actuel: ${urgencyLabels[task.urgency]}` : "Modification indisponible")
                  : (typeof task.urgency === 'number' ? urgencyLabels[task.urgency] : "Non défini") 
                }
              </p>
            </div>

          <div className="flex justify-end space-x-2 pt-4">
            <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
            <Button type="submit" className="h-11 text-base font-medium">Enregistrer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}