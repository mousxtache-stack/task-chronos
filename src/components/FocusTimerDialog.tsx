// src/components/FocusTimerDialog.tsx
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Gardons la barre de progression pour le feedback visuel
import { useFocusTimer, PomodoroStage } from "@/lib/context/FocusTimerContext";
import { Play, Pause, SkipForward, XSquare, RotateCcw, Settings2, Maximize, Minimize } from "lucide-react"; // XSquare pour fermer, Settings2 pour les paramètres, Maximize/Minimize si on veut le rendre optionnel plus tard
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Optionnel: pour contrôler le mode plein écran du navigateur
async function toggleFullScreen() {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error(`Erreur lors de la tentative de passage en plein écran : ${err.message} (${err.name})`);
    }
  } else {
    if (document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error(`Erreur lors de la tentative de sortie du plein écran : ${err.message} (${err.name})`);
      }
    }
  }
}


export function FocusTimerDialog() {
  const {
    currentTask,
    stage,
    timeLeft,
    isActive,
    settings,
    pomodorosCompletedThisSession,
    pauseTimer,
    resumeTimer,
    skipStage,
    stopTimerAndClose,
    resetTimer,
    // updateSettings, // Pour implémenter les settings plus tard
  } = useFocusTimer();

  // État local pour savoir si on est en mode "vrai" plein écran du navigateur
  const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleChange = () => setIsBrowserFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  // Effet pour masquer/afficher la scrollbar du body
  useEffect(() => {
    document.body.style.overflow = 'hidden'; // Masquer la scrollbar quand le minuteur est actif
    return () => {
      document.body.style.overflow = 'auto'; // Rétablir la scrollbar à la fermeture
      // S'assurer de quitter le mode plein écran du navigateur si on y était
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.warn("Could not exit fullscreen on close:", err));
      }
    };
  }, []);


  if (!currentTask) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStageDuration = (): number => {
    switch (stage) {
      case 'work': return settings.workDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
      default: return 1;
    }
  };

  const progressPercentage = ((getStageDuration() - timeLeft) / getStageDuration()) * 100;

  const stageConfig: Record<PomodoroStage, { name: string; colorClass: string; textColor: string; accentColor: string }> = {
    work: { name: `Focus: ${currentTask.title}`, colorClass: "bg-slate-900", textColor: "text-slate-100", accentColor: "text-red-400" },
    shortBreak: { name: "Petite Pause", colorClass: "bg-emerald-700", textColor: "text-emerald-50", accentColor: "text-emerald-300" },
    longBreak: { name: "Grande Pause", colorClass: "bg-sky-700", textColor: "text-sky-50", accentColor: "text-sky-300" },
    idle: { name: "Prêt ?", colorClass: "bg-gray-800", textColor: "text-gray-100", accentColor: "text-gray-400" },
  };

  const currentStageConfig = stageConfig[stage] || stageConfig.idle;


  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-500",
        currentStageConfig.colorClass,
        currentStageConfig.textColor
      )}
    >
      {/* Titre de la tâche et état du pomodoro en haut */}
      <div className="absolute top-6 left-6 right-6 text-center sm:top-8 sm:left-8 sm:right-8">
        <h1 className="text-xl sm:text-2xl font-semibold truncate">
          {currentStageConfig.name}
        </h1>
        {stage !== 'idle' && (
          <p className={cn("text-sm sm:text-base opacity-80", currentStageConfig.accentColor)}>
            Session {pomodorosCompletedThisSession + 1} / {settings.pomodorosPerLongBreak}
          </p>
        )}
      </div>

      {/* Minuteur principal */}
      <div className="flex flex-col items-center my-auto">
        <div className="text-[10rem] sm:text-[15rem] md:text-[20rem] font-bold tracking-tighter leading-none select-none">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Barre de progression et contrôles en bas */}
      <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8">
        <Progress
          value={progressPercentage}
          className={cn(
            "w-full h-2 mb-6 sm:mb-8 opacity-70",
            stage === 'work' ? "bg-red-400/30 [&>*]:bg-red-400" :
            stage === 'shortBreak' ? "bg-emerald-300/30 [&>*]:bg-emerald-300" :
            stage === 'longBreak' ? "bg-sky-300/30 [&>*]:bg-sky-300" :
            "bg-gray-400/30 [&>*]:bg-gray-400"
          )}
        />
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => resetTimer()}
            title="Réinitialiser le cycle actuel"
            className={cn("h-12 w-12 sm:h-14 sm:w-14 rounded-full hover:bg-white/10", currentStageConfig.textColor)}
          >
            <RotateCcw className="h-6 w-6 sm:h-7 sm:w-7" />
          </Button>

          {isActive ? (
            <Button
              onClick={pauseTimer}
              size="lg"
              className={cn(
                "h-16 w-32 sm:h-20 sm:w-40 text-lg sm:text-xl rounded-full font-semibold shadow-lg",
                "bg-white/80 hover:bg-white text-black backdrop-blur-sm", // Bouton principal contrasté
                // stage === 'work' ? "bg-red-500 hover:bg-red-600 text-white" :
                // stage === 'shortBreak' ? "bg-emerald-500 hover:bg-emerald-600 text-white" :
                // "bg-sky-500 hover:bg-sky-600 text-white"
              )}
            >
              <Pause className="mr-2 h-6 w-6 sm:h-7 sm:w-7" /> Pauser
            </Button>
          ) : (
            <Button
              onClick={resumeTimer}
              size="lg"
              className={cn(
                "h-16 w-32 sm:h-20 sm:w-40 text-lg sm:text-xl rounded-full font-semibold shadow-lg",
                "bg-white/80 hover:bg-white text-black backdrop-blur-sm" // Bouton principal contrasté
              )}
              disabled={timeLeft === 0 && stage !== 'idle'}
            >
              <Play className="mr-2 h-6 w-6 sm:h-7 sm:w-7" />
              {timeLeft === getStageDuration() || stage === 'idle' ? "Focus" : "Rep."}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={skipStage}
            title="Passer au cycle suivant"
            className={cn("h-12 w-12 sm:h-14 sm:w-14 rounded-full hover:bg-white/10", currentStageConfig.textColor)}
            disabled={stage === 'idle' && timeLeft === getStageDuration()} // Désactiver si sur idle et non démarré
          >
            <SkipForward className="h-6 w-6 sm:h-7 sm:w-7" />
          </Button>
        </div>
      </div>

      {/* Boutons utilitaires discrets */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2">
        {/* Optionnel: Bouton pour le mode plein écran du navigateur */}
        <Button variant="ghost" size="icon" onClick={toggleFullScreen} title={isBrowserFullScreen ? "Quitter le plein écran" : "Plein écran"} className={cn("hover:bg-white/10", currentStageConfig.textColor)}>
            {isBrowserFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
        {/* Bouton pour fermer le mode Focus */}
        <Button variant="ghost" size="icon" onClick={stopTimerAndClose} title="Quitter le mode focus" className={cn("hover:bg-white/10", currentStageConfig.textColor)}>
          <XSquare className="h-5 w-5" />
        </Button>
      </div>

      {/* Bouton pour les paramètres (à implémenter) - positionné en bas à gauche par exemple */}
      {/*
      <Button variant="ghost" size="icon" onClick={() => { /* ouvrir modale de settings * / }} title="Paramètres Pomodoro" className={cn("absolute bottom-4 left-4 sm:bottom-6 sm:left-6 hover:bg-white/10", currentStageConfig.textColor)}>
          <Settings2 className="h-5 w-5" />
      </Button>
      */}
    </div>
  );
}