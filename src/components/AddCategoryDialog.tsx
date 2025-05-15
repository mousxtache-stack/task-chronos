// src/components/AddCategoryDialog.tsx
import React, { useState, FormEvent, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // <--- MODIFICATION ICI : AJOUTER DialogTrigger
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as LucideIcons from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/lib/types';

// ... le reste de votre composant ...

const lucideIconNames = Object.keys(LucideIcons).filter(
  (key) => typeof (LucideIcons as any)[key] === 'object' && (LucideIcons as any)[key].displayName
).sort(); // Trier alphabétiquement pour une meilleure UX

interface AddCategoryDialogProps {
  onAddCategory: (name: string, logo: string) => Promise<void>;
  children: React.ReactNode;
}

const MAX_ICONS_DISPLAY = 75; // Limiter le nombre d'icônes affichées à la fois

export const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ onAddCategory, children }) => {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedLogo, setSelectedLogo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoSearch, setLogoSearch] = useState('');
  const [logoPopoverOpen, setLogoPopoverOpen] = useState(false);

  const filteredLucideIconNames = useMemo(() => {
    if (!logoSearch) {
      return lucideIconNames.slice(0, MAX_ICONS_DISPLAY);
    }
    return lucideIconNames
      .filter(name => name.toLowerCase().includes(logoSearch.toLowerCase()))
      .slice(0, MAX_ICONS_DISPLAY);
  }, [logoSearch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || !selectedLogo) {
      alert("Veuillez entrer un nom et sélectionner un logo pour la catégorie.");
      return;
    }
    setIsLoading(true);
    try {
      await onAddCategory(categoryName.trim(), selectedLogo);
      setOpen(false);
      setCategoryName('');
      setSelectedLogo('');
      setLogoSearch('');
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const SelectedIconComponent = selectedLogo ? (LucideIcons as any)[selectedLogo] as LucideIcons.LucideIcon : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) { // Réinitialiser la recherche quand le dialogue se ferme
        setLogoSearch('');
        setLogoPopoverOpen(false);
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Catégorie</DialogTitle>
          <DialogDescription>
            Créez une nouvelle catégorie pour organiser vos tâches.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-name" className="text-right">
                Nom
              </Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Travail, Personnel..."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Logo</Label>
              <Popover open={logoPopoverOpen} onOpenChange={setLogoPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={logoPopoverOpen}
                    className="col-span-3 justify-between w-full"
                  >
                    {SelectedIconComponent ? (
                      <>
                        <SelectedIconComponent className="mr-2 h-4 w-4" />
                        {selectedLogo}
                      </>
                    ) : (
                      "Choisir un logo..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0"> {/* Assure que le popover a la même largeur que le trigger */}
                  <Command shouldFilter={false}> {/* On gère le filtrage manuellement avec filteredLucideIconNames */}
                    <CommandInput 
                      placeholder="Chercher un logo..." 
                      value={logoSearch}
                      onValueChange={setLogoSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Aucun logo trouvé.</CommandEmpty>
                      <CommandGroup>
                        {filteredLucideIconNames.map((iconName) => {
                          const Icon = (LucideIcons as any)[iconName] as LucideIcons.LucideIcon;
                          return (
                            <CommandItem
                              key={iconName}
                              value={iconName} // value est utilisé pour la sélection interne
                              onSelect={() => { // currentSelectValue est le `value` de CommandItem
                                setSelectedLogo(iconName);
                                setLogoPopoverOpen(false);
                                setLogoSearch('');
                              }}
                            >
                              <Icon className={cn("mr-2 h-4 w-4")} />
                              <span>{iconName}</span>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedLogo === iconName ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          );
                        })}
                         {logoSearch && filteredLucideIconNames.length === MAX_ICONS_DISPLAY && lucideIconNames.filter(name => name.toLowerCase().includes(logoSearch.toLowerCase())).length > MAX_ICONS_DISPLAY && (
                            <div className="p-2 text-xs text-center text-muted-foreground">Plus de résultats, affinez votre recherche...</div>
                        )}
                        {!logoSearch && lucideIconNames.length > MAX_ICONS_DISPLAY && (
                            <div className="p-2 text-xs text-center text-muted-foreground">Tapez pour rechercher parmi {lucideIconNames.length} logos...</div>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || !categoryName.trim() || !selectedLogo}>
              {isLoading ? "Création..." : "Créer la catégorie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};