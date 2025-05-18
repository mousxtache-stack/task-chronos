// src/lib/context/FocusTimerContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Task } from '@/lib/types'; // Assurez-vous que Task est bien défini
import { FocusTimerDialog } from '@/components/FocusTimerDialog'; // Importer le vrai composant

export type PomodoroStage = 'work' | 'shortBreak' | 'longBreak' | 'idle';

interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  pomodorosPerLongBreak: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosPerLongBreak: 4,
};

interface FocusTimerContextType {
  isActive: boolean; // Si le minuteur décompte activement
  isSessionActive: boolean; // Si le dialogue du minuteur est visible/actif
  currentTask: Task | null;
  stage: PomodoroStage;
  timeLeft: number; // en secondes
  pomodorosCompletedThisSession: number; // Cycles de travail dans la session du minuteur actuel
  settings: PomodoroSettings;
  startTimer: (task: Task) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: (navigateToNextStage?: boolean) => void;
  skipStage: () => void;
  stopTimerAndClose: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
}

const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined);

export const FocusTimerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [stage, setStage] = useState<PomodoroStage>('idle');
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [pomodorosCompletedThisSession, setPomodorosCompletedThisSession] = useState(0);
  
  // Utiliser useRef pour l'ID de l'intervalle pour éviter des problèmes avec les closures dans useEffect
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getDurationForStage = useCallback((currentStage: PomodoroStage, currentSettings: PomodoroSettings): number => {
    switch (currentStage) {
      case 'work':
        return currentSettings.workDuration * 60;
      case 'shortBreak':
        return currentSettings.shortBreakDuration * 60;
      case 'longBreak':
        return currentSettings.longBreakDuration * 60;
      default:
        return 0;
    }
  }, []);

  const moveToNextStage = useCallback(() => {
    setPomodorosCompletedThisSession(prevCompleted => {
        let newCompleted = prevCompleted;
        let nextStage: PomodoroStage = 'idle';

        if (stage === 'work') {
            newCompleted++;
            if (newCompleted % settings.pomodorosPerLongBreak === 0) {
                nextStage = 'longBreak';
            } else {
                nextStage = 'shortBreak';
            }
        } else if (stage === 'shortBreak' || stage === 'longBreak') {
            nextStage = 'work';
        } else { // Si on était sur idle et qu'on skip/reset
            nextStage = 'work';
        }
        
        setStage(nextStage);
        setTimeLeft(getDurationForStage(nextStage, settings));
        // Ne pas auto-démarrer ici, laisser l'utilisateur le faire ou un effet séparé
        setIsActive(false); // Mettre en pause par défaut lors du changement de stage
        return newCompleted;
    });
  }, [stage, settings, getDurationForStage]);


  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false); // Arrêter le décompte
      console.log(`${stage} terminé!`);
      // TODO: Jouer un son, afficher une notification de navigateur
      // moveToNextStage(); // Déplacé pour être appelé explicitement ou par action utilisateur
      // Pour l'instant, on s'arrête et l'utilisateur peut skipper ou redémarrer.
      // Si vous voulez un passage automatique:
      // setTimeout(moveToNextStage, 1000); // petit délai avant de passer automatiquement
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, stage]); // Pas besoin de moveToNextStage dans les dépendances ici


  const startTimer = (task: Task) => {
    if (intervalRef.current) clearInterval(intervalRef.current); // Nettoyer un ancien intervalle
    
    setCurrentTask(task);
    setStage('work');
    setTimeLeft(getDurationForStage('work', settings));
    setIsActive(true);
    setIsSessionActive(true);
    setPomodorosCompletedThisSession(0);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resumeTimer = () => {
    if (isSessionActive && timeLeft > 0 && !isActive) { // Reprendre seulement si session active, temps restant, et pas déjà actif
      setIsActive(true);
    } else if (isSessionActive && timeLeft === 0 && stage !== 'idle'){ // Si le stage précédent était fini, passer au suivant et démarrer
      moveToNextStage();
      // setIsActive(true); // Optionnel: auto-start après skip/fin si moveToNextStage ne le fait pas
    } else if (isSessionActive && stage === 'idle') { // Démarrer un nouveau cycle de travail
        setStage('work');
        setTimeLeft(getDurationForStage('work', settings));
        setIsActive(true);
    }
  };

  const resetTimer = (navigateToNextStage: boolean = false) => {
    setIsActive(false);
    if (navigateToNextStage) {
      moveToNextStage();
    } else {
      // Réinitialise au temps du stage actuel
      setTimeLeft(getDurationForStage(stage, settings));
    }
  };
  
  const skipStage = () => {
    setIsActive(false); // Arrête le minuteur actuel
    // TODO: Enregistrer que le stage a été skippé si besoin pour des stats
    moveToNextStage();
    // Optionnel: démarrer automatiquement le stage suivant
    // setIsActive(true);
  };

  const stopTimerAndClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setIsSessionActive(false);
    setStage('idle');
    setCurrentTask(null);
    setTimeLeft(settings.workDuration * 60); // Réinitialise au temps de travail par défaut
    setPomodorosCompletedThisSession(0);
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    if (!isSessionActive || stage === 'idle') { // Mettre à jour timeLeft seulement si pas de session active ou sur idle
      setTimeLeft(getDurationForStage('work', updatedSettings));
    }
  };

  return (
    <FocusTimerContext.Provider value={{
      isActive, isSessionActive, currentTask, stage, timeLeft, pomodorosCompletedThisSession, settings,
      startTimer, pauseTimer, resumeTimer, resetTimer, skipStage, stopTimerAndClose, updateSettings
    }}>
      {children}
      {isSessionActive && <FocusTimerDialog />}
    </FocusTimerContext.Provider>
  );
};

export const useFocusTimer = () => {
  const context = useContext(FocusTimerContext);
  if (context === undefined) {
    throw new Error('useFocusTimer must be used within a FocusTimerProvider');
  }
  return context;
};