import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowRight, LogIn, UserPlus, CheckCircle, User, Loader2 } from "lucide-react"; // Ajout de Loader2 pour l'état de chargement Google
import BlurText from "@/BlurText/BlurText";
import { ThemeStyle, useTheme } from "@/lib/context/ThemeContext";
import { useAlert } from "@/lib/context/AlertContext";
import { SmoothCaretInput } from "@/components/SmoothCaretInput";

// Simple SVG component for Google Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.712,34.438,44,28.083,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // State for Google login loading
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup' | 'theme-choice'>('welcome');
  const [step, setStep] = useState<'email' | 'password' | 'full-name' | 'complete'>('email');
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

  // --- Existing functions (resetForm, switchMode, handleEmailSubmit, handlePasswordSubmit, handleFullNameSubmit, skipFullName, signUpUser, handleThemeChoice) ---
  // ... (keep all existing functions as they are) ...
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
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

    if (mode === 'login') {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        showAlert("Connexion réussie", "Vous êtes maintenant connecté", "success");
        navigate("/");
      } catch (error: any) {
        showAlert("Erreur", error.message, "error");
      } finally {
        setLoading(false);
      }
    } else {
      // Si on est en mode inscription, on passe à l'étape du nom complet
      setStep('full-name');
    }
  };

  const handleFullNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUpUser();
  };

  const skipFullName = async () => {
    await signUpUser();
  };

const signUpUser = async () => {
  setLoading(true);
  try {
    const profileData: { full_name?: string } = {};
    if (fullName.trim()) {
      profileData.full_name = fullName.trim();
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profileData
      }
    });

    if (error) throw error;

    showAlert("Inscription réussie", "Compte créé avec succès. Veuillez vérifier vos emails pour confirmer votre compte si nécessaire.", "success");
    setStep('complete');
    setMode('theme-choice');

  } catch (error: any) {
    showAlert("Erreur", error.message, "error");
  } finally {
    setLoading(false);
  }
};

  const handleThemeChoice = () => {
    setThemeStyle(preferredTheme);
    showAlert("Thème appliqué", "Votre préférence de thème a été enregistrée", "success");
    navigate("/");
  };

  // --- Google Login Handler ---
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Optionnel : rediriger vers une page spécifique après le retour de Google
          // redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
      // La redirection vers Google se fait automatiquement par Supabase.
      // Après le retour de Google, Supabase gère la session.
      // On pourrait afficher une alerte de succès ici, mais c'est souvent géré
      // par un listener d'état d'authentification global dans l'application.
    } catch (error: any) {
      showAlert("Erreur Google Login", error.message || "Une erreur est survenue lors de la connexion avec Google.", "error");
      setGoogleLoading(false); // Ensure loading is stopped on error
    }
    // Note: Ne pas mettre setGoogleLoading(false) ici car la page va être redirigée.
    // Il sera remis à false lors du prochain rendu du composant si l'utilisateur revient sans s'être connecté.
  };


  // --- Rendu des différentes étapes ---

  // Rendu de l'écran d'accueil (inchangé)
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

  // Rendu des boutons de choix login/signup (inchangé)
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

  // Rendu du choix de thème (inchangé)
  if (mode === 'theme-choice') {
    // ... (garder le code existant pour theme-choice) ...
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

  // Rendu de la page login/signup par étapes (modifié pour inclure Google)
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
          <div className="space-y-6"> {/* Wrapper div for spacing */}
            {/* Bouton Google Login */}
            <Button
  type="button"
  variant="outline"
  onClick={handleGoogleLogin}
  className="w-full h-12 border-white-700 text-black hover:bg-gray-800/50 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group"
  disabled={googleLoading || loading}
>

              {googleLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon className="h-5 w-5 group-hover:scale-105 transition-transform" /> // Style hover optionnel
              )}
              Continuer avec Google
            </Button>

            {/* Séparateur */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-gray-500">
                  Ou continuer avec l'email
                </span>
              </div>
            </div>

            {/* Formulaire Email */}
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                 <BlurText
                    text="Entrez votre adresse email"
                    delay={30}
                    animateBy="words"
                    direction="bottom"
                    className="text-sm font-medium text-white"
                  />
                <div className="relative"> {/* Ajout pour l'icône */}
                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <SmoothCaretInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="h-12 bg-gray-900 border-gray-800 focus:border-indigo-500 text-white pl-10" // Ajout padding left
                    autoFocus
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300"
                disabled={loading || googleLoading} // Désactiver si Google charge aussi
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : (
                  <>
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Lien pour changer de mode */}
            <div className="text-center mt-6">
              <Button
                variant="link"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-gray-400 hover:text-white"
                disabled={googleLoading || loading}
              >
                {mode === 'login'
                  ? "Pas de compte ? S'inscrire"
                  : "Déjà un compte ? Se connecter"}
              </Button>
            </div>
          </div>
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
              <SmoothCaretInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe (6 caractères minimum)"
                className="h-12 bg-gray-900 border-gray-800 focus:border-indigo-500 text-white"
                minLength={6}
                autoFocus
                required
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="flex-1 h-12 border-gray-700 text-white hover:bg-gray-800/50 transition-all duration-300" // Style ajusté
                disabled={loading}
              >
                Retour
              </Button>

              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center" // flex ajouté
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    {mode === 'login' ? (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Se connecter
                      </>
                    ) : (
                      <>
                        Continuer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 'full-name' && mode === 'signup' && (
          <form onSubmit={handleFullNameSubmit} className="space-y-6">
             <div className="space-y-2">
               <BlurText
                 text="Entrez votre nom complet (Optionnel)" // Précision ajoutée
                 delay={30}
                 animateBy="words"
                 direction="bottom"
                 className="text-sm font-medium text-white"
               />
               <div className="relative">
                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" /> {/* Position ajustée */}
                 <SmoothCaretInput
                   type="text"
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value)}
                   placeholder="Prénom et nom"
                   className="h-12 bg-gray-900 border-gray-800 focus:border-indigo-500 text-white pl-10"
                   autoFocus
                 />
               </div>
               <p className="text-xs text-gray-500">
                 Cette information sera utilisée pour personnaliser votre expérience.
               </p>
             </div>

             <div className="flex flex-col gap-4">
               <Button
                 type="submit"
                 className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center" // flex ajouté
                 disabled={loading}
               >
                 {loading ? (
                   <Loader2 className="h-5 w-5 animate-spin" />
                 ) : (
                   <span className="flex items-center">
                     <UserPlus className="mr-2 h-5 w-5" />
                     S'inscrire
                   </span>
                 )}
               </Button>

               <Button
                 type="button"
                 variant="link"
                 onClick={skipFullName} // La fonction skip appelle déjà signUpUser
                 className="text-gray-400 hover:text-white text-sm"
                 disabled={loading}
               >
                 Éviter cette étape
               </Button>

               <Button
                 type="button"
                 variant="outline"
                 onClick={() => setStep('password')}
                 className="h-10 border-gray-700 text-white hover:bg-gray-800/50 transition-all duration-300 text-sm" // Style ajusté
                 disabled={loading}
               >
                 Retour
               </Button>
             </div>
          </form>
        )}
      </div>
    </div>
  );
}