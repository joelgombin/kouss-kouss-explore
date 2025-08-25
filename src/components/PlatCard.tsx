import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Sprout, Calendar, Clock } from "lucide-react";
import { Plat } from "@/data/restaurants";

interface PlatCardProps {
  plat: Plat;
}

export const PlatCard = ({ plat }: PlatCardProps) => {
  const formatDates = (dates: { jour: number; mois: number }[]) => {
    if (dates.length === 0) return "Dates non spécifiées";
    
    const monthNames = ["", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    
    if (dates.length <= 3) {
      return dates.map(d => `${d.jour} ${monthNames[d.mois]}`).join(", ");
    } else {
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      return `Du ${firstDate.jour} ${monthNames[firstDate.mois]} au ${lastDate.jour} ${monthNames[lastDate.mois]}`;
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-warm transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold text-foreground leading-tight pr-2">
            {plat.nom}
          </CardTitle>
          <div className="text-lg font-bold text-primary flex-shrink-0">
            {plat.prix}
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
          
          {plat.services.length > 0 && (
            <Badge variant="outline" className="border-border/50">
              <Clock className="h-3 w-3 mr-1" />
              {plat.services.join(", ")}
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
          <span>{formatDates(plat.dates)}</span>
        </div>
      </CardContent>
    </Card>
  );
};