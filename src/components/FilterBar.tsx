import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Leaf, Sprout, Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SmartSearchBar } from "./SmartSearchBar";
import { Restaurant, Plat } from "@/data/restaurants";

interface PlatWithRestaurant extends Plat {
  restaurant: {
    id: string;
    nom: string;
    adresse: string;
    chef: string | null;
  };
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showVegetarian: boolean;
  onVegetarianToggle: () => void;
  showVegan: boolean;
  onVeganToggle: () => void;
  selectedService: string | null;
  onServiceChange: (service: string | null) => void;
  selectedDate: {jour: number, mois: number} | null;
  onDateChange: (date: {jour: number, mois: number} | null) => void;
  // Nouvelles props pour la recherche intelligente
  restaurants?: Restaurant[];
  plats?: PlatWithRestaurant[];
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  currentViewMode?: 'restaurants' | 'plats';
  onViewModeChange?: (mode: 'restaurants' | 'plats') => void;
  useSmartSearch?: boolean;
}

export const FilterBar = ({
  searchTerm,
  onSearchChange,
  showVegetarian,
  onVegetarianToggle,
  showVegan,
  onVeganToggle,
  selectedService,
  onServiceChange,
  selectedDate,
  onDateChange,
  restaurants = [],
  plats = [],
  onRestaurantSelect,
  currentViewMode = 'restaurants',
  onViewModeChange,
  useSmartSearch = false
}: FilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  // Définition des dates du festival Kouss Kouss 2025
  const festivalDates = [
    // Août 2025
    { jour: 22, mois: 8, label: "22 Août" },
    { jour: 23, mois: 8, label: "23 Août" },
    { jour: 24, mois: 8, label: "24 Août" },
    { jour: 25, mois: 8, label: "25 Août" },
    { jour: 26, mois: 8, label: "26 Août" },
    { jour: 27, mois: 8, label: "27 Août" },
    { jour: 28, mois: 8, label: "28 Août" },
    { jour: 29, mois: 8, label: "29 Août" },
    { jour: 30, mois: 8, label: "30 Août" },
    { jour: 31, mois: 8, label: "31 Août" },
    // Septembre 2025
    { jour: 1, mois: 9, label: "1er Sept" },
    { jour: 2, mois: 9, label: "2 Sept" },
    { jour: 3, mois: 9, label: "3 Sept" },
    { jour: 4, mois: 9, label: "4 Sept" },
    { jour: 5, mois: 9, label: "5 Sept" },
    { jour: 6, mois: 9, label: "6 Sept" },
    { jour: 7, mois: 9, label: "7 Sept" }
  ];

  const activeFiltersCount = [showVegetarian, showVegan, selectedService, selectedDate].filter(Boolean).length;

  const clearAllFilters = () => {
    if (showVegetarian) onVegetarianToggle();
    if (showVegan) onVeganToggle();
    onServiceChange(null);
    onDateChange(null);
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="flex gap-3">
        {useSmartSearch && onRestaurantSelect && onViewModeChange ? (
          <SmartSearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            restaurants={restaurants}
            plats={plats}
            onRestaurantSelect={onRestaurantSelect}
            currentViewMode={currentViewMode}
            onViewModeChange={onViewModeChange}
          />
        ) : (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un restaurant ou un plat..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-card border-border/50 focus:ring-primary"
            />
          </div>
        )}
        
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

            {/* Filtre par date */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Date du festival</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {festivalDates.map((date) => {
                  const isSelected = selectedDate?.jour === date.jour && selectedDate?.mois === date.mois;
                  return (
                    <Button
                      key={`${date.jour}-${date.mois}`}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => onDateChange(isSelected ? null : { jour: date.jour, mois: date.mois })}
                      className={`text-xs ${isSelected ? "bg-primary text-primary-foreground" : "border-border/50"}`}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {date.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};