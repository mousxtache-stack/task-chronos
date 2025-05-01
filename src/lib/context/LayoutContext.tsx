import { createContext, useContext, useState, ReactNode } from 'react';

export type LayoutMode = 'normal' | 'right' | 'compact' | 'grid';

interface LayoutContextType {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('normal');

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