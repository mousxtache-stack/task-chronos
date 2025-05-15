// src/pages/Profile.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
// --- MODIFICATION: Ajout de Eye et EyeOff ---
import { User, Mail, Phone, Save, ArrowLeft, Palette, AtSign, BookText, LayoutGrid, Bell, BellOff, LogOut, Trash2, Loader2, AlertTriangle, Star, Lock, Eye, EyeOff } from "lucide-react"; 

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  username: string;
  bio: string;
  default_layout: LayoutMode | string;
  email_notifications_enabled: boolean;
  is_premium?: boolean; 
}

export function Profile() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { themeStyle, setThemeStyle } = useTheme();
  const { layoutMode } = useLayout();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    username: "",
    bio: "",
    default_layout: layoutMode,
    email_notifications_enabled: true,
    is_premium: false,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'logout' | 'delete' | null>(null);
  const [isUserPremium, setIsUserPremium] = useState(false);

  // --- NOUVEL ÉTAT pour la visibilité de la zone de danger ---
  const [showDangerZone, setShowDangerZone] = useState(false);

  useEffect(() => {
    // ... (fetchUserData - inchangé)
    const fetchUserData = async () => {
        setLoading(true);
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            if (userData?.user) {
              setUser(userData.user);
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, phone, username, bio, default_layout, email_notifications_enabled, is_premium')
                .eq('id', userData.user.id)
                .single();

              if (profileError && profileError.code !== 'PGRST116') {
                throw profileError;
              }

              setProfile({
                full_name: profileData?.full_name || "",
                email: userData.user.email || "",
                phone: profileData?.phone || "",
                username: profileData?.username || "",
                bio: profileData?.bio || "",
                default_layout: profileData?.default_layout || layoutMode, 
                email_notifications_enabled: profileData?.email_notifications_enabled ?? true,
              });
              setIsUserPremium(profileData?.is_premium || false);

            } else {
              navigate('/auth');
            }
        } catch (error: any) {
            showAlert("Erreur", "Erreur lors du chargement des données de profil: " + error.message, "error");
            navigate('/auth');
        } finally {
            setLoading(false);
        }
    };
    fetchUserData();
  }, [showAlert, navigate, layoutMode]);

  // ... (handleChange, handleSwitchChange, handleSelectChange, handleSubmit, handleThemeChange - inchangés)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setProfile((prev) => ({ ...prev, email_notifications_enabled: checked }));
  };

  const handleSelectChange = (value: string) => {
    setProfile((prev) => ({ ...prev, default_layout: value as LayoutMode }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        showAlert("Erreur", "Utilisateur non connecté", "error");
        return;
    }
    setLoading(true);

    try {
      const updates = {
        id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        username: profile.username,
        bio: profile.bio,
        default_layout: profile.default_layout,
        email_notifications_enabled: profile.email_notifications_enabled,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      showAlert("Succès", "Vos informations ont été enregistrées avec succès", "success");
    } catch (error: any) {
      showAlert("Erreur", "Erreur lors de la sauvegarde: " + error.message || error.error_description, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (value: ThemeStyle) => {
    if (!isUserPremium) {
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
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) {
        console.error("Function invoke error:", error);
        let errorMessage = error.message;
        try {
            const parsedError = JSON.parse(error.message);
            if (parsedError.error) errorMessage = parsedError.error;
        } catch (e) { /* Ignorer */ }
        throw new Error(errorMessage || "Erreur lors de l'appel de la fonction de suppression.");
      }
      await supabase.auth.signOut();
      showAlert("Compte supprimé", "Votre compte a été supprimé avec succès.", "success");
      navigate('/auth');
    } catch (error: any) {
      console.error("Delete account error details:", error);
      showAlert(
        "Erreur de suppression",
        `Une erreur est survenue : ${error.message}.`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };


  if (loading && !user) {
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
            Gérez vos informations personnelles et préférences d'application.
          </CardDescription>
        </CardHeader>

        <>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-3 p-4 border rounded-lg bg-background">
                <h3 className="text-md font-medium flex items-center">
                  <Star className={`mr-2 h-5 w-5 ${isUserPremium ? 'text-yellow-400 fill-yellow-300' : 'text-muted-foreground'}`} />
                  Statut du Compte : 
                  <span className={`ml-2 font-semibold ${isUserPremium ? 'text-green-500' : 'text-blue-500'}`}>
                    {isUserPremium ? "Premium" : "Gratuit"}
                  </span>
                </h3>
                {!isUserPremium && (
                  <p className="text-sm text-muted-foreground">
                    Passez à la version Premium pour des fonctionnalités illimitées.{" "}
                    <Link to="/premiumpage" className="text-primary hover:underline font-medium">
                      Découvrir Premium
                    </Link>
                  </p>
                )}
              </div>
              <Separator /> 
              <div className="space-y-6">
                  <h3 className="text-lg font-medium border-b pb-2 mb-4">Informations Personnelles</h3>
                  {/* ... (Champs Informations Personnelles - inchangés) ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="full_name">Nom complet</Label>
                          <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="full_name" name="full_name" value={profile.full_name} onChange={handleChange} placeholder="Votre nom complet" className="pl-10" disabled={loading || !!actionLoading}/>
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="username">Nom d'utilisateur</Label>
                          <div className="relative">
                              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="username" name="username" value={profile.username} onChange={handleChange} placeholder="Votre pseudo public" className="pl-10" disabled={loading || !!actionLoading}/>
                          </div>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="email" name="email" value={profile.email} disabled className="pl-10 bg-muted/50 cursor-not-allowed"/>
                      </div>
                      <p className="text-xs text-muted-foreground">L'email est lié à votre compte et ne peut pas être modifié ici.</p>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone (Optionnel)</Label>
                      <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="phone" name="phone" value={profile.phone} onChange={handleChange} placeholder="Votre numéro de téléphone" className="pl-10" disabled={loading || !!actionLoading}/>
                      </div>
                  </div>
                 
              </div>
              <Separator />
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2 mb-4">Préférences d'Application</h3>
                
                <div className={`space-y-3 p-4 rounded-lg ${!isUserPremium ? 'bg-muted/40 opacity-70 relative' : ''}`}>
                  {!isUserPremium && (
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
                  <RadioGroup 
                    value={themeStyle} 
                    onValueChange={(value) => handleThemeChange(value as ThemeStyle)} 
                    className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="default" id="theme-default" disabled={!!actionLoading || !isUserPremium} />
                      <Label htmlFor="theme-default" className={`flex items-center gap-2 ${!!actionLoading || !isUserPremium ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 border"></div> Défaut
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blackwhite" id="theme-blackwhite" disabled={!!actionLoading || !isUserPremium} />
                      <Label htmlFor="theme-blackwhite" className={`flex items-center gap-2 ${!!actionLoading || !isUserPremium ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                        <div className="h-4 w-4 rounded-full bg-black border"></div> N&B
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ocean" id="theme-ocean" disabled={!!actionLoading || !isUserPremium} />
                      <Label htmlFor="theme-ocean" className={`flex items-center gap-2 ${!!actionLoading || !isUserPremium ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border"></div> Océan
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sunset" id="theme-sunset" disabled={!!actionLoading || !isUserPremium} />
                      <Label htmlFor="theme-sunset" className={`flex items-center gap-2 ${!!actionLoading || !isUserPremium ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 border"></div> Crépuscule
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="default_layout" className="flex items-center gap-2"><LayoutGrid className="h-5 w-5 text-primary" /> Vue par défaut des tâches</Label>
                    <Select name="default_layout" value={profile.default_layout} onValueChange={handleSelectChange} disabled={loading || !!actionLoading}>
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
                <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                    {profile.email_notifications_enabled
                    ? <Bell className="h-5 w-5 text-primary" />
                    : <BellOff className="h-5 w-5 text-muted-foreground" />
                    }
                    Notifications par email
                    </Label>
                    <div className="flex items-center space-x-2">
                    <Switch
                        id="email_notifications_enabled"
                        checked={profile.email_notifications_enabled}
                        onCheckedChange={handleSwitchChange}
                        disabled={loading || !!actionLoading}
                    />
                    <Label htmlFor="email_notifications_enabled" className={`text-sm text-muted-foreground ${!!actionLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                        {profile.email_notifications_enabled ? "Activées" : "Désactivées"}
                    </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">Recevoir des résumés ou alertes par email (Fonctionnalité non implémentée).</p>
                  </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 bg-muted/30">
              <Button type="submit" disabled={loading || !!actionLoading} className="w-full sm:w-auto">
                {loading && !actionLoading ? (
                  <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Sauvegarde...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Sauvegarder les modifications</>
                )}
              </Button>
            </CardFooter>
          </form>
          <Separator />
          <CardContent className="pt-6 space-y-6">
            {/* --- MODIFICATION: Section Zone de Danger --- */}
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
                    disabled={!!actionLoading} // Désactiver si une autre action est en cours
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
                  <Button
                     variant="destructive"
                     onClick={handleDeleteAccount}
                     disabled={!!actionLoading} 
                     className="w-full sm:w-auto flex-shrink-0"
                  >
                     {actionLoading === 'delete' ? (
                        <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Suppression...</>
                     ) : (
                        <><Trash2 className="mr-2 h-4 w-4" /> Supprimer mon compte</>
                     )}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                    <p className="text-sm text-muted-foreground flex-1">Mettre fin à votre session actuelle sur cet appareil.</p>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    disabled={!!actionLoading}
                    className="w-full sm:w-auto flex-shrink-0"
                  >
                    {actionLoading === 'logout' ? (
                      <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Déconnexion...</>
                    ) : (
                      <><LogOut className="mr-2 h-4 w-4" /> Se Déconnecter</>
                    )}
                  </Button>
                </div>
              </>
            )}
            {/* Fin de la section Zone de Danger conditionnelle */}
          </CardContent>
        </>
      </Card>
    </div>
  );
}