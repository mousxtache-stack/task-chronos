// components/LayoutSettings.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLayout, LayoutMode } from "@/lib/context/LayoutContext";
import { Layout, Grid, AlignRight, Minimize, Trello } from "lucide-react"; // 1. Importer une icône pour Kanban (Trello est une bonne option)

// 2. Définir le type LayoutConfig explicitement
interface LayoutConfig {
  mode: LayoutMode;
  label: string;
  icon: React.ElementType; // Utiliser React.ElementType pour plus de flexibilité avec les icônes Lucide
}

// 3. Ajouter la configuration pour Kanban
const layouts: LayoutConfig[] = [
  { mode: "normal", label: "Normal", icon: Layout },
  { mode: "right", label: "Panneau Droit", icon: AlignRight }, // Label plus descriptif
  { mode: "compact", label: "Compact", icon: Minimize },
  { mode: "grid", label: "Grille", icon: Grid },
  { mode: "kanban", label: "Kanban", icon: Trello }, // Nouvelle option Kanban
];

export const LayoutSettings = () => {
  const { layoutMode, setLayoutMode } = useLayout();

  // Trouver l'icône actuelle pour le bouton principal
  const currentLayoutConfig = layouts.find(l => l.mode === layoutMode) || layouts[0];
  const CurrentIcon = currentLayoutConfig.icon;


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-[40px] h-[40px]" title={`Mode d'affichage: ${currentLayoutConfig.label}`}>
          {/* 4. Afficher l'icône du mode actuel */}
          <CurrentIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Changer le mode d'affichage</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {layouts.map(({ mode, label, icon: IconComponent }) => (
          <DropdownMenuItem
            key={mode}
            onClick={() => setLayoutMode(mode)}
            // Utiliser data-state pour un style plus robuste avec Radix UI (shadcn)
            // Ou garder la classe pour la simplicité si cela fonctionne bien pour vous
            className={`flex items-center gap-2 cursor-pointer ${
              layoutMode === mode ? "bg-accent text-accent-foreground" : "" // Style plus clair pour l'élément actif
            }`}
          >
            <IconComponent className="h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};