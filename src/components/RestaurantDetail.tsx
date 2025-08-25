import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, ChefHat, Utensils } from "lucide-react";
import { Restaurant } from "@/data/restaurants";
import { PlatCard } from "./PlatCard";
import MiniMap from "./MiniMap";

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onBack: () => void;
}

export const RestaurantDetail = ({ restaurant, onBack }: RestaurantDetailProps) => {
  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="border-border/50 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>

      {/* Informations du restaurant */}
      <Card className="bg-gradient-card border-border/50 shadow-warm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                {restaurant.nom}
              </CardTitle>
              
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{restaurant.adresse}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{restaurant.telephone}</span>
                </div>
                
                {restaurant.chef && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-foreground">Chef {restaurant.chef}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center lg:items-end gap-4">
              <Utensils className="h-8 w-8 text-primary flex-shrink-0" />
              
              {/* Mini-carte de localisation - à droite en desktop, en bas sur mobile */}
              {(restaurant.latitude && restaurant.longitude) && (
                <div className="w-full lg:w-64 space-y-2">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2 lg:justify-end">
                    <MapPin className="h-4 w-4" />
                    Localisation
                  </h3>
                  <MiniMap restaurant={restaurant} height="200px" className="lg:w-64" />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
            {restaurant.plats.length} plat{restaurant.plats.length > 1 ? 's' : ''} au menu
          </Badge>
        </CardContent>
      </Card>

      {/* Liste des plats */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Menu du festival</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {restaurant.plats.map((plat, index) => (
            <PlatCard key={index} plat={plat} />
          ))}
        </div>
      </div>
    </div>
  );
};