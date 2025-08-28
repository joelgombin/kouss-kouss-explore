import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getDishPhotos, uploadDishPhoto, DishPhoto } from '@/data/photos';
import { toast } from 'sonner';

interface PhotoGalleryProps {
  restaurantId: string;
  dishIndex: number;
  className?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  restaurantId,
  dishIndex,
  className = ''
}) => {
  const [photos, setPhotos] = useState<DishPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Load photos on mount
  useEffect(() => {
    loadPhotos();
  }, [restaurantId, dishIndex]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const fetchedPhotos = await getDishPhotos(restaurantId, dishIndex);
      setPhotos(fetchedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'image ne peut pas dépasser 10MB');
      return;
    }

    setUploading(true);
    try {
      const newPhoto = await uploadDishPhoto(restaurantId, dishIndex, file);
      if (newPhoto) {
        setPhotos(prev => [newPhoto, ...prev]);
        toast.success('Photo ajoutée avec succès ! 📸');
      } else {
        toast.error('Échec de l\'upload de la photo');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex(prev => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(prev => (prev - 1 + photos.length) % photos.length);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextPhoto(); // Swipe left = next
      } else {
        prevPhoto(); // Swipe right = previous  
      }
    }
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'Escape') setLightboxOpen(false);
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [lightboxOpen, photos.length]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Upload button - Mobile optimized */}
      <div className="mb-4">
        <label htmlFor={`photo-upload-${restaurantId}-${dishIndex}`}>
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            className="cursor-pointer gap-2 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 touch-manipulation active:scale-95 transition-transform"
            asChild
          >
            <span>
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span className="hidden xs:inline">
                {uploading ? 'Upload en cours...' : 'Ajouter une photo'}
              </span>
              <span className="xs:hidden">
                {uploading ? 'Upload...' : 'Photo'}
              </span>
            </span>
          </Button>
        </label>
        <input
          id={`photo-upload-${restaurantId}-${dishIndex}`}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </div>

      {/* Photos grid */}
      {photos.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              {photos.length} photo{photos.length > 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative cursor-pointer group touch-manipulation active:scale-95 transition-transform"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-border/50 group-hover:border-orange-200 group-active:border-orange-300 transition-colors"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 group-active:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-white opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune photo pour ce plat</p>
          <p className="text-xs">Soyez le premier à partager une photo !</p>
        </div>
      )}

      {/* Lightbox - Mobile optimized */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-full h-full sm:max-w-4xl sm:h-auto p-0 bg-black/95 border-0">
          <DialogHeader className="p-4 flex-shrink-0">
            <DialogTitle className="text-white text-sm sm:text-base">
              Photo {currentPhotoIndex + 1} sur {photos.length}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 text-white hover:bg-white/10 touch-manipulation active:scale-95"
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </DialogHeader>
          
          {photos[currentPhotoIndex] && (
            <div 
              className="relative flex-1 flex items-center justify-center min-h-0"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={photos[currentPhotoIndex].url}
                alt={`Photo ${currentPhotoIndex + 1}`}
                className="w-full h-full max-h-[calc(100vh-80px)] sm:max-h-[80vh] object-contain select-none"
                draggable={false}
              />
              
              {photos.length > 1 && (
                <>
                  {/* Navigation buttons - hidden on small screens */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevPhoto}
                    className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextPhoto}
                    className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  
                  {/* Mobile swipe indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:hidden">
                    <div className="flex gap-2 bg-black/50 rounded-full px-3 py-1">
                      {photos.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};