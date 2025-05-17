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
import { Plus, Calendar as CalendarIcon, Star } from "lucide-react"; // Ajout de Star pour le badge Premium
import { useState, FormEvent } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Category } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as LucideIcons from 'lucide-react';
import { Lock } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import ShinyText from "./ShinyText";

const NO_CATEGORY_VALUE = "__NO_CATEGORY__";
const URGENCY_LEVELS = 4; // Par exemple, 0 (pas urgent) à 3 (très urgent), donc 4 barres

interface AddTaskDialogProps {
  onAdd: (
    title: string,
    description: string,
    date: Date,
    categoryId?: string,
    urgency?: number // Nouveau paramètre pour l'urgence
  ) => void;
  categories: Category[];
  isUserPremium: boolean; // Nouvelle prop
}

export function AddTaskDialog({ onAdd, categories, isUserPremium }: AddTaskDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [urgency, setUrgency] = useState<number>(0); // Nouvel état pour l'urgence, 0 par défaut
  const { toast } = useToast();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(undefined);
    setSelectedCategoryId(undefined);
    setUrgency(0); // Réinitialiser l'urgence
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le titre et la date.",
        variant: "destructive",
      });
      return;
    }
    const categoryIdToSend = selectedCategoryId === NO_CATEGORY_VALUE ? undefined : selectedCategoryId;
    const urgencyToSend = isUserPremium ? urgency : undefined; // N'envoyer l'urgence que si Premium

    console.log("AddTaskDialog: Données envoyées à onAdd:", { title, description, date, categoryIdToSend, urgencyToSend }); // LOG ICI

    onAdd(title, description, date, categoryIdToSend, urgencyToSend);

    resetForm();
    setDialogOpen(false);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const urgencyColors = [
    "bg-green-500", // Niveau 0 (ou 1 si vous commencez à 1)
    "bg-yellow-500", // Niveau 1
    "bg-orange-500", // Niveau 2
    "bg-red-500"      // Niveau 3
  ];
  
  const urgencyLabels = [
    "Pas urgent",
    "Normal",
    "Important",
    "Très urgent"
  ];
  const urgencyBarHeights = [
    "h-2", // Moins urgente (plus courte)
    "h-3",
    "h-4",
    "h-5",  // Plus urgente (plus haute)
  ];

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
      <Button className="bg-[#1111] border border-[#637a7a] text-[#637a7a] text-base font-medium px-4 py-2 rounded-full shadow-sm backdrop-blur-sm hover:scale-105 transition-all duration-300 w-fit">

          <Plus size={20} />
          <ShinyText
          text="Ajouter une tâche"
          disabled={false} speed={3} 
          className='custom-class'
           />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Nouvelle tâche
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Titre, Description, Date, Catégorie (inchangés) */}
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
                <SelectTrigger id="task-category" className="h-11"><SelectValue placeholder="Choisir une catégorie..." /></SelectTrigger>
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


          {/* Section Urgence - Horizontal, barres de hauteurs croissantes, blur pour non-Premium */}
          <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="task-urgency-container-horizontal">Niveau d'urgence</Label>
                {isUserPremium && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 flex items-center">
                      <Star size={12} className="mr-1" /> Premium
                  </span>
                )}
              </div>
              {/* Conteneur relatif pour l'overlay de flou */}
              <div className="relative"> {/* Pas besoin de flex justify-center ici si les barres prennent la largeur */}
                <div 
                  id="task-urgency-container-horizontal" 
                  // items-end pour que les barres s'alignent par le bas et "poussent" vers le haut
                  // space-x-1.5 pour l'espacement horizontal entre les barres
                  className="flex items-end justify-center space-x-1.5 h-8 pt-2" // h-8 pour donner une hauteur au conteneur, pt-2 pour l'espace au dessus du texte
                >
                  {Array.from({ length: URGENCY_LEVELS }).map((_, index) => {
                    return (
                      <button
                        type="button"
                        key={index}
                        onClick={() => {
                          if (isUserPremium) {
                            setUrgency(index);
                            console.log("AddTaskDialog: Urgence cliquée et mise à jour à:", index); // LOG ICI
                          }
                        }}
                        disabled={!isUserPremium}
                        className={cn(
                          "w-5 rounded-sm transition-all duration-150 ease-in-out", // w-5 pour la largeur de chaque barre
                          urgencyBarHeights[index], // Applique la hauteur variable
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                          index <= urgency && isUserPremium ? urgencyColors[index] : "bg-muted",
                          !isUserPremium && "bg-gray-300 dark:bg-gray-600", // Couleur de base si non Premium
                          isUserPremium && index > urgency && "hover:bg-muted/80",
                        )}
                        aria-label={`Niveau d'urgence ${index + 1} - ${urgencyLabels[index]}`}
                      />
                    );
                  })}
                </div>

                {/* Overlay de flou et message pour non-Premium */}
                {!isUserPremium && (
                  <div 
                    className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-md cursor-not-allowed -top-1" // -top-1 pour mieux couvrir le label urgence
                    onClick={() => {
                        toast({ title: "Fonctionnalité Premium", description: "Passez à Premium pour définir l'urgence."});
                    }}
                  >
                    <Lock size={24} className="text-muted-foreground mb-1" />
                    <p className="text-xs text-center font-medium text-muted-foreground">
                        Urgence (Premium)
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {isUserPremium ? urgencyLabels[urgency] : "Niveau d'urgence (Premium)"}
              </p>
            </div>

          <div className="flex justify-end space-x-2 pt-4">
            <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
            <Button type="submit" className="h-11 text-base font-medium">Ajouter la tâche</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}