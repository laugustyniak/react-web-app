// Canvas/components/HTMLCanvas.tsx
import React, { useRef, useEffect, useState } from 'react';
import type { CanvasImage } from '../types';
import { cn } from '~/lib/utils';

interface HTMLCanvasProps {
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
  containerRef?: React.RefObject<HTMLDivElement>; // Optional ref for the container
}

export default function HTMLCanvas({
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
  containerRef: externalContainerRef,
}: HTMLCanvasProps) {
  // Use external ref if provided, otherwise create our own
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || internalRef;
  const [imageElements, setImageElements] = useState<Record<string, HTMLImageElement>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [resizeStartData, setResizeStartData] = useState({
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0,
    originalX: 0,
    originalY: 0,
    clientX: 0,
    clientY: 0
  });
  const [isRotating, setIsRotating] = useState(false);
  const [rotateStartAngle, setRotateStartAngle] = useState(0);
  const [rotatingImageId, setRotatingImageId] = useState<string | null>(null);

  // Handle image loading
  useEffect(() => {
    const loadImages = async () => {
      const imgElements: Record<string, HTMLImageElement> = {};
      
      for (const image of images) {
        if (!imageElements[image.id]) {
          const img = new Image();
          img.src = image.src;
          
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if load fails
          });
          
          imgElements[image.id] = img;
        }
      }
      
      if (Object.keys(imgElements).length > 0) {
        setImageElements(prev => ({...prev, ...imgElements}));
      }
    };
    
    loadImages();
  }, [images]); // Removed imageElements to prevent infinite loop

  // Handle image click selection
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('canvas-image')) {
      const imageId = target.getAttribute('data-image-id');
      if (imageId) {
        e.stopPropagation();
        onSelect(imageId);
      }
    } else {
      // Clicked on the background
      onSelect(null);
    }
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent<HTMLElement>, imageId: string) => {
    e.stopPropagation();
    onSelect(imageId);
    
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    setIsDragging(true);
    setDragStartPos({
      x: e.clientX - image.x,
      y: e.clientY - image.y
    });
  };

  // Handle drag move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const selectedImage = images.find(img => img.selected);
      if (!selectedImage) return;
      
      onImageUpdate(selectedImage.id, {
        x: e.clientX - dragStartPos.x,
        y: e.clientY - dragStartPos.y
      });
    } else if (isResizing && resizeDirection) {
      const selectedImage = images.find(img => img.selected);
      if (!selectedImage) return;

      const deltaX = e.clientX - resizeStartData.clientX;
      const deltaY = e.clientY - resizeStartData.clientY;

      let newWidth = resizeStartData.width;
      let newHeight = resizeStartData.height;
      let newX = resizeStartData.originalX;
      let newY = resizeStartData.originalY;

      if (resizeDirection === 'nw') {
        newWidth -= deltaX;
        newHeight -= deltaY;
        newX += deltaX;
        newY += deltaY;
      } else if (resizeDirection === 'ne') {
        newWidth += deltaX;
        newHeight -= deltaY;
        newY += deltaY;
      } else if (resizeDirection === 'sw') {
        newWidth -= deltaX;
        newHeight += deltaY;
        newX += deltaX;
      } else if (resizeDirection === 'se') {
        newWidth += deltaX;
        newHeight += deltaY;
      }

      onImageUpdate(selectedImage.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
    } else if (isRotating && rotatingImageId) {
      const selectedImage = images.find(img => img.id === rotatingImageId);
      if (!selectedImage) return;

      const centerX = selectedImage.x + selectedImage.width / 2;
      const centerY = selectedImage.y + selectedImage.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

      onImageUpdate(rotatingImageId, {
        rotation: angle - rotateStartAngle
      });
    }
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeDirection(null);
    setRotatingImageId(null);
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, imageId: string, direction: 'nw' | 'ne' | 'sw' | 'se') => {
    e.stopPropagation();
    onSelect(imageId);

    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStartData({
      x: image.x,
      y: image.y,
      width: image.width,
      height: image.height,
      originalX: image.x,
      originalY: image.y,
      clientX: e.clientX,
      clientY: e.clientY
    });
  };

  // Handle rotate start
  const handleRotateStart = (e: React.MouseEvent<HTMLDivElement>, imageId: string) => {
    e.stopPropagation();
    onSelect(imageId);

    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setIsRotating(true);
    setRotatingImageId(imageId);
    setRotateStartAngle(image.rotation);
  };

  // Handle resize move
  const handleResizeMove = (e: React.MouseEvent) => {
    if (!isResizing || !resizeDirection) return;
    
    const selectedImage = images.find(img => img.selected);
    if (!selectedImage) return;
    
    const deltaX = e.clientX - resizeStartData.clientX;
    const deltaY = e.clientY - resizeStartData.clientY;
    
    let newWidth = resizeStartData.width;
    let newHeight = resizeStartData.height;
    let newX = resizeStartData.x;
    let newY = resizeStartData.y;
    
    // Maintain aspect ratio
    const aspectRatio = resizeStartData.width / resizeStartData.height;
    
    switch(resizeDirection) {
      case 'se':
        newWidth = Math.max(50, resizeStartData.width + deltaX);
        newHeight = newWidth / aspectRatio;
        break;
      case 'sw':
        newWidth = Math.max(50, resizeStartData.width - deltaX);
        newHeight = newWidth / aspectRatio;
        newX = resizeStartData.originalX + resizeStartData.width - newWidth;
        break;
      case 'ne':
        newWidth = Math.max(50, resizeStartData.width + deltaX);
        newHeight = newWidth / aspectRatio;
        newY = resizeStartData.originalY + resizeStartData.height - newHeight;
        break;
      case 'nw':
        newWidth = Math.max(50, resizeStartData.width - deltaX);
        newHeight = newWidth / aspectRatio;
        newX = resizeStartData.originalX + resizeStartData.width - newWidth;
        newY = resizeStartData.originalY + resizeStartData.height - newHeight;
        break;
    }
    
    onImageUpdate(selectedImage.id, {
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY
    });
  };

  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };

  // Handle rotation move
  const handleRotateMove = (e: React.MouseEvent) => {
    if (!isRotating || !rotatingImageId) return;
    
    const selectedImage = images.find(img => img.id === rotatingImageId);
    if (!selectedImage) return;
    
    // Calculate the center point of the image
    const centerX = selectedImage.x + selectedImage.width / 2;
    const centerY = selectedImage.y + selectedImage.height / 2;
    
    // Calculate the new angle between mouse position and image center
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    let newRotation = currentAngle - rotateStartAngle;
    
    // Round to nearest 15 degrees if shift is pressed for precise rotation
    if (e.shiftKey) {
      newRotation = Math.round(newRotation / 15) * 15;
    }
    
    onImageUpdate(selectedImage.id, {
      rotation: newRotation
    });
  };

  // Handle rotation end
  const handleRotateEnd = () => {
    setIsRotating(false);
    setRotatingImageId(null);
  };

  return (
    <div
      className={cn(
        "relative w-full h-full",
        isDraggingFile && "border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20"
      )}
      ref={containerRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Render canvas images */}
      {images.map((image) => (
        <div
          key={image.id}
          data-image-id={image.id}
          className={cn(
            "canvas-image absolute cursor-move",
            image.selected ? "ring-2 ring-blue-500" : ""
          )}
          style={{
            left: `${image.x}px`,
            top: `${image.y}px`,
            width: `${image.width}px`,
            height: `${image.height}px`,
            transform: `rotate(${image.rotation}deg)`,
            transformOrigin: "center center",
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
          {/* Resize handles for selected images */}
          {image.selected && (
            <div className="absolute inset-0 ring-2 ring-blue-500">
              {/* Northwest resize handle */}
              <div 
                className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-blue-500 cursor-nw-resize" 
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleResizeStart(e, image.id, 'nw');
                }}
              />
              {/* Northeast resize handle */}
              <div 
                className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-blue-500 cursor-ne-resize" 
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleResizeStart(e, image.id, 'ne');
                }}
              />
              {/* Southwest resize handle */}
              <div 
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-blue-500 cursor-sw-resize" 
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleResizeStart(e, image.id, 'sw');
                }}
              />
              {/* Southeast resize handle */}
              <div 
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-blue-500 cursor-se-resize" 
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleResizeStart(e, image.id, 'se');
                }}
              />
              {/* Rotation handle */}
              <div 
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-blue-500 flex items-center justify-center cursor-pointer"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleRotateStart(e, image.id);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ))}

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
