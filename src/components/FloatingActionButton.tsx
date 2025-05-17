// src/components/FloatingActionButton.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Tag, Lock, Pencil, ArrowLeft } from 'lucide-react';
import { AddCategoryDialog } from './AddCategoryDialog';
import { ModifyCategoriesDialog } from './ModifyCategoriesDialog';
import { Link } from 'react-router-dom';
import { Category } from '@/lib/types';

interface FloatingActionButtonProps {
  onAddCategory: (name: string, logo: string) => Promise<void>;
  isUserPremium: boolean;
  userCategories: Category[];
  onUpdateCategory: (id: string, name: string, logo: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddCategory,
  isUserPremium,
  userCategories,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModifyCategoriesOpen, setIsModifyCategoriesOpen] = useState(false);
  
  const isPremium = Boolean(isUserPremium);
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) {
      setIsModifyCategoriesOpen(false);
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Menu déplié */}
      {isOpen && isPremium && (
        <>
          <AddCategoryDialog onAddCategory={onAddCategory}>
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-md shadow-sm bg-background hover:bg-muted flex items-center gap-2"
              aria-label="Créer une catégorie"
            >
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-xs">Nouvelle Catégorie</span>
            </Button>
          </AddCategoryDialog>

          <ModifyCategoriesDialog
            isOpen={isModifyCategoriesOpen}
            onOpenChange={setIsModifyCategoriesOpen}
            categories={userCategories}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
          >
            <Button
              variant="outline"
              size="sm"
              className="rounded-md shadow-sm bg-background hover:bg-muted flex items-center gap-2"
              aria-label="Modifier les catégories"
              onClick={() => setIsModifyCategoriesOpen(true)}
            >
              <Pencil className="h-4 w-4 text-primary" />
              <span className="text-xs">Modifier Catégories</span>
            </Button>
          </ModifyCategoriesDialog>
        </>
      )}

      {/* Message pour utilisateurs non-premium */}
      {isOpen && !isPremium && (
        <div className="p-3 bg-muted text-muted-foreground rounded-md shadow-sm w-56 text-center mb-2">
          <Lock className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xs font-medium mb-1">Fonctionnalité Premium</p>
          <p className="text-xs mb-2">
            Les catégories sont réservées aux membres Premium.
          </p>
          <Button size="sm" asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
            <Link to="/premium">Devenir Premium</Link>
          </Button>
        </div>
      )}

      {/* Bouton principal minimaliste avec flèche */}
      <Button 
        onClick={toggleOpen} 
        size="sm"
        className="rounded-md shadow-none bg-transparent hover:bg-muted/30 text-primary"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fermer les options" : "Ouvrir les options"}
      >
        <ArrowLeft className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  );
};