import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, ChefHat, Utensils } from "lucide-react";
import { Restaurant } from "@/data/restaurants";
import { PlatCard } from "./PlatCard";

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
          <div className="flex items-start justify-between">
            <div className="space-y-2">
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
            
            <Utensils className="h-8 w-8 text-primary flex-shrink-0" />
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