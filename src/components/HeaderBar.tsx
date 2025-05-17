// src/components/HeaderBar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Sun, Moon, Menu, X, Instagram, MessageCircle } from 'lucide-react';

const HeaderBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const primaryNavLinks = [
    { name: 'TASK BOARD', path: '/' },
    { name: 'INFORMATION', path: '/InformationHubPage' },
    { name: 'FAQ', path: '/faq' },
  ];

  const secondaryNavLinks = [
    { name: 'MENTIONS LÉGALES', path:'/LegalNotice'},
    { name: 'POLITIQUE DE CONFIDENTIALITÉ', path: '/privacy-policy' },
  ];

  const socialLinks = [
    { name: 'Instagram', path: 'https://instagram.com/clem.ncs', Icon: Instagram },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const isTransparentNav = location.pathname === '/' && !isScrolled;

  const headerTextColorClass = isMenuOpen ? 'text-white' : isTransparentNav ? 'text-white' : 'text-gray-800 dark:text-gray-100';
  const headerIconBaseColorClass = isMenuOpen ? 'text-white' : isTransparentNav ? 'text-yellow-400' : 'text-purple-600 dark:text-yellow-400';
  const headerButtonHoverClass = isMenuOpen ? 'hover:bg-white/20' : isTransparentNav ? 'hover:text-white hover:bg-white/10' : 'hover:bg-gray-500/20 dark:hover:bg-white/10';

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'bg-transparent py-4' : isTransparentNav ? 'bg-transparent py-4' : 'bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg py-3'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <Link to="/" className="flex items-center group">
              <Zap
                size={28}
                className={`${headerIconBaseColorClass} group-hover:opacity-80 transition-all duration-300 mr-2 group-hover:-translate-x-1`}
              />
              <span
                className={`font-bold text-xl tracking-tight ${headerTextColorClass} group-hover:opacity-80 transition-all duration-300 group-hover:translate-x-1`}
              >
                Task Chronos
              </span>
            </Link>

            <div className="flex items-center">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors duration-200 focus:outline-none ${headerTextColorClass} ${headerButtonHoverClass} mr-1`}
                aria-label={isDarkMode ? "Activer le thème clair" : "Activer le thème sombre"}
              >
                <div className="relative w-5 h-5"> {/* Conteneur pour l'animation des icônes de thème */}
                  <Sun size={20} className={`absolute top-0 left-0 transition-all duration-300 ease-in-out ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}`} />
                  <Moon size={20} className={`absolute top-0 left-0 transition-all duration-300 ease-in-out ${isDarkMode ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                </div>
              </button>

              <div>
                <button
                  onClick={toggleMenu}
                  className={`p-2 rounded-full transition-colors duration-200 focus:outline-none z-[51] relative ${headerTextColorClass} ${headerButtonHoverClass}`}
                  aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                  aria-expanded={isMenuOpen}
                >
                  <div className="relative w-6 h-6"> {/* Conteneur pour l'animation Hamburger/X */}
                    <Menu size={24} className={`absolute top-0 left-0 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                    <X size={24} className={`absolute top-0 left-0 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`
          fixed inset-0 z-40 bg-neutral-800 dark:bg-black 
          transition-opacity duration-500 ease-in-out
          flex flex-col justify-between p-8 sm:p-12 lg:p-16
          ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div></div>

        <nav className="flex flex-col items-start -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-32">
          {primaryNavLinks.map((link, index) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={toggleMenu}
              className={`
                text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white 
                hover:text-yellow-400 dark:hover:text-yellow-400
                my-2 sm:my-3 md:my-4 transition-all duration-300 ease-out transform hover:translate-x-4
                ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}
              `}
              style={{ transitionDelay: `${isMenuOpen ? 200 + index * 100 : 0}ms` }}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end text-white/70 text-xs uppercase tracking-wider">
                <div className="mb-6 md:mb-0">
                    {secondaryNavLinks.map((link, index) => (
                    <Link
                        key={link.name}
                        to={link.path}
                        onClick={toggleMenu}
                        className={`block py-1 hover:text-white transition-all duration-300 ease-out
                        transform hover:translate-x-2
                        ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                        style={{ transitionDelay: `${isMenuOpen ? 500 + primaryNavLinks.length * 100 + index * 70 : 0}ms` }}
                    >
                        {link.name}
                    </Link>
                    ))}
                </div>
                <div className="flex space-x-5">
                    {socialLinks.map((social, index) => (
                    <a
                        key={social.name}
                        href={social.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className={`hover:text-white transition-all duration-300 ease-out
                        transform hover:translate-x-2
                        ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                        style={{ transitionDelay: `${isMenuOpen ? 600 + primaryNavLinks.length * 100 + secondaryNavLinks.length * 70 + index * 70 : 0}ms` }}
                    >
                        <social.Icon size={22} />
                    </a>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default HeaderBar;