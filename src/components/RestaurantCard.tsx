import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ChefHat, Utensils, Leaf, Sprout } from "lucide-react";
import { Restaurant } from "@/data/restaurants";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onViewDetails: (restaurant: Restaurant) => void;
}

export const RestaurantCard = ({ restaurant, onViewDetails }: RestaurantCardProps) => {
  const vegetarienCount = restaurant.plats.filter(p => p.vegetarien).length;
  const veganCount = restaurant.plats.filter(p => p.vegan).length;

  return (
    <Card className="h-full bg-gradient-card border-border/50 shadow-card hover:shadow-warm transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold text-foreground leading-tight">
            {restaurant.nom}
          </CardTitle>
          <Utensils className="h-6 w-6 text-primary flex-shrink-0" />
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
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
              <span className="font-medium text-foreground">{restaurant.chef}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
            {restaurant.plats.length} plat{restaurant.plats.length > 1 ? 's' : ''}
          </Badge>
          
          {vegetarienCount > 0 && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              <Leaf className="h-3 w-3 mr-1" />
              {vegetarienCount} végétarien{vegetarienCount > 1 ? 's' : ''}
            </Badge>
          )}
          
          {veganCount > 0 && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              <Sprout className="h-3 w-3 mr-1" />
              {veganCount} vegan{veganCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <Button 
          onClick={() => onViewDetails(restaurant)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          Voir les plats
        </Button>
      </CardContent>
    </Card>
  );
};