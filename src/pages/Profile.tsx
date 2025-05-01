import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Save, ArrowLeft, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTheme, ThemeStyle } from "@/lib/context/ThemeContext";
import { useAlert } from "@/lib/context/AlertContext";

export function Profile() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { themeStyle, setThemeStyle } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer l'utilisateur authentifié
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (userData && userData.user) {
          setUser(userData.user);
          
          // Récupérer les informations de profil de la base de données
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userData.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') throw profileError;
          
          if (profileData) {
            setProfile({
              full_name: profileData.full_name || "",
              email: userData.user.email || "",
              phone: profileData.phone || "",
            });
          } else {
            setProfile({
              full_name: "",
              email: userData.user.email || "",
              phone: "",
            });
          }
        }
      } catch (error: any) {
        showAlert("Erreur", "Erreur lors du chargement du profil: " + error.message, "error");
      }
    };
    
    fetchUserData();
  }, [showAlert]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user) throw new Error("Utilisateur non connecté");
      
      // Mettre à jour le profil dans la base de données
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          updated_at: new Date(),
        });
        
      if (error) throw error;
      
      showAlert("Succès", "Vos informations ont été enregistrées avec succès", "success");
    } catch (error: any) {
      showAlert("Erreur", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (value: ThemeStyle) => {
    setThemeStyle(value);
    showAlert(
      "Thème modifié", 
      value === 'default' ? "Le thème par défaut a été appliqué" : "Le thème noir et blanc a été appliqué", 
      "info"
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mon Profil
          </CardTitle>
          <CardDescription>
            Gérez vos informations personnelles
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-medium">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="full_name"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  placeholder="Votre nom complet"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="pl-10 bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500">
                L'email ne peut pas être modifié depuis cette page
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Votre numéro de téléphone"
                  className="pl-10"
                />
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Style d'affichage</h3>
              </div>
              
              <RadioGroup 
                value={themeStyle} 
                onValueChange={(value) => handleThemeChange(value as ThemeStyle)} 
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="theme-default" />
                  <Label htmlFor="theme-default" className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary"></div>
                    Style par défaut (violet)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blackwhite" id="theme-blackwhite" />
                  <Label htmlFor="theme-blackwhite" className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-black"></div>
                    Style noir et blanc
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-gray-500">
                Le style choisi sera appliqué à l'ensemble de l'application.
              </p>
            </div>
          </form>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sauvegarde en cours...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="mr-2 h-4 w-4" /> 
                Sauvegarder les modifications
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}