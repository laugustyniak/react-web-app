// Canvas/hooks/useImageManipulation.ts
import { useState } from 'react';
import type { CanvasImage, CanvasTool } from '../types';

export function useImageManipulation(
    images: CanvasImage[],
    updateImage: (id: string, updates: Partial<CanvasImage>) => void,
    selectImage: (id: string) => void
) {
    const [selectedTool, setSelectedTool] = useState<CanvasTool>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

    // Handle image movement
    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        if (selectedTool !== 'move' && selectedTool !== null) return;

        const image = images.find(img => img.id === id);
        if (!image) return;

        selectImage(id);
        setIsDragging(true);
        setDragStartPos({
            x: e.clientX - image.x,
            y: e.clientY - image.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const selectedImage = images.find(img => img.selected);
        if (!selectedImage) return;

        updateImage(selectedImage.id, {
            x: e.clientX - dragStartPos.x,
            y: e.clientY - dragStartPos.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Handle image resize
    const handleResize = (direction: 'in' | 'out') => {
        const selectedImage = images.find(img => img.selected);
        if (!selectedImage) return;

        const scaleFactor = direction === 'in' ? 1.1 : 0.9;

        updateImage(selectedImage.id, {
            width: selectedImage.width * scaleFactor,
            height: selectedImage.height * scaleFactor
        });
    };

    // Handle image rotation
    const handleRotate = () => {
        const selectedImage = images.find(img => img.selected);
        if (!selectedImage) return;

        updateImage(selectedImage.id, {
            rotation: selectedImage.rotation + 90
        });
    };

    return {
        selectedTool,
        setSelectedTool,
        isDragging,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleResize,
        handleRotate
    };
}
