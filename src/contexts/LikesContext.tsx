import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllLikes, createLikeKey, LikesMap } from '@/data/likes';

interface LikesContextType {
  likes: LikesMap;
  getLikes: (restaurantId: string, dishIndex: number) => number;
  updateLikes: (restaurantId: string, dishIndex: number, newCount: number) => void;
  isLoading: boolean;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

interface LikesProviderProps {
  children: ReactNode;
}

export const LikesProvider: React.FC<LikesProviderProps> = ({ children }) => {
  const [likes, setLikes] = useState<LikesMap>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load all likes on mount
  useEffect(() => {
    const loadLikes = async () => {
      try {
        const allLikes = await getAllLikes();
        setLikes(allLikes);
      } catch (error) {
        console.error('Failed to load likes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLikes();
  }, []);

  const getLikes = (restaurantId: string, dishIndex: number): number => {
    const key = createLikeKey(restaurantId, dishIndex);
    return likes[key] || 0;
  };

  const updateLikes = (restaurantId: string, dishIndex: number, newCount: number) => {
    const key = createLikeKey(restaurantId, dishIndex);
    setLikes(prevLikes => ({
      ...prevLikes,
      [key]: newCount
    }));
  };

  const contextValue: LikesContextType = {
    likes,
    getLikes,
    updateLikes,
    isLoading,
  };

  return (
    <LikesContext.Provider value={contextValue}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = (): LikesContextType => {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
};