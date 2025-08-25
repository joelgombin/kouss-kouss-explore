import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Sparkles, Loader2, UtensilsCrossed, Store } from "lucide-react";
import { fetchRestaurants, Restaurant, Plat } from "@/data/restaurants";
import { RestaurantCard } from "@/components/RestaurantCard";
import { RestaurantDetail } from "@/components/RestaurantDetail";
import { PlatCard } from "@/components/PlatCard";
import { FilterBar } from "@/components/FilterBar";
import Map from "@/components/Map";
import heroImage from "@/assets/hero-kouss-kouss.jpg";

// Interface pour un plat enrichi avec les infos du restaurant
interface PlatWithRestaurant extends Plat {
  restaurant: {
    id: string;
    nom: string;
    adresse: string;
    chef: string | null;
  };
}

const Index = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showVegetarian, setShowVegetarian] = useState(false);
  const [showVegan, setShowVegan] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<{jour: number, mois: number} | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [viewMode, setViewMode] = useState<'restaurants' | 'plats'>('restaurants');
  const [searchFromSmartBar, setSearchFromSmartBar] = useState(false);
  


  // Charger les restaurants au montage du composant
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRestaurants();
        setRestaurants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des restaurants');
        console.error('Erreur lors du chargement des restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  // Création de la liste des plats enrichis
  const allPlats = useMemo(() => {
    return restaurants.flatMap(restaurant => 
      restaurant.plats.map(plat => ({
        ...plat,
        restaurant: {
          id: restaurant.id || '',
          nom: restaurant.nom,
          adresse: restaurant.adresse,
          chef: restaurant.chef
        }
      } as PlatWithRestaurant))
    );
  }, [restaurants]);

  // Filtrage des restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      // Recherche par nom de restaurant ou plat
      const matchesSearch = searchTerm === "" || 
        restaurant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.plats.some(plat => 
          plat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plat.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Filtre par régime alimentaire
      const matchesDiet = (!showVegetarian && !showVegan) || 
        restaurant.plats.some(plat => 
          (showVegetarian && plat.vegetarien) || 
          (showVegan && plat.vegan)
        );

      // Filtre par service
      const matchesService = !selectedService || 
        restaurant.plats.some(plat => plat.services.includes(selectedService));

      // Filtre par date
      const matchesDate = !selectedDate || 
        restaurant.plats.some(plat => 
          plat.dates.some(date => 
            date.jour === selectedDate.jour && date.mois === selectedDate.mois
          )
        );

      return matchesSearch && matchesDiet && matchesService && matchesDate;
    });
  }, [restaurants, searchTerm, showVegetarian, showVegan, selectedService, selectedDate]);

  // Filtrage des plats
  const filteredPlats = useMemo(() => {
    return allPlats.filter(plat => {
      // Recherche par nom de plat, description ou restaurant
      const matchesSearch = searchTerm === "" || 
        plat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plat.restaurant.nom.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par régime alimentaire
      const matchesDiet = (!showVegetarian && !showVegan) || 
        (showVegetarian && plat.vegetarien) || 
        (showVegan && plat.vegan);

      // Filtre par service
      const matchesService = !selectedService || 
        plat.services.includes(selectedService);

      // Filtre par date
      const matchesDate = !selectedDate || 
        plat.dates.some(date => 
          date.jour === selectedDate.jour && date.mois === selectedDate.mois
        );

      return matchesSearch && matchesDiet && matchesService && matchesDate;
    });
  }, [allPlats, searchTerm, showVegetarian, showVegan, selectedService, selectedDate]);

  // Liste des restaurants à afficher (prend en compte le contexte de sélection)
  const displayedRestaurants = useMemo(() => {
    // Si un restaurant a été sélectionné via la SmartSearchBar et correspond aux critères,
    // on s'assure qu'il est inclus dans la liste filtrée
    if (searchFromSmartBar && selectedRestaurant) {
      const restaurantMatchesFilters = (restaurant: Restaurant) => {
        // Filtre par régime alimentaire
        const matchesDiet = (!showVegetarian && !showVegan) || 
          restaurant.plats.some(plat => 
            (showVegetarian && plat.vegetarien) || 
            (showVegan && plat.vegan)
          );

        // Filtre par service
        const matchesService = !selectedService || 
          restaurant.plats.some(plat => plat.services.includes(selectedService));

        // Filtre par date
        const matchesDate = !selectedDate || 
          restaurant.plats.some(plat => 
            plat.dates.some(date => 
              date.jour === selectedDate.jour && date.mois === selectedDate.mois
            )
          );

        return matchesDiet && matchesService && matchesDate;
      };

      // Si le restaurant sélectionné correspond aux autres filtres, on l'affiche en premier
      if (restaurantMatchesFilters(selectedRestaurant)) {
        const otherFilteredRestaurants = filteredRestaurants.filter(r => r.id !== selectedRestaurant.id);
        return [selectedRestaurant, ...otherFilteredRestaurants];
      }
    }
    
    return filteredRestaurants;
  }, [filteredRestaurants, searchFromSmartBar, selectedRestaurant, showVegetarian, showVegan, selectedService, selectedDate]);

  if (selectedRestaurant) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <RestaurantDetail 
            restaurant={selectedRestaurant}
            onBack={() => setSelectedRestaurant(null)}
          />
        </div>
      </div>
    );
  }

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-gradient-card border-border/50 shadow-card p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Chargement des restaurants...
            </h3>
            <p className="text-muted-foreground text-center">
              Nous récupérons les dernières informations sur nos restaurants participants.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-gradient-card border-border/50 shadow-card p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Sparkles className="h-8 w-8 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground">
              Erreur de chargement
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-border/50"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white space-y-4">
            <h1 className="text-5xl font-bold">
              Kouss Kouss 2025
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Découvrez les saveurs authentiques du Maghreb lors de ce festival culinaire exceptionnel. 
              Explorez les restaurants participants et leurs créations gourmandes.
            </p>
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>22 Août - 7 Septembre 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Marseille</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-card border-border/50 shadow-card text-center">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-primary mb-2">{restaurants.length}</div>
              <div className="text-muted-foreground">Restaurants participants</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50 shadow-card text-center">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {allPlats.length}
              </div>
              <div className="text-muted-foreground">Plats uniques</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50 shadow-card text-center">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {allPlats.filter(p => p.vegetarien || p.vegan).length}
              </div>
              <div className="text-muted-foreground">Options végé & vegan</div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de filtres */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showVegetarian={showVegetarian}
          onVegetarianToggle={() => setShowVegetarian(!showVegetarian)}
          showVegan={showVegan}
          onVeganToggle={() => setShowVegan(!showVegan)}
          selectedService={selectedService}
          onServiceChange={setSelectedService}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          restaurants={restaurants}
          plats={allPlats}
          onRestaurantSelect={(restaurant) => {
            setSelectedRestaurant(restaurant);
            setSearchFromSmartBar(true);
          }}
          currentViewMode={viewMode}
          onViewModeChange={setViewMode}
          useSmartSearch={true}
        />

        {/* Onglets Restaurants/Plats */}
        <div className="mt-8">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'restaurants' | 'plats')} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger value="restaurants" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Restaurants
                </TabsTrigger>
                <TabsTrigger value="plats" className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  Plats
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-4">
                {viewMode === 'restaurants' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant={!showMap ? "default" : "outline"}
                      onClick={() => setShowMap(false)}
                      size="sm"
                      className="border-border/50"
                    >
                      Liste
                    </Button>
                    <Button
                      variant={showMap ? "default" : "outline"}
                      onClick={() => setShowMap(true)}
                      size="sm"
                      className="border-border/50"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Carte
                    </Button>
                  </div>
                )}
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  {viewMode === 'restaurants' 
                    ? `${displayedRestaurants.length} restaurant${displayedRestaurants.length > 1 ? 's' : ''}`
                    : `${filteredPlats.length} plat${filteredPlats.length > 1 ? 's' : ''}`
                  }
                </Badge>
              </div>
            </div>

            <TabsContent value="restaurants" className="mt-0">
              {displayedRestaurants.length === 0 ? (
                <Card className="bg-gradient-card border-border/50 shadow-card">
                  <CardContent className="py-12 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Aucun restaurant trouvé
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Essayez de modifier vos critères de recherche ou vos filtres.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setShowVegetarian(false);
                        setShowVegan(false);
                        setSelectedService(null);
                        setSelectedDate(null);
                        setSearchFromSmartBar(false);
                      }}
                      className="border-border/50"
                    >
                      Réinitialiser les filtres
                    </Button>
                  </CardContent>
                </Card>
              ) : showMap ? (
                /* Vue hybride : carte + liste sur grands écrans, empilée sur petits écrans */
                <div className="flex flex-col xl:flex-row gap-6">
                  {/* Carte */}
                  <div className="w-full xl:w-1/2">
                    <Map 
                      restaurants={displayedRestaurants}
                      onRestaurantSelect={(restaurant) => {
                        setSelectedRestaurant(restaurant);
                        setSearchFromSmartBar(false);
                      }}
                      selectedRestaurant={selectedRestaurant}
                      className="w-full h-[500px] xl:h-[600px]"
                    />
                  </div>
                  
                  {/* Liste des restaurants */}
                  <div className="w-full xl:w-1/2">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Restaurants sur la carte
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Cliquez sur un restaurant pour le localiser sur la carte
                      </p>
                    </div>
                    
                    <div className="max-h-[500px] xl:max-h-[600px] overflow-y-auto space-y-4 pr-2">
                      {displayedRestaurants.map((restaurant) => (
                        <div 
                          key={restaurant.id}
                          className={`transition-all duration-200 cursor-pointer ${
                            selectedRestaurant?.id === restaurant.id 
                              ? 'ring-2 ring-primary ring-offset-2' 
                              : ''
                          }`}
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setSearchFromSmartBar(false);
                          }}
                        >
                          <RestaurantCard
                            restaurant={restaurant}
                            onViewDetails={(restaurant) => {
                              setSelectedRestaurant(restaurant);
                              setSearchFromSmartBar(false);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onViewDetails={(restaurant) => {
                        setSelectedRestaurant(restaurant);
                        setSearchFromSmartBar(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="plats" className="mt-0">
              {filteredPlats.length === 0 ? (
                <Card className="bg-gradient-card border-border/50 shadow-card">
                  <CardContent className="py-12 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Aucun plat trouvé
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Essayez de modifier vos critères de recherche ou vos filtres.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setShowVegetarian(false);
                        setShowVegan(false);
                        setSelectedService(null);
                        setSelectedDate(null);
                        setSearchFromSmartBar(false);
                      }}
                      className="border-border/50"
                    >
                      Réinitialiser les filtres
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPlats.map((plat, index) => (
                    <div key={`${plat.restaurant.id}-${index}`}>
                      <PlatCard plat={plat} />
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">
                          <strong>Chez :</strong> {plat.restaurant.nom}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {plat.restaurant.adresse}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-border/50"
                          onClick={() => {
                            const restaurant = restaurants.find(r => r.id === plat.restaurant.id);
                            if (restaurant) {
                              setSelectedRestaurant(restaurant);
                              setSearchFromSmartBar(false);
                            }
                          }}
                        >
                          Voir le restaurant
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
