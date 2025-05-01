import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PencilIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Task } from "@/lib/types";

interface EditTaskDialogProps {
  task: Task;
  onEdit: (id: string, title: string, description: string, date: Date, isHomework: boolean) => void;
  trigger?: React.ReactNode;
}

export function EditTaskDialog({ task, onEdit, trigger }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [isHomework, setIsHomework] = useState(false);
  const { toast } = useToast();

  // Initialiser les champs avec les valeurs de la tâche à modifier
  useEffect(() => {
    if (task && open) {
      console.log("Initialisation des champs d'édition:", task);
      setTitle(task.title);
      setDescription(task.description || "");
      
      // Format de date pour l'input date HTML (YYYY-MM-DD)
      const formattedDate = task.date.toISOString().split('T')[0];
      console.log("Date formatée:", formattedDate);
      setDate(formattedDate);
      
      setIsHomework(task.isHomework || false);
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Soumission du formulaire:", {
      id: task.id,
      title,
      description,
      date: new Date(date),
      isHomework
    });
    
    // Créer une nouvelle date à partir du string
    const newDate = new Date(date);
    
    // Ajouter une notification pour debug
    toast({
      title: "Données à sauvegarder",
      description: `ID: ${task.id}, Titre: ${title}, Date: ${newDate.toISOString()}`,
    });
    
    // Appeler la fonction onEdit
    onEdit(task.id, title, description, newDate, isHomework);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-secondary transition-colors p-1"
          >
            <PencilIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Modifier la tâche
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Input
              placeholder="Titre de la tâche"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Description (optionnelle)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                console.log("Changement de date:", e.target.value);
                setDate(e.target.value);
              }}
              className="h-12"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="homework-mode" 
              checked={isHomework}
              onCheckedChange={setIsHomework}
            />
            <Label htmlFor="homework-mode">Catégorie devoir</Label>
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300"
          >
            Enregistrer les modifications
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 