// src/pages/InformationHubPage.tsx
import React from 'react';
import HeaderBar from '@/components/HeaderBar';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, HelpCircle, FileText, Home } from 'lucide-react';

interface InfoLink {
  icon: React.ReactElement;
  title: string;
  description: string;
  path: string;
  category: 'Aide' | 'Légal' | 'Général';
}

const informationLinks: InfoLink[] = [
  {
    icon: <HelpCircle size={24} className="text-sky-400" />,
    title: "Foire Aux Questions (FAQ)",
    description: "Trouvez rapidement les réponses à vos questions les plus fréquentes sur Task Chronos.",
    path: "/faq",
    category: 'Aide',
  },

  {
    icon: <ShieldCheck size={24} className="text-green-400" />,
    title: "Politique de Confidentialité",
    description: "Découvrez comment nous collectons, utilisons et protégeons vos données personnelles.",
    path: "/privacypolicy", // Adaptez si le chemin est différent
    category: 'Légal',
  },
  {
    icon: <BookOpen size={24} className="text-red-400" />,
    title: "Mentions Légales",
    description: "Informations légales concernant l'éditeur et l'hébergement du site.",
    path: "/LegalNotice",
    category: 'Légal',
  },
  // Ajoutez d'autres liens ici si nécessaire:
  // {
  //   icon: <Info size={24} className="text-purple-400" />,
  //   title: "À Propos de Nous",
  //   description: "En savoir plus sur l'équipe et la mission de Task Chronos.",
  //   path: "/about",
  //   category: 'Général',
  // },
  // {
  //   icon: <Mail size={24} className="text-teal-400" />,
  //   title: "Nous Contacter",
  //   description: "Besoin d'aide ou une question spécifique ? Contactez notre support.",
  //   path: "/contact",
  //   category: 'Aide',
  // },
];

const InformationHubPage = () => {
  const categories = ['Aide', 'Légal', 'Général'] as const;

  return (
    <>
      <HeaderBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-slate-900 to-indigo-950 text-white dark:from-slate-900 dark:via-gray-900 dark:to-black">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32">
          
          <header className="text-center mb-12 md:mb-16">
            <BookOpen size={52} className="mx-auto text-purple-400 dark:text-yellow-400 mb-4" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-100 dark:text-white">
              Centre d'Information
            </h1>
            <p className="mt-4 text-lg text-purple-300 dark:text-purple-400 max-w-2xl mx-auto">
              Accédez facilement à toutes les ressources, documentations et informations légales de Task Chronos.
            </p>
          </header>

          {categories.map(category => {
            const linksForCategory = informationLinks.filter(link => link.category === category);
            if (linksForCategory.length === 0) return null;

            return (
              <section key={category} className="mb-12">
                <h2 className="text-2xl sm:text-3xl font-semibold text-purple-300 dark:text-yellow-500 mb-6 border-b-2 border-purple-500/30 dark:border-yellow-500/30 pb-2">
                  {category}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {linksForCategory.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="group block bg-white/5 dark:bg-slate-800/40 hover:bg-white/10 dark:hover:bg-slate-700/60 p-6 rounded-xl shadow-lg hover:shadow-purple-500/30 dark:hover:shadow-yellow-500/20 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {link.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100 dark:text-white group-hover:text-purple-300 dark:group-hover:text-yellow-400 transition-colors">
                            {link.title}
                          </h3>
                          <p className="mt-1 text-sm text-purple-200 dark:text-purple-300 leading-relaxed">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
          
          <footer className="text-center mt-16">
            <Link 
              to="/" 
              className="inline-flex items-center text-purple-300 hover:text-yellow-400 dark:text-purple-400 dark:hover:text-yellow-300 transition-colors font-medium"
            >
              <Home size={18} className="mr-2" />
              Retour à l'accueil Task Chronos
            </Link>
          </footer>

        </div>
      </div>
    </>
  );
};

export default InformationHubPage;