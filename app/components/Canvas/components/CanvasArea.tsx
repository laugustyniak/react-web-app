// Canvas/components/CanvasArea.tsx
import { useState, useEffect } from 'react';
import { cn } from '~/lib/utils';
import type { CanvasImage } from '../types';
import { Upload, AlertTriangle } from 'lucide-react';
import { ContentCard } from '~/components/ui/layout';
import { Button } from '~/components/ui/button';

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  images: CanvasImage[];
  isDraggingFile: boolean;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseDown: (e: React.MouseEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function CanvasArea({
  canvasRef,
  images,
  isDraggingFile,
  handleMouseMove,
  handleMouseUp,
  handleMouseDown,
  handleDragOver,
  handleDragLeave,
  handleDrop
}: CanvasAreaProps) {
  // State to track if any images failed to load
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  
  // Track if canvas content is valid
  const [canvasValid, setCanvasValid] = useState(true);
  
  // Check canvas dimensions to ensure it's rendering properly
  useEffect(() => {
    const validateCanvas = () => {
      if (!canvasRef.current) return;
      
      const { offsetWidth, offsetHeight } = canvasRef.current;
      
      // Check if canvas is actually being rendered with proper dimensions
      if ((offsetWidth === 0 || offsetHeight === 0) && images.length > 0) {
        setCanvasValid(false);
        console.warn('Canvas has zero dimensions but contains images:', 
          { offsetWidth, offsetHeight, imageCount: images.length });
      } else {
        setCanvasValid(true);
      }
    };
    
    validateCanvas();
    
    // Revalidate when images change
    const timer = setTimeout(validateCanvas, 500);
    
    return () => clearTimeout(timer);
  }, [canvasRef, images]);
  
  // Handle image load errors
  const handleImageError = (imageId: string) => {
    setFailedImages(prev => ({ ...prev, [imageId]: true }));
    console.error(`Failed to load image with ID: ${imageId}`);
  };
  
  // Count of failed images
  const failedImageCount = Object.values(failedImages).filter(Boolean).length;
  
  return (
    <ContentCard className="flex-grow p-0 overflow-hidden bg-gray-100 dark:bg-gray-900 relative z-0">
      {(!canvasValid || failedImageCount > 0) && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-900/50 p-2 z-20 text-sm flex items-center">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
          <span>
            {!canvasValid && 'Canvas may not be rendering properly. '}
            {failedImageCount > 0 && `${failedImageCount} image(s) failed to load. `}
            This could affect export and generation.
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.reload()} 
            className="ml-auto text-xs"
          >
            Reload Page
          </Button>
        </div>
      )}
      
      <div
        ref={canvasRef}
        className={cn(
          "w-full h-[600px] relative overflow-auto",
          isDraggingFile && "border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20",
          !canvasValid && "border border-yellow-500"
        )}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="canvas-area"
      >
        {/* Render canvas images */}
        {images.map((image) => (
          <div
            key={image.id}
            className={cn(
              "absolute cursor-move",
              image.selected ? "ring-2 ring-blue-500" : "",
              failedImages[image.id] ? "ring-2 ring-red-500" : ""
            )}
            style={{
              left: `${image.x}px`,
              top: `${image.y}px`,
              width: `${image.width}px`,
              height: `${image.height}px`,
              transform: `rotate(${image.rotation}deg)`,
              zIndex: image.selected ? 10 : 1
            }}
            onMouseDown={(e) => handleMouseDown(e, image.id)}
          >
            <img
              src={image.src}
              alt="Canvas image"
              className="w-full h-full object-contain select-none"
              draggable={false}
              onError={() => handleImageError(image.id)}
            />
          </div>
        ))}
        
        {/* Drag overlay */}
        {isDraggingFile && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-100/50 dark:bg-blue-900/50 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
              <Upload size={32} className="mx-auto mb-2 text-blue-500" />
              <p className="font-medium">Drop images here</p>
              <p className="text-sm text-gray-500">You can drop multiple images at once</p>
            </div>
          </div>
        )}
        
        {/* Empty canvas message */}
        {images.length === 0 && !isDraggingFile && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <Upload size={48} className="mx-auto mb-2 opacity-50" />
              <p>Upload images to get started</p>
              <p className="text-sm mt-2">Click the Upload Image button above or drag and drop images here</p>
            </div>
          </div>
        )}
      </div>
    </ContentCard>
  );
}
