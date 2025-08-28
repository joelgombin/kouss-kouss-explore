import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UtensilsCrossed, Store, Leaf, Sprout } from "lucide-react";
import { Restaurant, Plat } from "@/data/restaurants";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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

  // Gérer le clic extérieur et les événements tactiles
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
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
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-muted-foreground`} />
        <Input
          ref={inputRef}
          placeholder={isMobile ? "Rechercher..." : "Rechercher un restaurant ou un plat..."}
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
          className={`pl-10 bg-card border-border/50 focus:ring-primary ${
            isMobile 
              ? 'h-12 text-base placeholder:text-base touch-manipulation' 
              : 'h-10 text-sm placeholder:text-sm'
          }`}
        />
      </div>

      {/* Suggestions */}
      {showSuggestions && totalSuggestions > 0 && (
        <Card 
          ref={suggestionsRef}
          className={`absolute top-full left-0 right-0 mt-1 z-[9999] bg-card border-border/50 shadow-lg overflow-y-auto ${
            isMobile 
              ? 'max-h-[60vh] shadow-2xl' 
              : 'max-h-96'
          }`}
        >
          <CardContent className="p-0">
            {/* Suggestions de restaurants */}
            {suggestions.restaurants.length > 0 && (
              <div>
                <div className={`px-3 text-xs font-medium text-muted-foreground bg-muted/50 flex items-center gap-2 ${
                  isMobile ? 'py-3' : 'py-2'
                }`}>
                  <Store className="h-3 w-3" />
                  RESTAURANTS
                </div>
                {suggestions.restaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className={`px-3 cursor-pointer transition-colors ${
                      isMobile ? 'py-4 min-h-[56px]' : 'py-2'
                    } ${
                      highlightedIndex === index
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50 active:bg-accent/70'
                    }`}
                    onClick={() => selectSuggestion(index)}
                  >
                    <div className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>{restaurant.nom}</div>
                    <div className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'}`}>{restaurant.adresse}</div>
                    {restaurant.chef && (
                      <div className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-xs'}`}>{restaurant.chef}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions de plats */}
            {suggestions.plats.length > 0 && (
              <div>
                <div className={`px-3 text-xs font-medium text-muted-foreground bg-muted/50 flex items-center gap-2 ${
                  isMobile ? 'py-3' : 'py-2'
                }`}>
                  <UtensilsCrossed className="h-3 w-3" />
                  PLATS
                </div>
                {suggestions.plats.map((plat, index) => {
                  const globalIndex = suggestions.restaurants.length + index;
                  return (
                    <div
                      key={`${plat.restaurant.id}-${index}`}
                      className={`px-3 cursor-pointer transition-colors ${
                        isMobile ? 'py-4 min-h-[64px]' : 'py-2'
                      } ${
                        highlightedIndex === globalIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50 active:bg-accent/70'
                      }`}
                      onClick={() => selectSuggestion(globalIndex)}
                    >
                      <div className={`flex items-start ${isMobile ? 'gap-3' : 'justify-between'}`}>
                        <div className="flex-1">
                          <div className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>{plat.nom}</div>
                          <div className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'}`}>
                            Chez {plat.restaurant.nom}
                          </div>
                          <div className={`text-muted-foreground line-clamp-2 mt-1 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                            {plat.description}
                          </div>
                        </div>
                        <div className={`flex flex-col items-end gap-1 ${isMobile ? 'ml-3 min-w-[80px]' : 'ml-2'}`}>
                          <span className={`font-medium text-primary ${isMobile ? 'text-base' : 'text-sm'}`}>{plat.prix}</span>
                          <div className="flex gap-1">
                            {plat.vegetarien && (
                              <Badge variant="secondary" className={`px-1 ${isMobile ? 'h-6' : 'h-5'}`}>
                                <Leaf className={`${isMobile ? 'h-3 w-3' : 'h-2 w-2'}`} />
                              </Badge>
                            )}
                            {plat.vegan && (
                              <Badge variant="secondary" className={`px-1 ${isMobile ? 'h-6' : 'h-5'}`}>
                                <Sprout className={`${isMobile ? 'h-3 w-3' : 'h-2 w-2'}`} />
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
