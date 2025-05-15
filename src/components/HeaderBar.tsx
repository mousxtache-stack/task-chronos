// src/components/HeaderBar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Sun, Moon } from 'lucide-react'; // Zap pour le logo, Sun/Moon pour le thème

const HeaderBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation(); // Pour adapter le style si on est sur la page d'accueil

  const navLinks = [
    { name: 'FAQ', path: '/faq' },
    { name: 'CGU', path: '/terms-of-service' }, // Exemple de chemin plus structuré
    { name: 'Confidentialité', path: '/privacypolicy' },
    { name: 'Mentions Légales', path:'/LegalNotice '},
  ];

  // Gérer le changement de style au scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); // Devient opaque après un petit scroll
    };
    window.addEventListener('scroll', handleScroll);
    // Nettoyage au démontage
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gérer le thème (dark/light)
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    document.documentElement.classList.toggle('dark', newDarkModeState);
    localStorage.setItem('theme', newDarkModeState ? 'dark' : 'light');
  };

  // La barre est transparente sur la page d'accueil en haut, sinon fond solide
  const isTransparentNav = location.pathname === '/' && !isScrolled;

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isTransparentNav
          ? 'bg-transparent py-4'
          : 'bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg py-3'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo/Nom de l'application */}
          <Link to="/" className="flex items-center group">
            <Zap
              size={28}
              className={`
                ${isTransparentNav ? 'text-yellow-400' : 'text-purple-600 dark:text-yellow-400'}
                group-hover:opacity-80 transition-all duration-300 mr-2
              `}
            />
            <span
              className={`
                font-bold text-xl tracking-tight
                ${isTransparentNav ? 'text-white' : 'text-gray-800 dark:text-gray-100'}
                group-hover:opacity-80 transition-colors duration-300
              `}
            >
              Task Chronos
            </span>
          </Link>

          {/* Liens de navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`
                  relative text-sm font-medium group transition-colors duration-200
                  ${isTransparentNav
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-purple-700 dark:text-gray-400 dark:hover:text-white'
                  }
                `}
              >
                {link.name}
                {/* Animation de soulignement "jamais vue" */}
                <span
                  className={`
                    absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-0 h-[2px] 
                    ${isTransparentNav ? 'bg-yellow-400' : 'bg-purple-600 dark:bg-yellow-400'}
                    group-hover:w-full transition-all duration-300 ease-out
                  `}
                ></span>
              </Link>
            ))}
          </nav>

          {/* Bouton de thème */}
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className={`
                p-2 rounded-full transition-colors duration-200 focus:outline-none
                ${isTransparentNav
                  ? 'text-gray-300 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 hover:text-purple-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-500/20 dark:hover:bg-white/10'
                }
              `}
              aria-label={isDarkMode ? "Activer le thème clair" : "Activer le thème sombre"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* Vous pouvez ajouter un bouton "Premium" ou "Mon Compte" ici si besoin */}
            {/* Exemple: <Link to="/premium" className="ml-4 ...">Premium</Link> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;