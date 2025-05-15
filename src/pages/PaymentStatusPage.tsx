// src/pages/PaymentStatusPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client'; // Si vous voulez vérifier la session Stripe
import { useAlert } from '@/lib/context/AlertContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PaymentStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [status, setStatus] = useState<'loading' | 'success' | 'canceled' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification de votre paiement...');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('stripe_session_id');
    const paymentSuccess = queryParams.get('payment_success');
    const paymentCanceled = queryParams.get('payment_canceled'); // Si vous aviez une cancel_url pointant ici

    if (paymentSuccess === 'true' && sessionId) {
      setStatus('success');
      setMessage('Paiement réussi ! Votre compte Premium est en cours d\'activation. Vous serez redirigé(e) dans quelques instants.');
      
      // Optionnel : Vous pourriez appeler une fonction Supabase pour vérifier la session Stripe
      // et déclencher une mise à jour de l'état utilisateur dans le client plus rapidement,
      // mais le webhook reste la source de vérité pour la DB.
      // verifyStripeSession(sessionId);

      setTimeout(() => {
        navigate('/'); // Rediriger vers la page d'accueil
        window.location.reload(); // Pour forcer le re-fetch du profil dans Index.tsx
      }, 5000); // Délai de 5 secondes
    } else if (paymentCanceled === 'true') {
      setStatus('canceled');
      setMessage('Le processus de paiement a été annulé. Vous pouvez réessayer depuis la page Premium.');
    } else {
      setStatus('error');
      setMessage('Une erreur est survenue lors du traitement de votre paiement ou la page a été accédée incorrectement.');
      showAlert('Erreur de paiement', 'Les informations de paiement sont invalides ou manquantes.', 'error');
    }

    // Nettoyer les paramètres de l'URL pour éviter les re-déclenchements au refresh
    if (queryParams.toString()) {
        navigate(location.pathname, { replace: true });
    }

  }, [location, navigate, showAlert]);

  // Fonction optionnelle pour vérifier la session Stripe côté client
  // const verifyStripeSession = async (sessionId: string) => {
  //   try {
  //     // Vous auriez besoin d'une fonction Edge pour cela qui appelle l'API Stripe
  //     // pour récupérer la session et vérifier son statut.
  //     // const { data, error } = await supabase.functions.invoke('verify-stripe-session', {
  //     //   body: { sessionId },
  //     // });
  //     // if (error) throw error;
  //     // if (data && data.payment_status === 'paid') {
  //     //   // Potentiellement mettre à jour un contexte utilisateur ici
  //     // }
  //   } catch (error) {
  //     console.error("Erreur de vérification de la session Stripe:", error);
  //   }
  // };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-4">
      
      <Card className="w-full max-w-md text-center bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && <Loader2 className="inline-block mr-2 h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="inline-block mr-2 h-8 w-8 text-green-500" />}
            {status === 'canceled' && <XCircle className="inline-block mr-2 h-8 w-8 text-yellow-500" />}
            {status === 'error' && <XCircle className="inline-block mr-2 h-8 w-8 text-red-500" />}
            Statut du Paiement
          </CardTitle>
          <CardDescription className="text-muted-foreground">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <p className="text-sm">La mise à jour de votre compte peut prendre quelques instants.</p>
          )}
          {status !== 'loading' && (
            <Button asChild className="mt-6">
              <Link to={status === 'canceled' || status === 'error' ? "/premiupage" : "/"}>
                {status === 'canceled' || status === 'error' ? "Retourner à la page Premium" : "Aller à l'accueil"}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatusPage;