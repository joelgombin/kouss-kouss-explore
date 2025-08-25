import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UtensilsCrossed, Store, Leaf, Sprout } from "lucide-react";
import { Restaurant, Plat } from "@/data/restaurants";

interface PlatWithRestaurant extends Plat {
  restaurant: {
    id: string;
    nom: string;
    adresse: string;
  };
}

interface SmartSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  restaurants: Restaurant[];
  plats: PlatWithRestaurant[];
  onRestaurantSelect: (restaurant: Restaurant) => void;
  onPlatSelect?: (plat: PlatWithRestaurant) => void;
  currentViewMode: 'restaurants' | 'plats';
  onViewModeChange: (mode: 'restaurants' | 'plats') => void;
}

export const SmartSearchBar = ({
  searchTerm,
  onSearchChange,
  restaurants,
  plats,
  onRestaurantSelect,
  onPlatSelect,
  currentViewMode,
  onViewModeChange
}: SmartSearchBarProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Générer les suggestions basées sur le terme de recherche
  const suggestions = useMemo(() => {
    if (searchTerm.length < 2) return { restaurants: [], plats: [] };

    const searchLower = searchTerm.toLowerCase();
    
    // Filtrer les restaurants correspondants
    const matchingRestaurants = restaurants
      .filter(restaurant => 
        restaurant.nom.toLowerCase().includes(searchLower) ||
        restaurant.adresse.toLowerCase().includes(searchLower) ||
        restaurant.chef?.toLowerCase().includes(searchLower)
      )
      .slice(0, 3); // Limiter à 3 suggestions

    // Filtrer les plats correspondants
    const matchingPlats = plats
      .filter(plat => 
        plat.nom.toLowerCase().includes(searchLower) ||
        plat.description.toLowerCase().includes(searchLower) ||
        plat.restaurant.nom.toLowerCase().includes(searchLower)
      )
      .slice(0, 5); // Limiter à 5 suggestions

    return { restaurants: matchingRestaurants, plats: matchingPlats };
  }, [searchTerm, restaurants, plats]);

  const totalSuggestions = suggestions.restaurants.length + suggestions.plats.length;

  // Gérer les touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || totalSuggestions === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalSuggestions - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          selectSuggestion(highlightedIndex);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Sélectionner une suggestion
  const selectSuggestion = (index: number) => {
    if (index < suggestions.restaurants.length) {
      // Sélection d'un restaurant
      const restaurant = suggestions.restaurants[index];
      onRestaurantSelect(restaurant);
      onSearchChange(restaurant.nom);
      if (currentViewMode !== 'restaurants') {
        onViewModeChange('restaurants');
      }
    } else {
      // Sélection d'un plat
      const platIndex = index - suggestions.restaurants.length;
      const plat = suggestions.plats[platIndex];
      if (onPlatSelect) {
        onPlatSelect(plat);
      }
      onSearchChange(plat.nom);
      if (currentViewMode !== 'plats') {
        onViewModeChange('plats');
      }
    }
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  // Gérer le clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Rechercher un restaurant ou un plat..."
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setShowSuggestions(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (searchTerm.length >= 2) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 bg-card border-border/50 focus:ring-primary"
        />
      </div>

      {/* Suggestions */}
      {showSuggestions && totalSuggestions > 0 && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 z-[9999] bg-card border-border/50 shadow-lg max-h-96 overflow-y-auto"
        >
          <CardContent className="p-0">
            {/* Suggestions de restaurants */}
            {suggestions.restaurants.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 flex items-center gap-2">
                  <Store className="h-3 w-3" />
                  RESTAURANTS
                </div>
                {suggestions.restaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className={`px-3 py-2 cursor-pointer transition-colors ${
                      highlightedIndex === index
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => selectSuggestion(index)}
                  >
                    <div className="font-medium">{restaurant.nom}</div>
                    <div className="text-sm text-muted-foreground">{restaurant.adresse}</div>
                    {restaurant.chef && (
                      <div className="text-xs text-muted-foreground">Chef: {restaurant.chef}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions de plats */}
            {suggestions.plats.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 flex items-center gap-2">
                  <UtensilsCrossed className="h-3 w-3" />
                  PLATS
                </div>
                {suggestions.plats.map((plat, index) => {
                  const globalIndex = suggestions.restaurants.length + index;
                  return (
                    <div
                      key={`${plat.restaurant.id}-${index}`}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        highlightedIndex === globalIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => selectSuggestion(globalIndex)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{plat.nom}</div>
                          <div className="text-sm text-muted-foreground">
                            Chez {plat.restaurant.nom}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {plat.description}
                          </div>
                        </div>
                        <div className="ml-2 flex flex-col items-end gap-1">
                          <span className="text-sm font-medium text-primary">{plat.prix}</span>
                          <div className="flex gap-1">
                            {plat.vegetarien && (
                              <Badge variant="secondary" className="h-5 px-1">
                                <Leaf className="h-2 w-2" />
                              </Badge>
                            )}
                            {plat.vegan && (
                              <Badge variant="secondary" className="h-5 px-1">
                                <Sprout className="h-2 w-2" />
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
