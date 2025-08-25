import { useEffect, useRef } from "react";
import L from "leaflet";
import { Restaurant } from "@/data/restaurants";
import "leaflet/dist/leaflet.css";

// Fix pour les icônes par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MiniMapProps {
  restaurant: Restaurant;
  className?: string;
  height?: string;
}

const MiniMap = ({ restaurant, className = "", height = "200px" }: MiniMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !restaurant.latitude || !restaurant.longitude) return;

    // Initialiser la carte centrée sur le restaurant
    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false
    }).setView([restaurant.latitude, restaurant.longitude], 13);
    
    mapInstanceRef.current = map;

    // Ajouter les tuiles avec le style standard OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Créer une icône personnalisée pour le restaurant
    const icon = L.divIcon({
      html: `<div style="background-color: #ff6b6b; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); font-size: 16px;">🍽️</div>`,
      iconSize: [30, 30],
      className: 'custom-marker'
    });

    // Ajouter le marqueur du restaurant
    const marker = L.marker([restaurant.latitude, restaurant.longitude], { icon })
      .addTo(map);

    // Créer le popup avec les informations du restaurant (affiché seulement au clic)
    const popupContent = `
      <div style="min-width: 180px; font-family: system-ui, sans-serif;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; color: #1f2937;">${restaurant.nom}</h3>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${restaurant.adresse}</p>
        ${restaurant.telephone ? `<p style="margin: 0; font-size: 12px; color: #6b7280;">📞 ${restaurant.telephone}</p>` : ''}
      </div>
    `;

    marker.bindPopup(popupContent);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [restaurant]);

  // Si le restaurant n'a pas de coordonnées, ne pas afficher la carte
  if (!restaurant.latitude || !restaurant.longitude) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted/30 rounded-lg border border-border/50`} style={{ height }}>
        <p className="text-muted-foreground text-sm">Localisation non disponible</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full rounded-lg border border-border/50 shadow-sm"
        style={{ height }}
      />
    </div>
  );
};

export default MiniMap;
