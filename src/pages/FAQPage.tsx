// src/pages/FAQPage.tsx
import React from 'react';
import HeaderBar from '@/components/HeaderBar'; // Réutiliser la HeaderBar
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronRight } from 'lucide-react';

// Liste des questions et réponses
const faqData = [
  {
    id: 'what-is-task-chronos',
    question: "Qu'est-ce que Task Chronos ?",
    answer: "Task Chronos est une application de gestion de tâches conçue pour vous aider à organiser votre quotidien, suivre vos projets et améliorer votre productivité. Elle offre une interface intuitive et des fonctionnalités puissantes pour les individus et les équipes.",
  },
  {
    id: 'premium-vs-free',
    question: "Quelles sont les différences entre la version gratuite et Premium ?",
    answer: "La version gratuite vous donne accès aux fonctionnalités de base de gestion de tâches. La version Premium débloque des fonctionnalités avancées telles que les tâches illimités, les thèmes personnalisés, les statistiques détaillées de productivité, un support prioritaire, une aide au créateur et plus encore. Consultez notre page Premium pour tous les détails.",
  },
  {
    id: 'data-security',
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, la sécurité de vos données est notre priorité absolue. Nous utilisons des protocoles de chiffrement standards de l'industrie et des mesures de sécurité robustes pour protéger vos informations. Pour plus de détails, veuillez consulter notre Politique de Confidentialité.",
  },
  {
    id: 'cancel-subscription',
    question: "Comment puis-je annuler mon abonnement Premium ?",
    answer: "Vous ne pouvez pas encore annuler votre abonnement Premium depuis les paramètres de votre compte.",
  },
  {
    id: 'contact-support',
    question: "Comment contacter le support client ?",
    answer: "Si vous avez des questions ou besoin d'aide, vous pouvez nous contacter via le formulaire de contact sur notre site ou envoyer un email à clement10600@gmail.com. Les membres Premium bénéficient d'un support prioritaire.",
  },
];

// Un composant pour afficher chaque item de FAQ avec un effet d'accordéon simple
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-gray-700/50 dark:border-gray-200/20 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-medium text-purple-300 dark:text-yellow-400 hover:text-purple-200 dark:hover:text-yellow-300 focus:outline-none transition-colors duration-200"
      >
        <span>{question}</span>
        <ChevronRight
          size={20}
          className={`transform transition-transform duration-300 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="mt-3 pl-2 pr-4 text-gray-300 dark:text-gray-400 leading-relaxed">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};


const FAQPage = () => {
  return (
    <>
      <HeaderBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-900 text-white dark:from-slate-900 dark:via-slate-800 dark:to-black">
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32"> {/* pt ajusté pour HeaderBar */}
          
          <header className="text-center mb-10 md:mb-12">
            <HelpCircle size={48} className="mx-auto text-purple-400 dark:text-yellow-400 mb-4 animate-pulse" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-100 dark:text-white">
              Foire Aux Questions
            </h1>
            <p className="mt-3 text-lg text-purple-300 dark:text-purple-400">
              Trouvez les réponses à vos interrogations les plus fréquentes.
            </p>
          </header>

          <section className="bg-white/5 dark:bg-slate-800/40 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="space-y-2">
              {faqData.map((faq) => (
                <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>

          <footer className="text-center mt-12">
            <p className="text-purple-300 dark:text-purple-400 mb-4">
              Vous n'avez pas trouvé de réponse ?
            </p>
            <Link 
              to="/" // Supposons une page de contact
              className="inline-block bg-yellow-400 text-indigo-700 hover:bg-yellow-500 dark:text-slate-900 dark:hover:bg-yellow-300 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Contactez-nous
            </Link>
            <div className="mt-8">
                <Link to="/" className="text-purple-300 hover:text-yellow-400 transition-colors dark:text-purple-400 dark:hover:text-yellow-300">
                ← Retour à l'application
                </Link>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
};

export default FAQPage;