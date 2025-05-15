// src/components/FloatingActionButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
// --- VOS ICÔNES POUR LE FAB PRINCIPAL ---
import { ArrowLeft, ChevronUp, Tag, Lock } from 'lucide-react'; 
import { AddCategoryDialog } from './AddCategoryDialog';
import { Link } from 'react-router-dom';
// import { CalendarPlus } from 'lucide-react'; // Décommentez si vous ajoutez l'option "Nouvelle Tâche"

interface FloatingActionButtonProps {
  onAddCategory: (name: string, logo: string) => Promise<void>;
  isUserPremium: boolean;
  // Optionnel: si vous voulez ajouter l'option "Ajouter une tâche" au FAB
  // onAddTask?: (title: string, description: string, date: Date, isHomework: boolean, categoryId?: string) => Promise<void>;
  // categories?: Category[]; // Requis si onAddTask utilise un sélecteur de catégorie dans son propre dialogue via FAB
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onAddCategory, 
  isUserPremium,
  // onAddTask,
  // categories 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Options qui apparaissent avec animation quand le FAB est ouvert */}
      <div 
        className={`flex flex-col items-end space-y-3 mb-3 transition-all duration-300 ease-in-out transform ${
          isOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {isOpen ? ( 
          !isUserPremium ? (
            // Message pour les utilisateurs non-premium
            <div className="p-4 bg-muted text-muted-foreground rounded-lg shadow-md w-64 text-center">
              <Lock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium mb-1">Fonctionnalité Premium</p>
              <p className="text-xs mb-3">
                La création de catégories et d'autres améliorations sont réservées aux membres Premium.
              </p>
              <Button size="sm" asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/premiumpage">Devenir Premium</Link>
              </Button>
            </div>
          ) : (
            // Options pour les utilisateurs premium
            <>
              <AddCategoryDialog onAddCategory={onAddCategory}>
                <Button 
                  variant="outline" 
                  size="lg" // ou "sm" selon votre préférence
                  className="rounded-full w-auto p-3 shadow-lg bg-background hover:bg-muted flex items-center group"
                  aria-label="Créer une catégorie"
                >
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">Nouvelle Catégorie</span>
                  <Tag className="h-6 w-6 text-primary" />
                </Button>
              </AddCategoryDialog>
              
              {/* Exemple: Ajouter une tâche depuis le FAB 
              {onAddTask && categories && ( // S'assurer que les props sont fournies
                <AddTaskDialog 
                    onAdd={onAddTask} 
                    categories={categories}
                > 
                    <Button 
                        variant="outline" 
                        size="lg" 
                        className="rounded-full w-auto p-3 shadow-lg bg-background hover:bg-muted flex items-center group"
                        aria-label="Ajouter une tâche"
                    >
                        <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">Nouvelle Tâche</span>
                        <CalendarPlus className="h-6 w-6 text-primary" />
                    </Button>
                </AddTaskDialog>
              )}
              */}
            </>
          )
        ) : null }
      </div>

      {/* Le bouton FAB principal avec VOS icônes */}
      <Button 
        onClick={toggleOpen} 
        size="icon" // Ou "lg" si vous préférez un bouton plus grand
        className={`rounded-full w-14 h-14 shadow-lg transform transition-all duration-300 
                    ${isOpen 
                      ? 'bg-gray-700 hover:bg-gray-600 rotate-180' // La rotation est optionnelle pour l'effet sur ChevronUp
                      : 'bg-primary hover:bg-primary/90 hover:scale-105'
                    } 
                    text-primary-foreground flex items-center justify-center`}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fermer les options" : "Ouvrir les options"}
      >
        {/* --- VOS ICÔNES ICI --- */}
        {isOpen ? <ChevronUp className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
      </Button>
    </div>
  );
};