import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Sparkles, Loader2 } from "lucide-react";
import { fetchRestaurants, Restaurant } from "@/data/restaurants";
import { RestaurantCard } from "@/components/RestaurantCard";
import { RestaurantDetail } from "@/components/RestaurantDetail";
import { FilterBar } from "@/components/FilterBar";
import Map from "@/components/Map";
import heroImage from "@/assets/hero-kouss-kouss.jpg";

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
                {restaurants.reduce((acc, r) => acc + r.plats.length, 0)}
              </div>
              <div className="text-muted-foreground">Plats uniques</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50 shadow-card text-center">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {restaurants.reduce((acc, r) => acc + r.plats.filter(p => p.vegetarien || p.vegan).length, 0)}
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
        />

        {/* Liste des restaurants */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Restaurants participants
            </h2>
            <div className="flex items-center gap-4">
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
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {filteredRestaurants.length} résultat{filteredRestaurants.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {filteredRestaurants.length === 0 ? (
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
                  restaurants={filteredRestaurants}
                  onRestaurantSelect={setSelectedRestaurant}
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
                  {filteredRestaurants.map((restaurant) => (
                    <div 
                      key={restaurant.id}
                      className={`transition-all duration-200 cursor-pointer ${
                        selectedRestaurant?.id === restaurant.id 
                          ? 'ring-2 ring-primary ring-offset-2' 
                          : ''
                      }`}
                      onClick={() => setSelectedRestaurant(restaurant)}
                    >
                      <RestaurantCard
                        restaurant={restaurant}
                        onViewDetails={setSelectedRestaurant}
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
                  onViewDetails={setSelectedRestaurant}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
