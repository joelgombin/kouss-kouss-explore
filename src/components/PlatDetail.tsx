import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Calendar, MapPin, Leaf, Sprout, Copy, Check } from "lucide-react";
import { Plat, Restaurant } from "@/data/restaurants";
import { useState } from "react";
import { toast } from "sonner";

interface PlatDetailProps {
  plat: Plat;
  restaurant: Restaurant;
  platIndex: number;
  onBack: () => void;
  onViewRestaurant: () => void;
}

export const PlatDetail = ({ plat, restaurant, platIndex, onBack, onViewRestaurant }: PlatDetailProps) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

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
    
    if (services.length > 0) {
      dateText += ` (${services.join(", ")})`;
    }
    
    return dateText;
  };

  const shareUrl = `${window.location.origin}/restaurant/${restaurant.id}/plat/${platIndex}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedUrl(true);
      toast.success("Lien copié dans le presse-papiers !");
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie du lien");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${plat.nom} - ${restaurant.nom}`,
          text: `Découvrez "${plat.nom}" chez ${restaurant.nom} lors du festival Kouss Kouss 2025`,
          url: shareUrl,
        });
      } catch (error) {
        // L'utilisateur a annulé le partage ou erreur
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Bouton retour */}
      <Button
        variant="outline"
        onClick={onBack}
        className="border-border/50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      {/* Carte principale du plat */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                {plat.nom}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
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
            </div>
            <div className="text-2xl font-bold text-primary flex-shrink-0 ml-4">
              {plat.prix}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed text-base">
              {plat.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Disponibilité</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5 flex-shrink-0" />
              <span>{formatDatesWithServices(plat.dates, plat.services)}</span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
            <Button onClick={handleShare} className="flex-1 sm:flex-none">
              <Share2 className="h-4 w-4 mr-2" />
              Partager ce plat
            </Button>
            
            <Button variant="outline" onClick={handleCopyUrl} className="flex-1 sm:flex-none border-border/50">
              {copiedUrl ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier le lien
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations sur le restaurant */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Restaurant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{restaurant.nom}</h3>
              {restaurant.chef && (
                <p className="text-muted-foreground">Chef : {restaurant.chef}</p>
              )}
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground">{restaurant.adresse}</p>
                {restaurant.telephone && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Tél : {restaurant.telephone}
                  </p>
                )}
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={onViewRestaurant}
              className="border-border/50"
            >
              Voir tous les plats du restaurant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
