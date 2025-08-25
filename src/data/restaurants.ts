export interface Plat {
  nom: string;
  prix: string;
  description: string;
  vegetarien: boolean;
  vegan: boolean;
  dates: { jour: number; mois: number }[];
  services: string[];
}

export interface Restaurant {
  id?: string;
  nom: string;
  adresse: string;
  telephone: string;
  chef: string | null;
  plats: Plat[];
  latitude?: number;
  longitude?: number;
}

// Cache pour éviter de refaire la requête à chaque appel
let restaurantsCache: Restaurant[] | null = null;
let restaurantsPromise: Promise<Restaurant[]> | null = null;

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  // Si les données sont déjà en cache, les retourner
  if (restaurantsCache) {
    return restaurantsCache;
  }

  // Si une requête est déjà en cours, attendre qu'elle se termine
  if (restaurantsPromise) {
    return restaurantsPromise;
  }

  // Lancer la requête
  restaurantsPromise = (async () => {
    try {
      const response = await fetch('/restaurants.json');
      if (!response.ok) {
        throw new Error(`Erreur lors du chargement des restaurants: ${response.status}`);
      }
      const data: Restaurant[] = await response.json();
      
      // Ajouter un ID basé sur le nom si il n'y en a pas
      const restaurantsWithIds = data.map((restaurant, index) => ({
        ...restaurant,
        id: restaurant.id || restaurant.nom.toLowerCase().replace(/[^a-z0-9]/g, '-') || `restaurant-${index}`
      }));
      
      restaurantsCache = restaurantsWithIds;
      return restaurantsWithIds;
    } catch (error) {
      console.error('Erreur lors du chargement des restaurants:', error);
      throw error;
    } finally {
      restaurantsPromise = null;
    }
  })();

  return restaurantsPromise;
};

// Hook pour utiliser les restaurants avec React Query ou useState
export const useRestaurants = () => {
  return fetchRestaurants();
};