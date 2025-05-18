// src/components/PremiumFeatureModal.tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose, // Pour un bouton de fermeture optionnel dans le footer
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Lock, Sparkles, ArrowRight } from "lucide-react"; // Ou d'autres icônes pertinentes
  import { useNavigate } from "react-router-dom";
  
  interface PremiumFeatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string; // Nom de la fonctionnalité pour personnaliser le message
    premiumPagePath?: string; // Chemin vers votre page premium
  }
  
  export function PremiumFeatureModal({
    isOpen,
    onClose,
    featureName = "cette fonctionnalité",
    premiumPagePath = "/premiumpage", // Assurez-vous que c'est la bonne route
  }: PremiumFeatureModalProps) {
    const navigate = useNavigate();
  
    const handleGoToPremium = () => {
      navigate(premiumPagePath);
      onClose(); // Ferme la modale après la navigation
    };
  
    if (!isOpen) return null;
  
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-semibold">
              Fonctionnalité Premium
            </DialogTitle>
            <DialogDescription className="mt-2 px-4 text-muted-foreground">
              Le <span className="font-semibold text-foreground">{featureName}</span> est réservé à nos membres Premium.
              Débloquez-le ainsi que de nombreux autres avantages en passant à Premium !
            </DialogDescription>
          </DialogHeader>
  
          <div className="my-6 text-center">
            <p className="text-sm text-muted-foreground">
              Profitez d'une expérience Task Chronos sans limites.
            </p>
          </div>
  
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Plus tard
            </Button>
            <Button
              onClick={handleGoToPremium}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
            >
              Découvrir Premium <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }