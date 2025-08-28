// API functions for photo management

export interface DishPhoto {
  id: number;
  restaurant_id: string;
  dish_index: number;
  filename: string;
  original_name: string;
  file_size: number;
  width: number;
  height: number;
  created_at: string;
  url: string;
  thumbnail_url: string;
}

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

// Get all photos for a specific dish
export const getDishPhotos = async (restaurantId: string, dishIndex: number): Promise<DishPhoto[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/photos/${restaurantId}/${dishIndex}`);
    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
};

// Upload a photo for a specific dish
export const uploadDishPhoto = async (
  restaurantId: string, 
  dishIndex: number, 
  photoFile: File
): Promise<DishPhoto | null> => {
  try {
    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await fetch(`${API_BASE}/api/photos/${restaurantId}/${dishIndex}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    const result = await response.json();
    return {
      id: result.id,
      restaurant_id: restaurantId,
      dish_index: dishIndex,
      filename: result.filename,
      original_name: photoFile.name,
      file_size: photoFile.size,
      width: result.width,
      height: result.height,
      created_at: new Date().toISOString(),
      url: `${API_BASE}${result.url}`,
      thumbnail_url: `${API_BASE}${result.url}`,
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return null;
  }
};

// Delete a photo
export const deleteDishPhoto = async (photoId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/api/photos/${photoId}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};