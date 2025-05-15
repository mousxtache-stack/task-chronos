// src/pages/PremiumPage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle, ShieldCheck, BarChart, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Navbar } from '@/components/Navbar'; // Si vous aviez ça
// import OrbitNav from '@/components/OrbitNav'; // Ou ça
import HeaderBar from '@/components/HeaderBar'; // <--- Importer la nouvelle HeaderBar
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/lib/context/AlertContext';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// ... (le reste du code de Stripe et de la page reste inchangé)
let stripePromise: Promise<Stripe | null>;
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (STRIPE_PUBLISHABLE_KEY) {
  stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
} else {
  console.error("Clé publique Stripe (VITE_STRIPE_PUBLISHABLE_KEY) non trouvée. Le paiement Stripe ne fonctionnera pas.");
}

const YOUR_PREMIUM_PRICE_ID_STRIPE = import.meta.env.VITE_YOUR_PREMIUM_PRICE_ID_STRIPE || 'REMPLACEZ_PAR_ID_PRIX_STRIPE';

const PremiumPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('payment_success') && query.get('stripe_session_id')) {
      showAlert("Paiement Réussi !", "Merci pour votre abonnement Premium ! Votre compte est en cours de mise à jour.", "success");
      setTimeout(() => {
          navigate('/');
          window.location.reload(); 
      }, 3000);
    }
    if (query.get('payment_canceled')) {
      showAlert("Paiement Annulé", "Votre paiement a été annulé. Vous pouvez réessayer.", "info");
    }
     if (query.has('payment_success') || query.has('payment_canceled')) {
        navigate(location.pathname, { replace: true });
    }
  }, [location, showAlert, navigate]);

  const handleUpgradeToPremium = async () => {
    if (!STRIPE_PUBLISHABLE_KEY || YOUR_PREMIUM_PRICE_ID_STRIPE === 'REMPLACEZ_PAR_ID_PRIX_STRIPE') {
        showAlert("Erreur de configuration", "Le système de paiement n'est pas correctement configuré. Veuillez contacter le support.", "error");
        return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showAlert("Erreur", "Vous devez être connecté pour devenir Premium.", "error");
        navigate('/auth');
        setIsLoading(false);
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-stripe-checkout-session', {
        body: { 
          priceId: YOUR_PREMIUM_PRICE_ID_STRIPE,
          userId: user.id,
          userEmail: user.email 
        },
      });

      if (sessionError) throw new Error(sessionError.message || "Impossible de créer la session de paiement Stripe.");
      if (!sessionData || !sessionData.sessionId) throw new Error("ID de session Stripe non reçu.");

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe.js n'a pas pu être chargé.");

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: sessionData.sessionId,
      });

      if (stripeError) {
        showAlert("Erreur Stripe", stripeError.message || "Redirection vers Stripe échouée.", "error");
        setIsLoading(false);
      }
    } catch (error: any) {
      showAlert("Erreur de mise à niveau", error.message || "Une erreur est survenue.", "error");
      setIsLoading(false);
    }
  };

  return (
    <>
      <HeaderBar /> {/* <--- Utiliser la nouvelle HeaderBar */}
      {/* Le fond gradient est appliqué au conteneur principal de la page */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white dark:from-slate-800 dark:via-slate-900 dark:to-black">
        {/* Ajouter un padding-top au conteneur du contenu pour éviter qu'il soit caché par la HeaderBar */}
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-24"> {/* pt-24 (environ 6rem) pour la HeaderBar */}
          <header className="text-center mb-12">
            <Zap size={64} className="mx-auto text-yellow-400 mb-4" />
            <h1 className="text-5xl font-extrabold mb-3">
              Task Chronos <span className="text-yellow-400">Premium</span>
            </h1>
            <p className="text-xl text-purple-300 dark:text-purple-400">
              Passez au niveau supérieur et organisez votre vie comme jamais auparavant !
            </p>
          </header>

          <section className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-shadow dark:bg-slate-700/50">
              <CheckCircle size={32} className="text-green-400 mb-3" />
              <h2 className="text-2xl font-semibold mb-2">Fonctionnalités Exclusives</h2>
              <p className="text-purple-200 dark:text-purple-300">
                Accédez à des outils avancés : thèmes personnalisés, statistiques détaillées, projets illimités, et bien plus.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-shadow dark:bg-slate-700/50">
              <BarChart size={32} className="text-blue-400 mb-3" />
              <h2 className="text-2xl font-semibold mb-2">Productivité Maximale</h2>
              <p className="text-purple-200 dark:text-purple-300">
                Concentrez-vous sur ce qui compte vraiment. Moins de distractions, plus d'accomplissements.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-shadow dark:bg-slate-700/50">
              <ShieldCheck size={32} className="text-red-400 mb-3" />
              <h2 className="text-2xl font-semibold mb-2">Support Prioritaire</h2>
              <p className="text-purple-200 dark:text-purple-300">
                Obtenez de l'aide plus rapidement avec notre équipe dédiée aux membres Premium.
              </p>
            </div>
          </section>

          <section className="text-center bg-white/5 p-8 rounded-xl shadow-2xl dark:bg-slate-800/30">
            <h2 className="text-3xl font-bold mb-6 text-yellow-300">Prêt à devenir Premium ?</h2>
            <p className="text-lg text-purple-200 mb-8 dark:text-purple-300">
              Un seul plan simple pour débloquer toutes les fonctionnalités.
            </p>
            <Button 
              size="lg" 
              className="bg-yellow-400 text-indigo-700 hover:bg-yellow-500 dark:text-slate-900 dark:hover:bg-yellow-300 font-bold text-lg px-10 py-4 shadow-md hover:shadow-lg transition-all"
              onClick={handleUpgradeToPremium}
              disabled={isLoading || !STRIPE_PUBLISHABLE_KEY || YOUR_PREMIUM_PRICE_ID_STRIPE === 'REMPLACEZ_PAR_ID_PRIX_STRIPE'}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
              ) : (
                "Passer à Premium Maintenant"
              )}
            </Button>
             {(!STRIPE_PUBLISHABLE_KEY || YOUR_PREMIUM_PRICE_ID_STRIPE === 'REMPLACEZ_PAR_ID_PRIX_STRIPE') && (
                <p className="text-xs text-red-400 mt-2">Le paiement est temporairement indisponible. Veuillez réessayer plus tard.</p>
            )}
            <p className="mt-6 text-sm text-purple-400 dark:text-purple-500">
              Paiement sécurisé par Stripe. Annulable à tout moment.
            </p>
          </section>

          <footer className="text-center mt-16">
            <Link to="/" className="text-purple-300 hover:text-yellow-400 transition-colors dark:text-purple-400 dark:hover:text-yellow-300">
              ← Retour à l'application
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
};

export default PremiumPage;