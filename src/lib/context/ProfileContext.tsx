// src/lib/context/ProfileContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Ajustez le chemin
import { User } from '@supabase/supabase-js';

// Définition complète de la structure des données du profil
export interface ProfileData {
  id: string;
  updated_at?: string;
  created_at?: string;
  username: string | null;
  full_name: string | null;
  avatar_url?: string | null; // Si vous avez des avatars
  website?: string | null;   // Si vous avez des sites web
  bio?: string | null;
  phone?: string | null;
  default_layout?: string; // ou LayoutMode si vous l'exportez
  email_notifications_enabled?: boolean;
  is_premium?: boolean;
  // Nouvelles colonnes pour les fonctionnalités avancées
  enable_subtasks?: boolean;
  enable_smart_recurrence?: boolean;
  enable_pinned_tasks?: boolean;
}

interface ProfileContextType {
  profile: ProfileData | null;
  loadingProfile: boolean;
  fetchProfile: (userId?: string) => Promise<void>;
  setProfileDataOptimistic: (data: Partial<ProfileData>) => void; // Pour mises à jour optimistes
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        setCurrentUser(user);
        if (user) {
          await fetchProfileData(user.id);
        } else {
          setProfile(null);
          setLoadingProfile(false);
        }
      }
    );
    
    // Obtenir la session actuelle au montage initial
    async function getInitialSession() {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setCurrentUser(user);
        if (user) {
            await fetchProfileData(user.id);
        } else {
            setLoadingProfile(false); // Important si pas d'utilisateur
        }
    }
    getInitialSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchProfileData = useCallback(async (userIdToFetch?: string) => {
    const id = userIdToFetch || currentUser?.id;
    if (!id) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*') // Récupère toutes les colonnes
        .eq('id', id)
        .single();

      if (error && status !== 406) { // 406: No rows found
        console.error('Error fetching profile:', error.message);
        throw error;
      }
      
      if (data) {
        setProfile(data as ProfileData);
      } else {
        // Si aucun profil n'existe, on peut initialiser avec des valeurs par défaut ou null
        // Cela peut se produire pour un nouvel utilisateur qui n'a pas encore de ligne dans 'profiles'
        console.warn(`No profile found for user ${id}. A new profile might be created on first save.`);
        setProfile(null); // ou un objet ProfileData partiel avec des valeurs par défaut si nécessaire
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      setProfile(null); // Réinitialiser en cas d'erreur
    } finally {
      setLoadingProfile(false);
    }
  }, [currentUser]);


  const setProfileDataOptimistic = (data: Partial<ProfileData>) => {
    if (profile) {
      setProfile(prev => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loadingProfile, fetchProfile: fetchProfileData, setProfileDataOptimistic }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileData = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileData must be used within a ProfileProvider');
  }
  return context;
};