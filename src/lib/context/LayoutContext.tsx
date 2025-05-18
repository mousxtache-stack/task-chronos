// lib/context/LayoutContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'; // Ajout de useEffect

// 1. Ajouter 'kanban' au type LayoutMode
export type LayoutMode = 'normal' | 'right' | 'compact' | 'grid' | 'kanban';

interface LayoutContextType {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Clé pour localStorage
const LAYOUT_MODE_STORAGE_KEY = 'task-chronos-layout-mode';

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  // 2. Initialiser depuis localStorage ou avec une valeur par défaut
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(() => {
    const storedMode = localStorage.getItem(LAYOUT_MODE_STORAGE_KEY);
    return (storedMode as LayoutMode) || 'normal'; // S'assurer que le type est correct
  });

  // 3. Fonction pour mettre à jour l'état et localStorage
  const setLayoutMode = (mode: LayoutMode) => {
    setLayoutModeState(mode);
    localStorage.setItem(LAYOUT_MODE_STORAGE_KEY, mode);
  };

  // 4. (Optionnel mais recommandé) Effet pour écouter les changements dans d'autres onglets
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LAYOUT_MODE_STORAGE_KEY && event.newValue) {
        setLayoutModeState(event.newValue as LayoutMode);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  return (
    <LayoutContext.Provider value={{ layoutMode, setLayoutMode }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};