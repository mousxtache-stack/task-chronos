import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ThemeStyle = 'default' | 'blackwhite';

interface ThemeContextType {
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Récupération de la préférence de thème du localStorage
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>(() => {
    const savedTheme = localStorage.getItem('themeStyle');
    return (savedTheme as ThemeStyle) || 'default';
  });

  // Sauvegarde du thème quand il change
  useEffect(() => {
    localStorage.setItem('themeStyle', themeStyle);
    // Ajouter la classe au document pour CSS global
    document.documentElement.classList.remove('theme-default', 'theme-blackwhite');
    document.documentElement.classList.add(`theme-${themeStyle}`);
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