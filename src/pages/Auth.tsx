import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowRight, LogIn, UserPlus, CheckCircle } from "lucide-react";
import BlurText from "@/BlurText/BlurText";
import { ThemeStyle, useTheme } from "@/lib/context/ThemeContext";
import { useAlert } from "@/lib/context/AlertContext";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup' | 'theme-choice'>('welcome');
  const [step, setStep] = useState<'email' | 'password' | 'complete'>('email');
  const [preferredTheme, setPreferredTheme] = useState<ThemeStyle>('default');
  const navigate = useNavigate();
  const { setThemeStyle } = useTheme();
  const [showAnimation, setShowAnimation] = useState(true);
  const { showAlert } = useAlert();

  // Animation d'entrée
  useEffect(() => {
    if (mode === 'welcome') {
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setStep('email');
  };

  const switchMode = (newMode: 'login' | 'signup') => {
    resetForm();
    setMode(newMode);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showAlert("Email invalide", "Veuillez entrer une adresse email valide", "error");
      return;
    }
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      showAlert("Mot de passe trop court", "Le mot de passe doit faire au moins 6 caractères", "error");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        showAlert("Connexion réussie", "Vous êtes maintenant connecté", "success");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        showAlert("Inscription réussie", "Compte créé avec succès", "success");
        setStep('complete');
        setMode('theme-choice');
      }
    } catch (error: any) {
      showAlert("Erreur", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChoice = () => {
    // Appliquer le thème choisi
    setThemeStyle(preferredTheme);
    
    showAlert("Thème appliqué", "Votre préférence de thème a été enregistrée", "success");
    
    // Rediriger vers la page d'accueil
    navigate("/");
  };

  // Rendu de l'écran d'accueil
  if (mode === 'welcome' && showAnimation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <BlurText
          text="Bienvenue sur Task Chronos"
          delay={100}
          animateBy="words"
          direction="top"
          className="text-4xl md:text-5xl font-bold text-white mb-8"
          onAnimationComplete={() => setShowAnimation(false)}
        />
      </div>
    );
  }

  // Rendu des boutons de choix login/signup
  if (mode === 'welcome' && !showAnimation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Task Chronos</h1>
          <p className="text-gray-400 text-xl">Gérez votre temps efficacement</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
          <Button 
            onClick={() => switchMode('login')}
            className="flex-1 h-14 bg-gray-800 text-white hover:bg-gray-700 hover:scale-102 transition-all duration-300 text-base font-medium shadow-md border border-gray-700"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Connexion
          </Button>
          
          <Button 
            onClick={() => switchMode('signup')}
            className="flex-1 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:scale-102 transition-all duration-300 text-base font-medium shadow-xl"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Inscription
          </Button>
        </div>
      </div>
    );
  }

  // Rendu du choix de thème
  if (mode === 'theme-choice') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md p-8 rounded-xl bg-gray-900/60 border border-gray-800 backdrop-blur-sm shadow-2xl">
          <div className="text-center mb-10">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Compte créé avec succès!</h2>
            <p className="text-gray-400">Choisissez votre style préféré pour personnaliser votre expérience</p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div 
              className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                preferredTheme === 'default' 
                  ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-indigo-900/40' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
              onClick={() => setPreferredTheme('default')}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    {preferredTheme === 'default' && (
                      <CheckCircle className="h-6 w-6 text-white" />
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Thème Violet</h3>
                  <p className="text-sm text-gray-400">Moderne et élégant</p>
                </div>
              </div>
            </div>
            
            <div 
              className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                preferredTheme === 'blackwhite' 
                  ? 'border-white bg-gradient-to-br from-gray-900/60 to-gray-800/60' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
              onClick={() => setPreferredTheme('blackwhite')}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-100 to-gray-300 flex items-center justify-center shadow-lg">
                    {preferredTheme === 'blackwhite' && (
                      <CheckCircle className="h-6 w-6 text-gray-900" />
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Noir & Blanc</h3>
                  <p className="text-sm text-gray-400">Minimaliste et contrasté</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleThemeChoice}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-300"
          >
            Commencer à utiliser Task Chronos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Rendu de la page login/signup par étapes
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BlurText
            text={mode === 'login' ? "Connexion" : "Créer un compte"}
            delay={50}
            animateBy="letters"
            direction="top"
            className="text-3xl font-bold text-white mb-2"
          />
          <p className="text-gray-400">
            {mode === 'login' 
              ? "Accédez à votre espace personnel" 
              : "Rejoignez Task Chronos dès maintenant"}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <BlurText
                text="Entrez votre adresse email"
                delay={30}
                animateBy="words"
                direction="bottom"
                className="text-sm font-medium text-white"
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                className="h-12 bg-gray-900 border-gray-800 focus:border-indigo-500 text-white"
                autoFocus
              />
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300"
            >
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center mt-6">
              <Button
                variant="link"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-gray-400 hover:text-white"
              >
                {mode === 'login'
                  ? "Pas de compte ? S'inscrire"
                  : "Déjà un compte ? Se connecter"}
              </Button>
            </div>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <BlurText
                text="Entrez votre mot de passe"
                delay={30}
                animateBy="words"
                direction="bottom"
                className="text-sm font-medium text-white"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe (6 caractères minimum)"
                className="h-12 bg-gray-900 border-gray-800 focus:border-indigo-500 text-white"
                minLength={6}
                autoFocus
              />
            </div>
            
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="flex-1 h-12 border-gray-800 text-white hover:bg-gray-800 transition-all duration-300"
              >
                Retour
              </Button>
              
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {mode === 'login' ? (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Se connecter
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        S'inscrire
                      </>
                    )}
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}