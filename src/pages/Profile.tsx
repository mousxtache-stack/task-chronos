// src/pages/Profile.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTheme, ThemeStyle } from "@/lib/context/ThemeContext";
import { useAlert } from "@/lib/context/AlertContext";
import { useLayout, LayoutMode } from "@/lib/context/LayoutContext";
import { useProfileData, ProfileData as AppProfileData } from "@/lib/context/ProfileContext"; // MODIFIÉ: Importer le contexte de profil
// --- AJOUT DES COMPOSANTS ACCORDION ---
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// --- ICONES ---
import {
  User, Mail, Phone, Save, ArrowLeft, Palette, AtSign, BookText, LayoutGrid, Bell, BellOff, LogOut, Trash2, Loader2, AlertTriangle, Star, Lock, Eye, EyeOff, Info, CheckCircle2, XCircle, ExternalLink, Link2,
  Settings, ShieldCheck, InfoIcon,
  ChevronDown,
  Sparkles,
  ListChecks,
  Repeat,
  Pin
} from "lucide-react";

// Utiliser AppProfileData du contexte, mais on peut étendre pour les besoins spécifiques de la page si nécessaire
// Ici, on s'attend à ce que AppProfileData contienne déjà les champs des fonctionnalités avancées
// Si ce n'est pas le cas, ProfileData ici peut être une extension

// Type pour l'état local des formulaires sur CETTE page
interface PageProfileState extends Omit<AppProfileData, 'id'> { // Omit id car il vient de user.id
  // Pas besoin de redéfinir si AppProfileData est complet
}


// Type pour l'état local des fonctionnalités avancées tel que géré par les switches
interface AdvancedFeaturesSwitchesState {
  subtasks: boolean;
  smartRecurrence: boolean;
  pinnedTasks: boolean;
}

