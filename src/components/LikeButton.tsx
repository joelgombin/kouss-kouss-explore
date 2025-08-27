import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChickpeaIcon } from './ChickpeaIcon';
import { addDishLike } from '@/data/likes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  restaurantId: string;
  dishIndex: number;
  currentLikes: number;
  onLikeUpdate: (newCount: number) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  restaurantId,
  dishIndex,
  currentLikes,
  onLikeUpdate,
  variant = 'default',
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click handlers
    
    if (isLoading) return;

    setIsLoading(true);
    setHasAnimated(true);

    try {
      const result = await addDishLike(restaurantId, dishIndex);
      
      if (result) {
        onLikeUpdate(result.likes);
        toast.success('Merci pour votre vote ! 🐣');
      } else {
        toast.error('Impossible d\'ajouter le vote pour le moment');
      }
    } catch (error) {
      console.error('Error liking dish:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
      // Reset animation after a delay
      setTimeout(() => setHasAnimated(false), 600);
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={cn(
          "h-6 px-2 text-xs gap-1 hover:bg-orange-50 hover:text-orange-700 transition-colors",
          hasAnimated && "animate-pulse",
          className
        )}
        title="Voter pour ce plat"
      >
        <ChickpeaIcon 
          className={cn(
            "w-3 h-3 transition-transform",
            hasAnimated && "scale-125"
          )}
          filled={hasAnimated}
        />
        <span className="font-medium">{currentLikes}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "gap-2 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition-all duration-200",
        hasAnimated && "animate-bounce",
        className
      )}
      title="Voter pour ce plat - Montrez votre appréciation !"
    >
      <ChickpeaIcon 
        className={cn(
          "w-4 h-4 transition-all duration-200",
          hasAnimated && "scale-110 text-orange-600"
        )}
        filled={hasAnimated}
      />
      <span className="font-medium">
        {isLoading ? '...' : currentLikes}
      </span>
      {variant === 'default' && (
        <span className="text-sm text-muted-foreground">
          {currentLikes === 0 ? 'Voter' : currentLikes === 1 ? 'vote' : 'votes'}
        </span>
      )}
    </Button>
  );
};