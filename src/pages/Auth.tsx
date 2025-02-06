import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Github, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation du mot de passe
    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit faire au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (!error) {
        toast({
          title: isSignUp ? "Inscription réussie" : "Connexion réussie",
          description: isSignUp
            ? "Vérifiez votre email pour confirmer votre compte"
            : "Vous êtes maintenant connecté",
        });
        if (!isSignUp) navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {isSignUp ? "Créer un compte" : "Se connecter"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isSignUp
              ? "Créez votre compte pour commencer"
              : "Connectez-vous à votre compte"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={loading}
          >
            <Mail className="mr-2" />
            {isSignUp ? "S'inscrire" : "Se connecter"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGithubLogin}
            className="w-full h-12 text-base font-medium"
          >
            <Github className="mr-2" />
            GitHub
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary"
          >
            {isSignUp
              ? "Déjà un compte ? Se connecter"
              : "Pas de compte ? S'inscrire"}
          </Button>
        </div>
      </div>
    </div>
  );
}