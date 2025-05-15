// src/components/PremiumPopup.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Zap } from 'lucide-react'; // Zap pour un look "premium" / "boost"
import { Link } from 'react-router-dom'; // Important pour la navigation

interface PremiumPopupProps {
  onClose: () => void;
}

export const PremiumPopup: React.FC<PremiumPopupProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed bottom-5 right-5 z-50 bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-5 rounded-lg shadow-2xl w-80 transform transition-all duration-500 ease-out animate-slide-in-right"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-popup-title"
    >
      <button 
        onClick={onClose} 
        className="absolute top-2 right-2 text-purple-200 hover:text-white transition-colors"
        aria-label="Fermer la pop-up premium"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-center mb-3">
        <Zap size={28} className="text-yellow-300 mr-3" />
        <h3 id="premium-popup-title" className="text-xl font-semibold">
          Task Chronos <span className="text-yellow-300">Premium</span>
        </h3>
      </div>
      
      <p className="text-sm text-purple-100 mb-4">
        Débloquez des fonctionnalités avancées et boostez votre productivité !
      </p>
      
      <Link to="/PremiumPage">
        <Button 
          variant="outline" 
          className="w-full bg-yellow-400 text-indigo-700 hover:bg-yellow-500 border-yellow-400 hover:border-yellow-500 font-bold transition-all hover:shadow-md"
        >
          Découvrir Premium
        </Button>
      </Link>
    </div>
  );
};

