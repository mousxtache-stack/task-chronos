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
import { Plus } from "lucide-react";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
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

const NO_CATEGORY_VALUE = "__NO_CATEGORY__"; // Valeur spéciale pour "Aucune catégorie"

interface AddTaskDialogProps {
  onAdd: (
    title: string,
    description: string,
    date: Date,
    isHomework: boolean,
    categoryId?: string
  ) => void;
  categories: Category[];
}

export function AddTaskDialog({ onAdd, categories }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [isHomework, setIsHomework] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

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
    // Si selectedCategoryId est notre valeur spéciale, on passe undefined
    const categoryIdToSend = selectedCategoryId === NO_CATEGORY_VALUE ? undefined : selectedCategoryId;
    onAdd(title, description, new Date(date), isHomework, categoryIdToSend);

    setTitle("");
    setDescription("");
    setDate("");
    setIsHomework(false);
    setSelectedCategoryId(undefined); // Réinitialiser pour afficher le placeholder la prochaine fois
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setDate("");
      setIsHomework(false);
      setSelectedCategoryId(undefined); // Réinitialiser pour afficher le placeholder
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 px-6 py-6 text-base font-medium shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90">
          <Plus size={20} />
          Ajouter une tâche
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Nouvelle tâche
          </DialogTitle>
          {/* Pour le warning de Radix sur Dialog.Description, vous pouvez ajouter : */}
          {/* <DialogDescription className="sr-only">Formulaire d'ajout d'une nouvelle tâche.</DialogDescription> */}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-1">
            <Label htmlFor="task-title">Titre</Label>
            <Input
              id="task-title"
              placeholder="Titre de la tâche"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Description (optionnelle)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="task-date">Date</Label>
              <Input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="task-category">Catégorie</Label>
              <Select
                // Si selectedCategoryId est undefined, la value du Select sera aussi undefined (ou chaîne vide implicitement), ce qui affichera le placeholder.
                // Si selectedCategoryId est une chaîne (un ID ou NO_CATEGORY_VALUE), elle sera utilisée.
                value={selectedCategoryId}
                onValueChange={(value) => {
                  // `value` sera l'ID de la catégorie ou NO_CATEGORY_VALUE
                  setSelectedCategoryId(value);
                }}
              >
                <SelectTrigger id="task-category" className="h-11">
                  <SelectValue placeholder="Choisir une catégorie..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY_VALUE}> {/* MODIFIÉ ICI */}
                    <span className="text-muted-foreground">Aucune catégorie</span>
                  </SelectItem>
                  {categories && Array.isArray(categories) && categories.map((category) => {
                    // S'assurer que l'ID de la catégorie n'est pas une chaîne vide
                    if (category.id === "") {
                      console.warn("Catégorie avec ID vide trouvée:", category.name);
                      return null; // Ou gérer autrement
                    }
                    const IconComponent = category.logo && (LucideIcons as any)[category.logo]
                      ? (LucideIcons as any)[category.logo] as LucideIcons.LucideIcon
                      : null;
                    return (
                      <SelectItem key={category.id} value={String(category.id)}> {/* S'assurer que value est une string et non vide */}
                        <div className="flex items-center">
                          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                          {category.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="homework-mode"
              checked={isHomework}
              onCheckedChange={setIsHomework}
            />
            <Label htmlFor="homework-mode">Marquer comme devoir</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              type="submit"
              className="h-11 text-base font-medium"
            >
              Ajouter la tâche
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}