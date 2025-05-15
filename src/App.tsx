import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Profile } from "./pages/Profile"; // Importation du composant Profile
import { LayoutProvider } from "./lib/context/LayoutContext";
import { ThemeProvider } from "./lib/context/ThemeContext";
import { AlertProvider } from "./lib/context/AlertContext";
import EmailConfirmation from "@/pages/EmailConfirmation"; // ou le chemin relatif selon ton projet
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import PremiumPage from "@/pages/PremiumPage";
import PaymentStatusPage from './pages/PaymentStatusPage'; 


const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LayoutProvider>
            <AlertProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route
                    path="/"
                    element={
                      session ? (
                        <Index />
                      ) : (
                        <Navigate to="/auth" replace />
                      )
                    }
                  />
                  <Route
                    path="/auth"
                    element={
                      !session ? (
                        <Auth />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  {/* Nouvelle route pour la page Profile */}
                  <Route
                    path="/profile"
                    element={
                      session ? (
                        <Profile />
                      ) : (
                        <Navigate to="/auth" replace />
                      )
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/email-confirmation" element={<EmailConfirmation />} />
                  <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                  <Route path="/PremiumPage" element={<PremiumPage />} />
                  <Route path="/payment-status" element={<PaymentStatusPage />} />
                </Routes>
              </BrowserRouter>
            </AlertProvider>
          </LayoutProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;