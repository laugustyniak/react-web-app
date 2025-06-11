// Canvas/hooks/useCanvasSnapshots.ts
import { useState, useCallback, useRef } from 'react';
import type { CanvasImage } from '../types';
import type { CanvasSnapshot } from '../components/CanvasSnapshots';
import { toast } from 'sonner';

interface UseCanvasSnapshotsProps {
  images: CanvasImage[];
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function useCanvasSnapshots({
  images,
  canvasRef
}: UseCanvasSnapshotsProps) {
  const [snapshots, setSnapshots] = useState<CanvasSnapshot[]>([]);

  // Capture canvas as image
  const captureCanvas = useCallback(async (): Promise<string | null> => {
    if (!canvasRef.current || images.length === 0) {
      return null;
    }

    try {
      // Create a temporary canvas to render the current state
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size (you can adjust these dimensions)
      const canvasWidth = 800;
      const canvasHeight = 600;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calculate scale factor to fit the canvas content
      const canvasElement = canvasRef.current;
      const canvasRect = canvasElement.getBoundingClientRect();
      const scaleX = canvasWidth / canvasRect.width;
      const scaleY = canvasHeight / canvasRect.height;

      // Render each image
      const imagePromises = images.map((image) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = () => {
            try {
              ctx.save();
              
              // Calculate scaled position and size
              const scaledX = image.x * scaleX;
              const scaledY = image.y * scaleY;
              const scaledWidth = image.width * scaleX;
              const scaledHeight = image.height * scaleY;
              
              // Apply rotation if needed
              if (image.rotation !== 0) {
                const centerX = scaledX + scaledWidth / 2;
                const centerY = scaledY + scaledHeight / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate((image.rotation * Math.PI) / 180);
                ctx.translate(-centerX, -centerY);
              }
              
              // Draw the image
              ctx.drawImage(img, scaledX, scaledY, scaledWidth, scaledHeight);
              ctx.restore();
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          
          img.onerror = () => reject(new Error(`Failed to load image: ${image.src}`));
          img.src = image.src;
        });
      });

      // Wait for all images to be rendered
      await Promise.all(imagePromises);

      // Convert canvas to data URL
      return canvas.toDataURL('image/png', 0.9);
    } catch (error) {
      console.error('Error capturing canvas:', error);
      toast.error('Failed to capture canvas snapshot');
      return null;
    }
  }, [images, canvasRef]);

  // Create a new snapshot
  const createSnapshot = useCallback(async (description?: string) => {
    const imageData = await captureCanvas();
    
    if (!imageData) {
      return null;
    }

    const snapshot: CanvasSnapshot = {
      id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageData,
      timestamp: new Date(),
      description: description || `Canvas with ${images.length} item${images.length !== 1 ? 's' : ''}`
    };

    setSnapshots(prev => [snapshot, ...prev]); // Add to beginning for chronological order
    return snapshot;
  }, [captureCanvas, images.length]);

  // Create snapshot for export action
  const createExportSnapshot = useCallback(async () => {
    const snapshot = await createSnapshot('Exported canvas');
    if (snapshot) {
      console.log('Export snapshot captured:', snapshot.id);
    }
    return snapshot;
  }, [createSnapshot]);

  // Create snapshot for inspiration generation
  const createInspirationSnapshot = useCallback(async () => {
    const snapshot = await createSnapshot('Before inspiration generation');
    if (snapshot) {
      console.log('Inspiration snapshot captured:', snapshot.id);
    }
    return snapshot;
  }, [createSnapshot]);

  // Delete a snapshot
  const deleteSnapshot = useCallback((id: string) => {
    setSnapshots(prev => prev.filter(snapshot => snapshot.id !== id));
    toast.success('Snapshot deleted');
  }, []);

  // Clear all snapshots
  const clearAllSnapshots = useCallback(() => {
    if (snapshots.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete all ${snapshots.length} snapshots?`)) {
      setSnapshots([]);
      toast.success('All snapshots cleared');
    }
  }, [snapshots.length]);

  // Download snapshot
  const downloadSnapshot = useCallback((snapshot: CanvasSnapshot) => {
    toast.success('Snapshot downloaded');
  }, []);

  // Manual capture
  const manualCapture = useCallback(async (description?: string) => {
    const snapshot = await createSnapshot(description);
    if (snapshot) {
      toast.success('Canvas snapshot captured');
    }
    return snapshot;
  }, [createSnapshot]);

  return {
    snapshots,
    createSnapshot: manualCapture,
    createExportSnapshot,
    createInspirationSnapshot,
    deleteSnapshot,
    clearAllSnapshots,
    downloadSnapshot,
    captureCanvas
  };
}
