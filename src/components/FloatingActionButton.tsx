// src/components/FloatingActionButton.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronUp, Tag, Lock, Pencil } from 'lucide-react';
import { AddCategoryDialog } from './AddCategoryDialog'; // Assurez-vous que ce composant existe et est correct
import { ModifyCategoriesDialog } from './ModifyCategoriesDialog';
import { Link } from 'react-router-dom';
import { Category } from '@/lib/types'; // Assurez-vous que le chemin est correct

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
  
  const isPremium = Boolean(isUserPremium); // Forcer la conversion si jamais ce n'est pas un booléen strict
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Fermer les dialogues internes si le FAB principal est fermé
  useEffect(() => {
    if (!isOpen) {
      setIsModifyCategoriesOpen(false);
      // Si AddCategoryDialog avait un état d'ouverture géré ici, il faudrait aussi le fermer.
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <div 
        className={`flex flex-col items-end space-y-3 mb-3 transition-all duration-300 ease-in-out transform ${
          isOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-2 translate-y-4 pointer-events-none'
        }`}
      >
        {isOpen && (
          <>
            {isPremium ? (
            <>
              {/* Option pour ajouter une catégorie */}
              <AddCategoryDialog onAddCategory={onAddCategory}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full w-auto p-3 shadow-lg bg-background hover:bg-muted flex items-center group"
                  aria-label="Créer une catégorie"
                >
                  <span className="mr-2 opacity-100 sm:opacity-1 group-hover:opacity-100 transition-opacity duration-300 text-sm whitespace-nowrap">Nouvelle Catégorie</span>
                  <Tag className="h-6 w-6 text-primary" />
                </Button>
              </AddCategoryDialog>

              {/* Option pour modifier les catégories */}
              <ModifyCategoriesDialog
                isOpen={isModifyCategoriesOpen}
                onOpenChange={setIsModifyCategoriesOpen}
                categories={userCategories}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-auto p-3 shadow-lg bg-background hover:bg-muted flex items-center group"
                  aria-label="Modifier les catégories"
                  onClick={() => setIsModifyCategoriesOpen(true)} // Contrôler l'ouverture manuellement
                >
                  <span className="mr-2 opacity-100 sm:opacity-1 group-hover:opacity-100 transition-opacity duration-300 text-sm whitespace-nowrap">Modifier Catégories</span>
                  <Pencil className="h-6 w-6 text-primary" />
                </Button>
              </ModifyCategoriesDialog>
            </>
          ) : (
            // Message pour les utilisateurs non-premium
            <div className="p-4 bg-muted text-muted-foreground rounded-lg shadow-md w-64 text-center">
              <Lock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium mb-1">Fonctionnalité Premium</p>
              <p className="text-xs mb-3">
                La création et la modification de catégories sont réservées aux membres Premium.
              </p>
              <Button size="sm" asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/premium">Devenir Premium</Link> {/* Assurez-vous que /premium est la bonne route */}
              </Button>
            </div>
          )}
          </>
        )}
      </div>

      <Button 
        onClick={toggleOpen} 
        size="icon"
        className={`rounded-full w-14 h-14 shadow-lg transform transition-all duration-300 
                    ${isOpen 
                      ? 'bg-secondary hover:bg-secondary/90 rotate-180' // Rotation pour indiquer la fermeture
                      : 'bg-primary hover:bg-primary/90 hover:scale-105'
                    } 
                    text-primary-foreground flex items-center justify-center`}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fermer les options" : "Ouvrir les options"}
      >
        {isOpen ? <ChevronUp className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
      </Button>
    </div>
  );
};