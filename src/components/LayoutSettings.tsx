import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLayout, LayoutMode } from "@/lib/context/LayoutContext";
import { Layout, Grid, AlignRight, Minimize } from "lucide-react";

const layouts: { mode: LayoutMode; label: string; icon: React.ComponentType }[] = [
  { mode: "normal", label: "Normal", icon: Layout },
  { mode: "right", label: "Droite", icon: AlignRight },
  { mode: "compact", label: "Compact", icon: Minimize },
  { mode: "grid", label: "Grille", icon: Grid },
];

export const LayoutSettings = () => {
  const { layoutMode, setLayoutMode } = useLayout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-[40px] h-[40px]">
          <Layout className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {layouts.map(({ mode, label, icon: Icon }) => (
          <DropdownMenuItem
            key={mode}
            onClick={() => setLayoutMode(mode)}
            className={`flex items-center gap-2 ${
              layoutMode === mode ? "bg-accent" : ""
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 