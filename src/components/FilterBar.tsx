import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Leaf, Sprout, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showVegetarian: boolean;
  onVegetarianToggle: () => void;
  showVegan: boolean;
  onVeganToggle: () => void;
  selectedService: string | null;
  onServiceChange: (service: string | null) => void;
}

export const FilterBar = ({
  searchTerm,
  onSearchChange,
  showVegetarian,
  onVegetarianToggle,
  showVegan,
  onVeganToggle,
  selectedService,
  onServiceChange
}: FilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = [showVegetarian, showVegan, selectedService].filter(Boolean).length;

  const clearAllFilters = () => {
    onVegetarianToggle();
    onVeganToggle();
    onServiceChange(null);
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un restaurant ou un plat..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card border-border/50 focus:ring-primary"
          />
        </div>
        
        <Button
          variant="outline"
          size="default"
          onClick={() => setShowFilters(!showFilters)}
          className="relative border-border/50 hover:bg-accent"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <Card className="p-4 bg-gradient-card border-border/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Filtrer par</h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Tout effacer
                </Button>
              )}
            </div>

            {/* Filtres régime alimentaire */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Régime alimentaire</h4>
              <div className="flex gap-2">
                <Button
                  variant={showVegetarian ? "default" : "outline"}
                  size="sm"
                  onClick={onVegetarianToggle}
                  className={showVegetarian ? "bg-primary text-primary-foreground" : "border-border/50"}
                >
                  <Leaf className="h-4 w-4 mr-2" />
                  Végétarien
                </Button>
                
                <Button
                  variant={showVegan ? "default" : "outline"}
                  size="sm"
                  onClick={onVeganToggle}
                  className={showVegan ? "bg-primary text-primary-foreground" : "border-border/50"}
                >
                  <Sprout className="h-4 w-4 mr-2" />
                  Vegan
                </Button>
              </div>
            </div>

            {/* Filtre service */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Service</h4>
              <div className="flex gap-2">
                <Button
                  variant={selectedService === "midi" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onServiceChange(selectedService === "midi" ? null : "midi")}
                  className={selectedService === "midi" ? "bg-primary text-primary-foreground" : "border-border/50"}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Midi
                </Button>
                
                <Button
                  variant={selectedService === "soir" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onServiceChange(selectedService === "soir" ? null : "soir")}
                  className={selectedService === "soir" ? "bg-primary text-primary-foreground" : "border-border/50"}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Soir
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};