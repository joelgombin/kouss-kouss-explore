// API functions for managing dish likes

export interface LikeResponse {
  restaurantId: string;
  dishIndex: number;
  likes: number;
  message?: string;
}

export interface LikesMap {
  [key: string]: number; // key format: "restaurantId-dishIndex"
}

const API_BASE = '/api';

// Get likes for a specific dish
export const getDishLikes = async (restaurantId: string, dishIndex: number): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE}/likes/${restaurantId}/${dishIndex}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: LikeResponse = await response.json();
    return data.likes;
  } catch (error) {
    console.error('Error fetching dish likes:', error);
    return 0; // Return 0 likes on error
  }
};

// Get all likes (for bulk loading)
export const getAllLikes = async (): Promise<LikesMap> => {
  try {
    const response = await fetch(`${API_BASE}/likes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: LikesMap = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all likes:', error);
    return {};
  }
};

// Add a like to a dish
export const addDishLike = async (restaurantId: string, dishIndex: number): Promise<LikeResponse | null> => {
  try {
    const response = await fetch(`${API_BASE}/likes/${restaurantId}/${dishIndex}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: LikeResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding like:', error);
    return null;
  }
};

// Get top liked dishes
export const getTopLikedDishes = async (limit: number = 10) => {
  try {
    const response = await fetch(`${API_BASE}/likes/top/${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top liked dishes:', error);
    return [];
  }
};

// Helper function to create like key
export const createLikeKey = (restaurantId: string, dishIndex: number): string => {
  return `${restaurantId}-${dishIndex}`;
};

// Helper function to parse like key
export const parseLikeKey = (key: string): { restaurantId: string; dishIndex: number } | null => {
  const parts = key.split('-');
  if (parts.length < 2) return null;
  
  const dishIndex = parseInt(parts[parts.length - 1]);
  const restaurantId = parts.slice(0, -1).join('-');
  
  if (isNaN(dishIndex)) return null;
  
  return { restaurantId, dishIndex };
};