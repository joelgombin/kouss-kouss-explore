import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { Restaurant } from "@/data/restaurants";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix pour les icônes par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Définition des styles de tuiles disponibles
const tileStyles = {
  cartodb: {
    name: 'Épuré',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors © CARTO',
    options: { subdomains: 'abcd', maxZoom: 19 }
  },
  openstreetmap: {
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    options: { maxZoom: 19 }
  },
  cartodb_dark: {
    name: 'Sombre',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors © CARTO',
    options: { subdomains: 'abcd', maxZoom: 19 }
  },
  esri_satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    options: { maxZoom: 19 }
  }
};

interface MapProps {
  restaurants: Restaurant[];
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  selectedRestaurant?: Restaurant | null;
  onRestaurantHover?: (restaurant: Restaurant | null) => void;
  hoveredRestaurant?: Restaurant | null;
  className?: string;
}

const Map = ({ restaurants, onRestaurantSelect, selectedRestaurant, onRestaurantHover, hoveredRestaurant, className = "" }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const [currentStyle, setCurrentStyle] = useState<keyof typeof tileStyles>('cartodb');
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  
  // Stabiliser les callbacks pour éviter les re-rendus
  const handleRestaurantSelect = useCallback((restaurant: Restaurant) => {
    onRestaurantSelect?.(restaurant);
  }, [onRestaurantSelect]);
  
  const handleRestaurantHover = useCallback((restaurant: Restaurant | null) => {
    onRestaurantHover?.(restaurant);
  }, [onRestaurantHover]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialiser la carte centrée sur Marseille
    const map = L.map(mapRef.current).setView([43.2965, 5.3698], 13);
    mapInstanceRef.current = map;

    // Ajouter le style de tuiles par défaut
    const style = tileStyles[currentStyle];
    const tileLayer = L.tileLayer(style.url, {
      attribution: style.attribution,
      ...style.options
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Effet pour changer le style de tuiles
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Supprimer l'ancien layer de tuiles
    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    }

    // Ajouter le nouveau style
    const style = tileStyles[currentStyle];
    const tileLayer = L.tileLayer(style.url, {
      attribution: style.attribution,
      ...style.options
    }).addTo(mapInstanceRef.current);
    currentTileLayerRef.current = tileLayer;
  }, [currentStyle]);

  // Effet pour créer les marqueurs (une seule fois)
  useEffect(() => {
    if (!mapInstanceRef.current || !restaurants.length) return;

    // Nettoyer les marqueurs existants
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Ajouter les nouveaux marqueurs
    const validRestaurants = restaurants.filter(restaurant => 
      restaurant.latitude && restaurant.longitude
    );

    if (validRestaurants.length === 0) return;

    validRestaurants.forEach(restaurant => {
      if (!restaurant.latitude || !restaurant.longitude) return;

      // Créer une icône par défaut
      const icon = L.divIcon({
        html: `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🍽️</div>`,
        iconSize: [20, 20],
        className: 'custom-marker'
      });

      const marker = L.marker([restaurant.latitude, restaurant.longitude], { icon })
        .addTo(mapInstanceRef.current!);

      // Stocker l'ID du restaurant avec le marqueur
      (marker as any).restaurantId = restaurant.id;

      // Créer le popup avec les informations du restaurant
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">${restaurant.nom}</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">${restaurant.adresse}</p>
          ${restaurant.telephone ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">📞 ${restaurant.telephone}</p>` : ''}
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;"><strong>${restaurant.plats.length}</strong> plat${restaurant.plats.length > 1 ? 's' : ''} disponible${restaurant.plats.length > 1 ? 's' : ''}</p>
          ${onRestaurantSelect ? `<button onclick="window.selectRestaurant('${restaurant.id}')" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 8px;">Voir les détails</button>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);

      // Ajouter les événements sur le marqueur
      if (handleRestaurantSelect) {
        marker.on('click', () => {
          handleRestaurantSelect(restaurant);
        });
      }

      // Ajouter les événements de hover
      if (handleRestaurantHover) {
        marker.on('mouseover', () => {
          handleRestaurantHover(restaurant);
        });

        marker.on('mouseout', () => {
          handleRestaurantHover(null);
        });
      }

      markersRef.current.push(marker);
    });

    // Ajuster la vue pour inclure tous les marqueurs (seulement au premier chargement)
    if (validRestaurants.length > 0 && !selectedRestaurant) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [restaurants]);

  // Effet séparé pour mettre à jour les styles des marqueurs
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach(marker => {
      const restaurantId = (marker as any).restaurantId;
      const isSelected = selectedRestaurant?.id === restaurantId;
      const isHovered = hoveredRestaurant?.id === restaurantId;
      
      let iconHtml;
      if (isSelected) {
        iconHtml = `<div style="background-color: #ff6b6b; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🍽️</div>`;
      } else if (isHovered) {
        iconHtml = `<div style="background-color: #f59e0b; color: white; border-radius: 50%; width: 23px; height: 23px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); transform: scale(1.1);">🍽️</div>`;
      } else {
        iconHtml = `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🍽️</div>`;
      }

      const newIcon = L.divIcon({
        html: iconHtml,
        iconSize: isSelected ? [25, 25] : isHovered ? [23, 23] : [20, 20],
        className: 'custom-marker'
      });

      marker.setIcon(newIcon);
    });
  }, [selectedRestaurant, hoveredRestaurant]);

  // Effet séparé pour centrer sur le restaurant sélectionné
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRestaurant) return;
    
    if (selectedRestaurant.latitude && selectedRestaurant.longitude) {
      mapInstanceRef.current.setView([selectedRestaurant.latitude, selectedRestaurant.longitude], 15, {
        animate: true
      });
    }
  }, [selectedRestaurant]);

  // Fonction globale pour la sélection depuis le popup
  useEffect(() => {
    (window as any).selectRestaurant = (restaurantId: string) => {
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant && onRestaurantSelect) {
        onRestaurantSelect(restaurant);
      }
    };

    return () => {
      delete (window as any).selectRestaurant;
    };
  }, [restaurants, onRestaurantSelect]);

  // Fermer le sélecteur quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStyleSelector) {
        setShowStyleSelector(false);
      }
    };

    if (showStyleSelector) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showStyleSelector]);

  return (
    <div className={`relative ${className}`}>
      {/* Sélecteur de style de carte */}
      <div className="absolute top-4 right-4 z-[1000]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-background/95 backdrop-blur-sm rounded-lg border border-border/50 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStyleSelector(!showStyleSelector)}
            className="p-2 h-auto"
          >
            <Layers className="h-4 w-4" />
          </Button>
          
          {showStyleSelector && (
            <div className="absolute top-full right-0 mt-2 bg-background border border-border/50 rounded-lg shadow-lg min-w-[120px]">
              {Object.entries(tileStyles).map(([key, style]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentStyle(key as keyof typeof tileStyles);
                    setShowStyleSelector(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    currentStyle === key ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* La carte */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-border/50 shadow-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default Map;
