// src/lib/context/ThemeContext.tsx (ou le chemin où il se trouve)

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// --- MODIFICATION ICI ---
// Ajouter 'ocean' et 'sunset' à ThemeStyle
export type ThemeStyle = 'default' | 'blackwhite' | 'ocean' | 'sunset';

interface ThemeContextType {
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>(() => {
    const savedTheme = localStorage.getItem('themeStyle');
    // Vérifier si savedTheme est l'une des valeurs valides de ThemeStyle
    const validThemes: ThemeStyle[] = ['default', 'blackwhite', 'ocean', 'sunset'];
    if (savedTheme && validThemes.includes(savedTheme as ThemeStyle)) {
      return savedTheme as ThemeStyle;
    }
    return 'default'; // Valeur par défaut si rien n'est sauvegardé ou si la valeur n'est pas valide
  });

  useEffect(() => {
    localStorage.setItem('themeStyle', themeStyle);
    
    // S'assurer de supprimer toutes les classes de thème possibles avant d'ajouter la nouvelle
    document.documentElement.classList.remove('theme-default', 'theme-blackwhite', 'theme-ocean', 'theme-sunset');
    
    // Appliquer la classe correcte
    // Note: Si 'default' n'a pas de classe spécifique (utilise les styles racine), vous pouvez omettre son ajout.
    // Cependant, pour la cohérence, il est souvent bon d'avoir une classe pour chaque thème.
    if (themeStyle === 'default') {
      document.documentElement.classList.add('theme-default');
    } else if (themeStyle === 'blackwhite') {
      document.documentElement.classList.add('theme-blackwhite');
    } else if (themeStyle === 'ocean') {
      document.documentElement.classList.add('theme-ocean');
    } else if (themeStyle === 'sunset') {
      document.documentElement.classList.add('theme-sunset');
    }
    // Alternative plus concise si vos noms de classe correspondent exactement aux valeurs de ThemeStyle:
    // document.documentElement.className = ''; // Enlever toutes les classes pour être sûr (un peu radical)
    // document.documentElement.classList.add(`theme-${themeStyle}`); 
    // Ou, si vous voulez préserver d'autres classes sur <html> :
    // const themeClasses = ['theme-default', 'theme-blackwhite', 'theme-ocean', 'theme-sunset'];
    // document.documentElement.classList.remove(...themeClasses);
    // document.documentElement.classList.add(`theme-${themeStyle}`);

  }, [themeStyle]);

  return (
    <ThemeContext.Provider value={{ themeStyle, setThemeStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};