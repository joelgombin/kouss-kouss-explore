import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Sparkles, Loader2, UtensilsCrossed, Store, ExternalLink, Info } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchRestaurants, Restaurant, Plat } from "@/data/restaurants";
import { RestaurantCard } from "@/components/RestaurantCard";
import { RestaurantDetail } from "@/components/RestaurantDetail";
import { PlatCard } from "@/components/PlatCard";
import { PlatDetail } from "@/components/PlatDetail";
import { FilterBar, SortOption } from "@/components/FilterBar";
import Map from "@/components/Map";
import heroImage from "@/assets/hero-kouss-kouss.jpg";
import { toast } from "sonner";
import { useLikes } from "@/contexts/LikesContext";


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
  const { restaurantId, platIndex } = useParams();
  const navigate = useNavigate();
  const { getLikes } = useLikes();

  
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [hoveredRestaurant, setHoveredRestaurant] = useState<Restaurant | null>(null);
  const [selectedPlat, setSelectedPlat] = useState<{ plat: Plat; restaurant: Restaurant; index: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showVegetarian, setShowVegetarian] = useState(false);
  const [showVegan, setShowVegan] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<{jour: number, mois: number} | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
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

  // Gérer les paramètres d'URL pour restaurant et plat spécifiques
  useEffect(() => {
    if (!restaurants.length) return;

    if (restaurantId && platIndex) {
      // Affichage d'un plat spécifique
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant) {
        const index = parseInt(platIndex);
        if (index >= 0 && index < restaurant.plats.length) {
          setSelectedPlat({
            plat: restaurant.plats[index],
            restaurant,
            index
          });
          setSelectedRestaurant(null);
        } else {
          // Index de plat invalide, rediriger vers le restaurant
          navigate(`/restaurant/${restaurantId}`, { replace: true });
        }
      } else {
        // Restaurant non trouvé, rediriger vers l'accueil
        navigate("/", { replace: true });
      }
    } else if (restaurantId) {
      // Affichage d'un restaurant spécifique
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant) {
        setSelectedRestaurant(restaurant);
        setSelectedPlat(null);
      } else {
        // Restaurant non trouvé, rediriger vers l'accueil
        navigate("/", { replace: true });
      }
    } else {
      // Page d'accueil
      setSelectedRestaurant(null);
      setSelectedPlat(null);
    }
  }, [restaurants, restaurantId, platIndex, navigate]);

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

  // Fonction utilitaire pour le tri
  const sortItems = <T extends { nom: string; prix?: string }>(items: T[], sortOption: SortOption, getItemLikes?: (item: T, index: number) => number): T[] => {
    const sorted = [...items];
    
    switch (sortOption) {
      case 'likes-desc':
        if (getItemLikes) {
          sorted.sort((a, b) => getItemLikes(b, sorted.indexOf(b)) - getItemLikes(a, sorted.indexOf(a)));
        }
        break;
      case 'likes-asc':
        if (getItemLikes) {
          sorted.sort((a, b) => getItemLikes(a, sorted.indexOf(a)) - getItemLikes(b, sorted.indexOf(b)));
        }
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.nom.localeCompare(a.nom, 'fr'));
        break;
      case 'price-asc':
        if (items[0]?.prix) {
          sorted.sort((a, b) => {
            const priceA = parseFloat(a.prix?.replace('€', '').replace(',', '.') || '0');
            const priceB = parseFloat(b.prix?.replace('€', '').replace(',', '.') || '0');
            return priceA - priceB;
          });
        }
        break;
      case 'price-desc':
        if (items[0]?.prix) {
          sorted.sort((a, b) => {
            const priceA = parseFloat(a.prix?.replace('€', '').replace(',', '.') || '0');
            const priceB = parseFloat(b.prix?.replace('€', '').replace(',', '.') || '0');
            return priceB - priceA;
          });
        }
        break;
      default:
        // Keep original order for 'default'
        break;
    }
    
    return sorted;
  };

  // Filtrage des restaurants
  const filteredRestaurants = useMemo(() => {
    const filtered = restaurants.filter(restaurant => {
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

    // Apply sorting to restaurants
    return sortItems(filtered, sortBy, (restaurant) => {
      // For restaurants, get the sum of likes for all their dishes
      if (!restaurant.id) return 0;
      return restaurant.plats.reduce((sum, _, index) => {
        return sum + getLikes(restaurant.id!, index);
      }, 0);
    });
  }, [restaurants, searchTerm, showVegetarian, showVegan, selectedService, selectedDate, sortBy, getLikes]);

  // Filtrage des plats
  const filteredPlats = useMemo(() => {
    const filtered = allPlats.filter(plat => {
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

    // Apply sorting to dishes
    return sortItems(filtered, sortBy, (plat) => {
      const restaurant = restaurants.find(r => r.id === plat.restaurant.id);
      if (!restaurant) return 0;
      const platIndex = restaurant.plats.findIndex(p => p.nom === plat.nom && p.description === plat.description);
      return platIndex !== -1 ? getLikes(plat.restaurant.id, platIndex) : 0;
    });
  }, [allPlats, searchTerm, showVegetarian, showVegan, selectedService, selectedDate, sortBy, restaurants, getLikes]);

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

  // Fonctions de navigation et partage
  const handleViewPlatDetails = (restaurant: Restaurant, platIndex: number) => {
    navigate(`/restaurant/${restaurant.id}/plat/${platIndex}`);
  };

  const handleSharePlat = async (restaurant: Restaurant, platIndex: number) => {
    const shareUrl = `${window.location.origin}/restaurant/${restaurant.id}/plat/${platIndex}`;
    const plat = restaurant.plats[platIndex];
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${plat.nom} - ${restaurant.nom}`,
          text: `Découvrez "${plat.nom}" chez ${restaurant.nom} lors du festival Kouss Kouss 2025`,
          url: shareUrl,
        });
      } catch (error) {
        // L'utilisateur a annulé le partage ou erreur
        await copyToClipboard(shareUrl, plat.nom);
      }
    } else {
      await copyToClipboard(shareUrl, plat.nom);
    }
  };

  const copyToClipboard = async (url: string, platName: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Lien pour "${platName}" copié dans le presse-papiers !`);
    } catch (error) {
      toast.error("Erreur lors de la copie du lien");
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleBackToRestaurant = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  // Affichage du détail d'un plat spécifique
  if (selectedPlat) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <PlatDetail
            plat={selectedPlat.plat}
            restaurant={selectedPlat.restaurant}
            platIndex={selectedPlat.index}
            onBack={handleBackToHome}
            onViewRestaurant={() => handleBackToRestaurant(selectedPlat.restaurant.id!)}
          />
        </div>
      </div>
    );
  }

  // Affichage du détail d'un restaurant spécifique
  if (selectedRestaurant) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <RestaurantDetail 
            restaurant={selectedRestaurant}
            onBack={handleBackToHome}
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
              Nous récupérons les dernières informations sur les restaurants participants.
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
              Kouss•Kouss 2025
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              On aime le couscous. On aime le festival Kouss•Kouss. On aime encore plus quand on peut savoir où manger du couscous à Kouss•Kouss.
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
        {/* Bannière site non-officiel */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200/50 dark:border-blue-800/50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Site non-officiel</strong> • Ce site facilite la découverte du programme du festival. 
                    Site officiel : <a href="https://kousskouss.com/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">kousskouss.com</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
          sortBy={sortBy}
          onSortChange={setSortBy}
          restaurants={restaurants}
          plats={allPlats}
          onRestaurantSelect={(restaurant) => {
            navigate(`/restaurant/${restaurant.id}`);
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
                        navigate(`/restaurant/${restaurant.id}`);
                      }}
                      selectedRestaurant={selectedRestaurant}
                      onRestaurantHover={setHoveredRestaurant}
                      hoveredRestaurant={hoveredRestaurant}
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
                              : hoveredRestaurant?.id === restaurant.id
                              ? 'ring-2 ring-orange-400 ring-offset-2 shadow-lg'
                              : ''
                          }`}
                          onClick={() => {
                            navigate(`/restaurant/${restaurant.id}`);
                          }}
                          onMouseEnter={() => setHoveredRestaurant(restaurant)}
                          onMouseLeave={() => setHoveredRestaurant(null)}
                        >
                          <RestaurantCard
                            restaurant={restaurant}
                            onViewDetails={(restaurant) => {
                              navigate(`/restaurant/${restaurant.id}`);
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
                        navigate(`/restaurant/${restaurant.id}`);
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
                  {filteredPlats.map((plat, globalIndex) => {
                    const restaurant = restaurants.find(r => r.id === plat.restaurant.id);
                    const platIndex = restaurant?.plats.findIndex(p => p.nom === plat.nom && p.description === plat.description) || 0;
                    
                    return (
                      <div key={`${plat.restaurant.id}-${globalIndex}`}>
                        <PlatCard 
                          plat={plat}
                          restaurantId={plat.restaurant.id}
                          platIndex={platIndex}
                          onViewDetails={() => restaurant && handleViewPlatDetails(restaurant, platIndex)}
                          onShare={() => restaurant && handleSharePlat(restaurant, platIndex)}
                        />
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
                              if (restaurant) {
                                navigate(`/restaurant/${restaurant.id}`);
                              }
                            }}
                          >
                            Voir le restaurant
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-foreground mb-2">Kouss Kouss 2025</h3>
              <p className="text-sm text-muted-foreground">
                Festival culinaire du Maghreb • 22 Août - 7 Septembre 2025 • Marseille
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">

              <Link 
                to="/mentions-legales" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Mentions légales
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 JG Conseil - Tous droits réservés
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
