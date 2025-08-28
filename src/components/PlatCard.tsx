import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Sprout, Calendar, Share2, Eye } from "lucide-react";
import { Plat } from "@/data/restaurants";
import { LikeButton } from "./LikeButton";
import { PhotoGallery } from "./PhotoGallery";
import { useLikes } from "@/contexts/LikesContext";

interface PlatCardProps {
  plat: Plat;
  restaurantId?: string;
  platIndex?: number;
  onViewDetails?: () => void;
  onShare?: () => void;
}

export const PlatCard = ({ plat, restaurantId, platIndex, onViewDetails, onShare }: PlatCardProps) => {
  const { getLikes, updateLikes } = useLikes();
  
  // Get current likes count for this dish
  const currentLikes = restaurantId && platIndex !== undefined 
    ? getLikes(restaurantId, platIndex) 
    : 0;

  const handleLikeUpdate = (newCount: number) => {
    if (restaurantId && platIndex !== undefined) {
      updateLikes(restaurantId, platIndex, newCount);
    }
  };

  const formatDatesWithServices = (dates: { jour: number; mois: number }[], services: string[]) => {
    if (dates.length === 0) return "Dates non spécifiées";
    
    const monthNames = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    
    let dateText = "";
    if (dates.length <= 3) {
      dateText = dates.map(d => `${d.jour} ${monthNames[d.mois]}`).join(", ");
    } else {
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      dateText = `Du ${firstDate.jour} ${monthNames[firstDate.mois]} au ${lastDate.jour} ${monthNames[lastDate.mois]}`;
    }
    
    // Ajouter les services à côté des dates
    if (services.length > 0) {
      dateText += ` (${services.join(", ")})`;
    }
    
    return dateText;
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-warm transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold text-foreground leading-tight pr-2">
            {plat.nom}
          </CardTitle>
          <div className="flex items-center gap-3 flex-shrink-0">
            {restaurantId && platIndex !== undefined && (
              <LikeButton
                restaurantId={restaurantId}
                dishIndex={platIndex}
                currentLikes={currentLikes}
                onLikeUpdate={handleLikeUpdate}
                variant="compact"
              />
            )}
            <div className="text-lg font-bold text-primary">
              {plat.prix}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {plat.vegetarien && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              <Leaf className="h-3 w-3 mr-1" />
              Végétarien
            </Badge>
          )}
          
          {plat.vegan && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              <Sprout className="h-3 w-3 mr-1" />
              Vegan
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-muted-foreground leading-relaxed">
          {plat.description}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{formatDatesWithServices(plat.dates, plat.services)}</span>
        </div>

        {/* Galerie de photos */}
        {restaurantId && platIndex !== undefined && (
          <PhotoGallery
            restaurantId={restaurantId}
            dishIndex={platIndex}
          />
        )}

        {/* Boutons d'action */}
        {(onViewDetails || onShare) && (
          <div className="flex gap-2 pt-3 border-t border-border/50">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="flex-1 border-border/50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir détails
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="flex-1 border-border/50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};