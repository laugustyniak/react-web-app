// Canvas/components/CanvasArea.tsx
import { cn } from '~/lib/utils';
import type { CanvasImage } from '../types';
import { Upload } from 'lucide-react';
import { ContentCard } from '~/components/ui/layout';

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
  return (
    <ContentCard className="flex-grow p-0 overflow-hidden bg-gray-100 dark:bg-gray-900 relative z-0">
      <div
        ref={canvasRef}
        className={cn(
          "w-full h-[600px] relative overflow-auto",
          isDraggingFile && "border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20"
        )}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Render canvas images */}
        {images.map((image) => (
          <div
            key={image.id}
            className={cn(
              "absolute cursor-move",
              image.selected ? "ring-2 ring-blue-500" : ""
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
