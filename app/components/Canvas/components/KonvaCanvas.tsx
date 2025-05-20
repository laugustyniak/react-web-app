// Canvas/components/KonvaCanvas.tsx
import { useRef, useEffect } from 'react';
// Import from our react-konva wrapper instead
import { 
  Stage, Layer, Image as KonvaImage, Transformer,
  KonvaEventObject
} from '~/lib/react-konva-wrapper';
import type { CanvasImage } from '../types';
import useImage from 'use-image';
// Use this for TypeScript types only
import type Konva from 'konva';

interface KonvaCanvasProps {
  width: number;
  height: number;
  images: CanvasImage[];
  onSelect: (id: string | null) => void;
  onImageUpdate: (id: string, updates: Partial<CanvasImage>) => void;
  isDraggingFile: boolean;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  setStageRef?: (ref: Konva.Stage | null) => void;
}

// Image component with image loading
const KanvasImage = ({ 
  image, 
  isSelected, 
  onSelect, 
  onChange
}: { 
  image: CanvasImage; 
  isSelected: boolean; 
  onSelect: (id: string) => void; 
  onChange: (id: string, updates: Partial<CanvasImage>) => void;
}) => {
  const [img] = useImage(image.src);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && imageRef.current) {
      // Attach transformer to the selected image
      if (transformerRef.current) {
        transformerRef.current.nodes([imageRef.current]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={img}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        rotation={image.rotation}
        draggable
        onClick={(e: any) => {
          e.cancelBubble = true; // Stop propagation
          onSelect(image.id);
        }}
        onDragEnd={(e: any) => {
          onChange(image.id, {
            x: e.target.x(),
            y: e.target.y()
          });
        }}
        onTransformEnd={() => {
          if (!imageRef.current) return;
          
          const node = imageRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          // Reset scale to 1 and apply to width/height instead
          node.scaleX(1);
          node.scaleY(1);
          
          onChange(image.id, {
            x: node.x(),
            y: node.y(),
            width: Math.abs(node.width() * scaleX),
            height: Math.abs(node.height() * scaleY),
            rotation: node.rotation()
          });
        }}
      />
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          boundBoxFunc={(oldBox: any, newBox: any) => {
            // Minimum size constraints
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default function KonvaCanvas({
  width,
  height,
  images,
  onSelect,
  onImageUpdate,
  isDraggingFile,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  setStageRef
}: KonvaCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);

  // Pass the stage ref to parent component if needed
  useEffect(() => {
    if (setStageRef && stageRef.current) {
      setStageRef(stageRef.current);
    }
  }, [setStageRef]);

  const handleStageClick = (e: any) => {
    // Deselect when clicking on empty space
    const clickedOnStage = e.target === e.target.getStage();
    if (clickedOnStage) {
      onSelect(null);
    }
  };

  return (
    <div
      className={`relative w-full h-full ${isDraggingFile ? "border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Stage 
        width={width} 
        height={height} 
        ref={stageRef}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {images.map((image) => (
            <KanvasImage
              key={image.id}
              image={image}
              isSelected={image.selected}
              onSelect={onSelect}
              onChange={onImageUpdate}
            />
          ))}
        </Layer>
      </Stage>

      {/* Drag overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-100/50 dark:bg-blue-900/50 pointer-events-none">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2 text-blue-500 w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="font-medium">Drop images here</p>
            <p className="text-sm text-gray-500">You can drop multiple images at once</p>
          </div>
        </div>
      )}

      {/* Empty canvas message */}
      {images.length === 0 && !isDraggingFile && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2 opacity-50 w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Upload images to get started</p>
            <p className="text-sm mt-2">Click the Upload Image button above or drag and drop images here</p>
          </div>
        </div>
      )}
    </div>
  );
}