export function Profile() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { themeStyle, setThemeStyle } = useTheme();
  const { layoutMode } = useLayout();
  const { profile: contextProfile, loadingProfile: loadingContextProfile, fetchProfile } = useProfileData(); // MODIFIÉ: Utiliser le hook du contexte

  const [user, setUser] = useState<any>(null); // Utilisateur Supabase Auth

  // État pour les champs du formulaire, initialisé à partir du contexte ou par défaut
  const [formProfile, setFormProfile] = useState<Partial<PageProfileState>>({
    full_name: "",
    email: "", // L'email sera pris de user.email et non modifiable ici
    phone: "",
    username: "",
    bio: "",
    default_layout: layoutMode,
    email_notifications_enabled: true,
    is_premium: false, // is_premium est généralement géré côté serveur ou via des webhooks de paiement
  });

  // État local pour les toggles des fonctionnalités avancées
  const [advancedFeatureSwitches, setAdvancedFeatureSwitches] = useState<AdvancedFeaturesSwitchesState>({
    subtasks: false,
    smartRecurrence: false,
    pinnedTasks: false,
  });

  const [pageLoading, setPageLoading] = useState(true); // Chargement spécifique à la page
  const [actionLoading, setActionLoading] = useState<'logout' | 'delete' | 'link_google' | null>(null);
  const [isUserPremiumState, setIsUserPremiumState] = useState(false); // État local pour is_premium
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(["personal-info"]);


  useEffect(() => {
    const initializePage = async () => {
        setPageLoading(true);
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
            showAlert("Erreur", "Utilisateur non authentifié.", "error");
            navigate('/auth');
            setPageLoading(false);
            return;
        }
        setUser(authUser);

        // Vérifier si le compte Google est lié
        const googleIdentity = authUser.identities?.find(
            (identity: any) => identity.provider === 'google'
        );
        setIsGoogleLinked(!!googleIdentity);

        // Si le profil du contexte est déjà chargé, l'utiliser
        if (contextProfile && !loadingContextProfile) {
            setFormProfile({
                full_name: contextProfile.full_name || authUser.user_metadata?.full_name || "",
                email: authUser.email || "", // Email non modifiable
                phone: contextProfile.phone || "",
                username: contextProfile.username || authUser.user_metadata?.preferred_username || "",
                bio: contextProfile.bio || "",
                default_layout: contextProfile.default_layout || layoutMode,
                email_notifications_enabled: contextProfile.email_notifications_enabled ?? true,
                is_premium: contextProfile.is_premium || false,
            });
            setAdvancedFeatureSwitches({
                subtasks: contextProfile.enable_subtasks || false,
                smartRecurrence: contextProfile.enable_smart_recurrence || false,
                pinnedTasks: contextProfile.enable_pinned_tasks || false,
            });
            setIsUserPremiumState(contextProfile.is_premium || false);
            setPageLoading(false);
        } else if (loadingContextProfile) {
            // Attendre que le contexte finisse de charger
            // Peut-être un setPageLoading(true) ici explicitement
        } else {
            // Si le contexte n'a pas chargé (improbable si ProfileProvider est bien placé),
            // ou si on veut forcer un fetch (ce qui est déjà fait par le contexte)
            // On pourrait appeler fetchProfile() ici, mais le contexte devrait le gérer.
            // Pour l'instant, on assume que le contexte se charge ou est chargé.
            // Si contextProfile est null et !loadingContextProfile, c'est qu'il n'y a pas de profil.
            setFormProfile(prev => ({
                ...prev,
                email: authUser.email || "",
                full_name: authUser.user_metadata?.full_name || "",
                username: authUser.user_metadata?.preferred_username || "",
            }));
             setPageLoading(false); // Fin du chargement de la page même si le profil est vide
        }
    };

    initializePage();
  }, [contextProfile, loadingContextProfile, showAlert, navigate, layoutMode]); // MODIFIÉ: Dépendre du profil du contexte


  // Mettre à jour l'état local si le profil du contexte change (par exemple, après un fetchProfile)
  useEffect(() => {
    if (contextProfile) {
        setFormProfile({
            full_name: contextProfile.full_name || user?.user_metadata?.full_name || "",
            email: user?.email || "",
            phone: contextProfile.phone || "",
            username: contextProfile.username || user?.user_metadata?.preferred_username || "",
            bio: contextProfile.bio || "",
            default_layout: contextProfile.default_layout || layoutMode,
            email_notifications_enabled: contextProfile.email_notifications_enabled ?? true,
            is_premium: contextProfile.is_premium || false,
        });
        setAdvancedFeatureSwitches({
            subtasks: contextProfile.enable_subtasks || false,
            smartRecurrence: contextProfile.enable_smart_recurrence || false,
            pinnedTasks: contextProfile.enable_pinned_tasks || false,
        });
        setIsUserPremiumState(contextProfile.is_premium || false);
    }
    // Si l'utilisateur Supabase est disponible, s'assurer que l'email est à jour
    if (user && !formProfile.email) {
        setFormProfile(prev => ({ ...prev, email: user.email || ""}));
    }

  }, [contextProfile, user, layoutMode]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailNotificationSwitchChange = (checked: boolean) => {
    setFormProfile((prev) => ({ ...prev, email_notifications_enabled: checked }));
  };

  const handleAdvancedFeatureToggle = (featureKey: keyof AdvancedFeaturesSwitchesState, checked: boolean) => {
    if (!isUserPremiumState) { // Utiliser l'état local de is_premium
      showAlert(
        "Fonctionnalité Premium",
        "Cette fonctionnalité est réservée aux membres Premium.",
        "info",
        {
          label: "Découvrir Premium",
          onClick: () => navigate('/premiumpage')
        }
      );
      return;
    }
    setAdvancedFeatureSwitches(prev => ({ ...prev, [featureKey]: checked }));
  };

  const handleSelectChange = (value: string) => {
    setFormProfile((prev) => ({ ...prev, default_layout: value as LayoutMode }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        showAlert("Erreur", "Utilisateur non connecté", "error");
        return;
    }
    setPageLoading(true); // Utiliser pageLoading pour le submit aussi

    try {
      const updates = {
        id: user.id, // Important: s'assurer que l'ID est celui de l'utilisateur connecté
        full_name: formProfile.full_name,
        phone: formProfile.phone,
        username: formProfile.username,
        bio: formProfile.bio,
        default_layout: formProfile.default_layout,
        email_notifications_enabled: formProfile.email_notifications_enabled,
        // Sauvegarde des fonctionnalités avancées
        enable_subtasks: advancedFeatureSwitches.subtasks,
        enable_smart_recurrence: advancedFeatureSwitches.smartRecurrence,
        enable_pinned_tasks: advancedFeatureSwitches.pinnedTasks,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates).eq('id', user.id); // S'assurer d'updater le bon profil

      if (error) throw error;

      showAlert("Succès", "Vos informations ont été enregistrées avec succès", "success");
      await fetchProfile(); // MODIFIÉ: Rafraîchir le profil dans le contexte
    } catch (error: any) {
      showAlert("Erreur", "Erreur lors de la sauvegarde: " + error.message || error.error_description, "error");
    } finally {
      setPageLoading(false);
    }
  };

  const handleThemeChange = (value: ThemeStyle) => {
    if (!isUserPremiumState) { // Utiliser l'état local de is_premium
      showAlert(
        "Fonctionnalité Premium",
        "Le choix de thèmes personnalisés est réservé aux membres Premium.",
        "info",
        {
            label: "Découvrir Premium",
            onClick: () => navigate('/premiumpage')
        }
      );
      return;
    }
    setThemeStyle(value);
    showAlert(
      "Thème modifié",
      `Le style de thème a été appliqué.`,
      "info"
    );
  };

  const handleLinkGoogle = async () => {
    setActionLoading('link_google');
    try {
        const { error } = await supabase.auth.linkIdentity({
            provider: 'google',
            options: {
                redirectTo: window.location.href,
            },
        });
        if (error) {
            throw error;
        } else {
            // La redirection a lieu, cette partie ne sera peut-être pas atteinte
            // ou alors la page se recharge et useEffect mettra à jour isGoogleLinked
            showAlert("Info", "Redirection vers Google pour lier votre compte.", "info");
        }
    } catch (error: any) {
        showAlert("Erreur de liaison", "Impossible de lier le compte Google : " + error.message, "error");
    } finally {
        // setActionLoading(null); // La redirection peut empêcher cela
    }
  };

  // ... handleLogout et handleDeleteAccount restent identiques ...
  const handleLogout = async () => {
    setActionLoading('logout');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showAlert("Déconnexion", "Vous avez été déconnecté avec succès.", "success");
      navigate('/auth');
    } catch (error: any) {
      showAlert("Erreur", "Erreur lors de la déconnexion: " + error.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      "Pour confirmer la suppression DÉFINITIVE de votre compte et de toutes vos données, veuillez taper 'SUPPRIMER' dans le champ ci-dessous. Cette action est irréversible."
    );

    if (confirmation !== 'SUPPRIMER') {
        showAlert("Annulé", "La suppression du compte a été annulée.", "info");
        return;
    }

    setActionLoading('delete');
    try {
      const { data: functionResponseData, error: invokeError } = await supabase.functions.invoke('delete-user');

      if (invokeError) {
        console.error("Function invoke client-side error:", invokeError);
        throw new Error(invokeError.message || "Erreur lors de l'appel de la fonction de suppression.");
      }

      if (functionResponseData && functionResponseData.error) {
        console.error("Edge function returned an error in its response:", functionResponseData.error);
        const detail = functionResponseData.error;
        const errorMessageFromFunction = (typeof detail === 'string' ? detail : detail.message) || "La fonction de suppression a retourné une erreur inattendue.";
        throw new Error(errorMessageFromFunction);
      }

      await supabase.auth.signOut();
      showAlert("Compte supprimé", "Votre compte a été supprimé avec succès.", "success");
      navigate('/auth');

    } catch (error: any) {
      console.error("Delete account error details:", error);
      showAlert(
        "Erreur de suppression",
        `Une erreur est survenue : ${error.message}. Vérifiez la console pour plus de détails.`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };


  if (pageLoading || loadingContextProfile && !contextProfile) { // MODIFIÉ: Condition de chargement
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-sm">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
           <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
             <User className="h-6 w-6 text-primary"/> Mon Profil
          </CardTitle>
          <CardDescription>
            Gérez vos informations personnelles, préférences et sécurité.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-2">
            <div className="space-y-3 p-4 border rounded-lg bg-background mb-6">
              <h3 className="text-md font-medium flex items-center">
                <Star className={`mr-2 h-5 w-5 ${isUserPremiumState ? 'text-yellow-400 fill-yellow-300' : 'text-muted-foreground'}`} />
                Statut du Compte :
                <span className={`ml-2 font-semibold ${isUserPremiumState ? 'text-green-500' : 'text-blue-500'}`}>
                  {isUserPremiumState ? "Premium" : "Gratuit"}
                </span>
              </h3>
              {!isUserPremiumState && (
                <p className="text-sm text-muted-foreground">
                  Passez à la version Premium pour des fonctionnalités illimitées.{" "}
                  <Link to="/premiumpage" className="text-primary hover:underline font-medium">
                    Découvrir Premium
                  </Link>
                </p>
              )}
            </div>

            <Accordion
              type="multiple"
              collapsible
              className="w-full"
              value={openAccordionItems}
              onValueChange={setOpenAccordionItems}
            >
              <AccordionItem value="personal-info">
                <AccordionTrigger className="text-lg font-medium hover:no-underline px-1">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informations Personnelles
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 px-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="full_name" name="full_name" value={formProfile.full_name || ""} onChange={handleChange} placeholder="Votre nom complet" className="pl-10" disabled={pageLoading || !!actionLoading}/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Nom d'utilisateur</Label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="username" name="username" value={formProfile.username || ""} onChange={handleChange} placeholder="Votre pseudo public" className="pl-10" disabled={pageLoading || !!actionLoading}/>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" name="email" value={formProfile.email || ""} disabled className="pl-10 bg-muted/50 cursor-not-allowed"/>
                    </div>
                    <p className="text-xs text-muted-foreground">L'email est lié à votre compte et ne peut pas être modifié ici.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (Optionnel)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" name="phone" value={formProfile.phone || ""} onChange={handleChange} placeholder="Votre numéro de téléphone" className="pl-10" disabled={pageLoading || !!actionLoading}/>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="app-preferences">
                <AccordionTrigger className="text-lg font-medium hover:no-underline px-1">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Préférences d'Application
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 px-1 space-y-6">
                  {/* Style d'affichage (Thèmes) */}
                  <div className={`space-y-3 p-4 rounded-lg ${!isUserPremiumState ? 'bg-muted/40 opacity-70 relative' : 'border'}`}>
                    {!isUserPremiumState && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg p-2">
                        <Lock className="h-8 w-8 text-primary mb-2" />
                        <p className="text-sm font-medium text-center text-foreground">
                          Choix de thèmes personnalisés <br/>réservé aux membres <span className="text-primary font-semibold">Premium</span>.
                        </p>
                        <Button variant="link" size="sm" className="mt-1 text-primary" asChild>
                          <Link to="/premiumpage">Devenir Premium</Link>
                        </Button>
                      </div>
                    )}
                    <Label className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Style d'affichage</Label>
                    <RadioGroup value={themeStyle} onValueChange={(value) => handleThemeChange(value as ThemeStyle)} className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="default" id="theme-default" disabled={!!actionLoading || !isUserPremiumState} />
                          <Label htmlFor="theme-default" className={`flex items-center gap-2 ${!!actionLoading || !isUserPremiumState ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 border"></div> Défaut
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="blackwhite" id="theme-blackwhite" disabled={!!actionLoading || !isUserPremiumState} />
                          <Label htmlFor="theme-blackwhite" className={`flex items-center gap-2 ${!!actionLoading || !isUserPremiumState ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            <div className="h-4 w-4 rounded-full bg-black border"></div> N&B
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ocean" id="theme-ocean" disabled={!!actionLoading || !isUserPremiumState} />
                          <Label htmlFor="theme-ocean" className={`flex items-center gap-2 ${!!actionLoading || !isUserPremiumState ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border"></div> Océan
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sunset" id="theme-sunset" disabled={!!actionLoading || !isUserPremiumState} />
                          <Label htmlFor="theme-sunset" className={`flex items-center gap-2 ${!!actionLoading || !isUserPremiumState ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 border"></div> Crépuscule
                          </Label>
                        </div>
                    </RadioGroup>
                  </div>
                  {/* Vue par défaut */}
                  <div className="space-y-3">
                    <Label htmlFor="default_layout" className="flex items-center gap-2"><LayoutGrid className="h-5 w-5 text-primary" /> Vue par défaut des tâches</Label>
                    <Select name="default_layout" value={formProfile.default_layout || layoutMode} onValueChange={handleSelectChange} disabled={pageLoading || !!actionLoading}>
                      <SelectTrigger id="default_layout" className="w-full md:w-[250px]">
                        <SelectValue placeholder="Choisir une vue..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normale</SelectItem>
                        <SelectItem value="compact">Compacte</SelectItem>
                        <SelectItem value="grid">Grille</SelectItem>
                        <SelectItem value="right">Avec panneau droit</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Sera utilisé lors du chargement initial de la liste des tâches.</p>
                  </div>

                  {/* --- SECTION: Fonctionnalités Avancées (Premium) --- */}
                  <div className={`space-y-1 p-4 rounded-lg ${!isUserPremiumState ? 'bg-muted/40 opacity-70 relative' : 'border'}`}>
                    {!isUserPremiumState && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg p-2">
                        <Lock className="h-8 w-8 text-primary mb-2" />
                        <p className="text-sm font-medium text-center text-foreground">
                          Fonctionnalités avancées <br/>réservées aux membres <span className="text-primary font-semibold">Premium</span>.
                        </p>
                        <Button variant="link" size="sm" className="mt-1 text-primary" asChild>
                          <Link to="/premiumpage">Devenir Premium</Link>
                        </Button>
                      </div>
                    )}
                    <Label className="flex items-center gap-2 text-md font-medium mb-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Fonctionnalités Avancées
                    </Label>

                    <div className="flex items-center justify-between space-x-2 py-3 border-t border-border/50 first:border-t-0 first:pt-1">
                      <Label htmlFor="feature-subtasks" className={`flex flex-col space-y-1 ${!isUserPremiumState ? 'cursor-not-allowed' : ''}`}>
                        <span className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-muted-foreground" /> Sous-tâches</span>
                        <span className="font-normal leading-snug text-muted-foreground text-xs pl-6">
                          Chaque tâche peut avoir une checklist de sous-étapes. (Disponible uniquement sur PC)
                        </span>
                      </Label>
                      <Switch
                        id="feature-subtasks"
                        checked={advancedFeatureSwitches.subtasks}
                        onCheckedChange={(checked) => handleAdvancedFeatureToggle('subtasks', checked)}
                        disabled={!isUserPremiumState || pageLoading || !!actionLoading}
                        className={!isUserPremiumState ? 'cursor-not-allowed opacity-50' : ''}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2 py-3 border-t border-border/50">
                      <Label htmlFor="feature-smart-recurrence" className={`flex flex-col space-y-1 ${!isUserPremiumState ? 'cursor-not-allowed' : ''}`}>
                        <span className="flex items-center gap-2"><Repeat className="h-4 w-4 text-muted-foreground" /> Tâches récurrentes intelligentes</span>
                        <span className="font-normal leading-snug text-muted-foreground text-xs pl-6">
                          "Tous les lundis sauf fériés", "Le 1er du mois", etc. (Disponible uniquement sur PC)
                        </span>
                      </Label>
                      <Switch
                        id="feature-smart-recurrence"
                        checked={advancedFeatureSwitches.smartRecurrence}
                        onCheckedChange={(checked) => handleAdvancedFeatureToggle('smartRecurrence', checked)}
                        disabled={!isUserPremiumState || pageLoading || !!actionLoading}
                        className={!isUserPremiumState ? 'cursor-not-allowed opacity-50' : ''}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2 py-3 border-t border-border/50">
                      <Label htmlFor="feature-pinned-tasks" className={`flex flex-col space-y-1 ${!isUserPremiumState ? 'cursor-not-allowed' : ''}`}>
                        <span className="flex items-center gap-2"><Pin className="h-4 w-4 text-muted-foreground" /> Tâches épinglées prioritaires</span>
                        <span className="font-normal leading-snug text-muted-foreground text-xs pl-6">
                          Une tâche urgente toujours visible en haut de page.
                        </span>
                      </Label>
                      <Switch
                        id="feature-pinned-tasks"
                        checked={advancedFeatureSwitches.pinnedTasks}
                        onCheckedChange={(checked) => handleAdvancedFeatureToggle('pinnedTasks', checked)}
                        disabled={!isUserPremiumState || pageLoading || !!actionLoading}
                        className={!isUserPremiumState ? 'cursor-not-allowed opacity-50' : ''}
                      />
                    </div>
                    
                  </div>

                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="linked-accounts">
                <AccordionTrigger className="text-lg font-medium hover:no-underline px-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Connexions & Sécurité
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 px-1 space-y-6">
                  <div className="p-4 border rounded-lg bg-background/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src="/google-icon.svg" alt="Google" className="h-6 w-6" />
                        <div>
                          <p className="font-medium">Google</p>
                          <p className={`text-sm ${isGoogleLinked ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {isGoogleLinked ? "Connecté" : "Non connecté"}
                          </p>
                        </div>
                      </div>
                      {isGoogleLinked ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Associé</span>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={handleLinkGoogle} disabled={!!actionLoading}>
                          {actionLoading === 'link_google' ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<ExternalLink className="mr-2 h-4 w-4" />)}
                          Lier le compte
                        </Button>
                      )}
                    </div>
                    {!isGoogleLinked && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Liez votre compte Google pour une connexion simplifiée et sécurisée.
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="info-support">
                <AccordionTrigger className="text-lg font-medium hover:no-underline px-1">
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Informations & Support
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 px-1 space-y-4">
                    <Link
                        to="/InformationHubPage"
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border"
                    >
                        <div className="flex items-center gap-3">
                            <Info className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Centre d'Information & Support</span>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-muted-foreground transform rotate-180" />
                    </Link>
                    <p className="text-xs text-muted-foreground px-1">
                        Consultez notre FAQ, nos conditions d'utilisation, politique de confidentialité et mentions légales.
                    </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>

          <CardFooter className="border-t px-6 py-4 bg-muted/30 mt-4">
            <Button type="submit" disabled={pageLoading || !!actionLoading} className="w-full sm:w-auto">
              {(pageLoading && !actionLoading) ? ( // Simplifié la condition du loader du bouton
                <span className="flex items-center"><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Sauvegarde...</span>
              ) : (
                <span className="flex items-center"><Save className="mr-2 h-4 w-4" /> Sauvegarder les modifications</span>
              )}
            </Button>
          </CardFooter>
        </form>

        <Separator className="my-6" />
        <CardContent className="pt-0 pb-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5"/> Zone de Danger
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDangerZone(!showDangerZone)}
              aria-label={showDangerZone ? "Cacher la zone de danger" : "Afficher la zone de danger"}
              className="text-destructive hover:bg-destructive/10"
              disabled={!!actionLoading}
            >
              {showDangerZone ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>

          {showDangerZone && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                <div className="flex-1">
                  <p className="font-medium text-destructive">Supprimer ce compte</p>
                  <p className="text-sm text-destructive/80">
                    Une fois votre compte supprimé, toutes ses ressources et données seront définitivement effacées. Cette action est irréversible.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={!!actionLoading} className="w-full sm:w-auto flex-shrink-0">
                  {actionLoading === 'delete' ? (<span className="flex items-center"><Loader2 className="animate-spin mr-2 h-4 w-4" /> Suppression...</span>) : (<span className="flex items-center"><Trash2 className="mr-2 h-4 w-4" /> Supprimer mon compte</span>)}
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                <p className="text-sm text-muted-foreground flex-1">Mettre fin à votre session actuelle sur cet appareil.</p>
                <Button variant="outline" onClick={handleLogout} disabled={!!actionLoading} className="w-full sm:w-auto flex-shrink-0">
                  {actionLoading === 'logout' ? (<span className="flex items-center"><Loader2 className="animate-spin mr-2 h-4 w-4" /> Déconnexion...</span>) : (<span className="flex items-center"><LogOut className="mr-2 h-4 w-4" /> Se Déconnecter</span>)}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}