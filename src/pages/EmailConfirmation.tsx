import { MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function EmailConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/60 border border-gray-800 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center">
        <div className="mb-6">
          <MailCheck className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Vérification effectué !</h1>
          <p className="text-gray-400 mt-2">
            Vous venez bien de confirmer votre e-mail.
            <br />
          </p>
        </div>

        <Button
          onClick={() => navigate("/")}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base h-12 transition-all"
        >
          Retour à l'accueil
          <ArrowLeft className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
