// src/components/ModifyCategoriesDialog.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Save } from 'lucide-react';
import { Category } from '@/lib/types'; // Assurez-vous que le chemin est correct

interface ModifyCategoriesDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[]; // Doit être fourni, même vide
  onUpdateCategory: (id: string, name: string, logo: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const ModifyCategoriesDialog: React.FC<ModifyCategoriesDialogProps> = ({
  children,
  isOpen,
  onOpenChange,
  categories = [], // Valeur par défaut pour la robustesse
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentName, setCurrentName] = useState('');
  const [currentLogo, setCurrentLogo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setCurrentName(editingCategory.name);
      setCurrentLogo(editingCategory.logo);
    } else {
      setCurrentName('');
      setCurrentLogo('');
    }
  }, [editingCategory]);

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
  };

  const handleSave = async () => {
    if (editingCategory && currentName.trim()) {
      setIsLoading(true);
      try {
        await onUpdateCategory(editingCategory.id, currentName.trim(), currentLogo.trim());
        setEditingCategory(null);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la catégorie:", error);
        // Idéalement, afficher une alerte à l'utilisateur ici via un context d'alerte
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (categoryId: string) => {
    // Demander confirmation (peut être amélioré avec un dialogue de confirmation plus joli)
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ? Les tâches associées perdront cette catégorie.")) {
      setIsLoading(true);
      try {
        await onDeleteCategory(categoryId);
        if (editingCategory?.id === categoryId) {
          setEditingCategory(null);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie:", error);
         // Idéalement, afficher une alerte
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  useEffect(() => {
    if (!isOpen) {
      setEditingCategory(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? `Modifier "${editingCategory.name}"` : 'Gérer vos catégories'}
          </DialogTitle>
          {!editingCategory && (
            <DialogDescription>
              Modifiez ou supprimez vos catégories existantes.
            </DialogDescription>
          )}
        </DialogHeader>

        {editingCategory ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-name-edit" className="text-right">
                Nom
              </Label>
              <Input
                id="cat-name-edit"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-logo-edit" className="text-right">
                Logo
              </Label>
              <Input
                id="cat-logo-edit"
                value={currentLogo}
                onChange={(e) => setCurrentLogo(e.target.value)}
                className="col-span-3"
                placeholder="Ex: 🏠 ou Auto"
                disabled={isLoading}
              />
            </div>
            <DialogFooter className="sm:justify-start mt-4">
              <Button type="button" onClick={handleSave} disabled={isLoading || !currentName.trim()}>
                <Save className="mr-2 h-4 w-4" /> {isLoading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                Annuler
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {(!categories || categories.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center">Vous n'avez pas encore créé de catégories.</p>
            ) : (
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3 text-xl">{cat.logo || '🏷️'}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <div className="space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(cat)} disabled={isLoading} aria-label={`Modifier ${cat.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} disabled={isLoading} aria-label={`Supprimer ${cat.name}`}>
                        <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
         {!editingCategory && (
             <DialogFooter className="mt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Fermer</Button>
                </DialogClose>
            </DialogFooter>
         )}
      </DialogContent>
    </Dialog>
  );
};