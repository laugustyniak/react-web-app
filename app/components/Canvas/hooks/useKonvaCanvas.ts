// Canvas/hooks/useKonvaCanvas.ts
import { useState, useEffect, useCallback } from 'react';
import type { CanvasImage } from '../types';

interface UseKonvaCanvasProps {
    images: CanvasImage[];
    updateImage: (id: string, updates: Partial<CanvasImage>) => void;
    selectImage: (id: string) => void;
    deselectAllImages: () => void;
}

export function useKonvaCanvas({
    images,
    updateImage,
    selectImage,
    deselectAllImages
}: UseKonvaCanvasProps) {
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

    // Handle window resize to adjust the stage size
    const updateStageSize = useCallback(() => {
        const container = document.getElementById('konva-container');
        if (container) {
            setStageSize({
                width: container.offsetWidth,
                height: container.offsetHeight || 600
            });
        }
    }, []);

    // Initialize stage size and set up resize handler
    useEffect(() => {
        updateStageSize();
        window.addEventListener('resize', updateStageSize);

        return () => {
            window.removeEventListener('resize', updateStageSize);
        };
    }, [updateStageSize]);

    // Handle image selection
    const handleSelectImage = (id: string | null) => {
        if (id === null) {
            deselectAllImages();
        } else {
            selectImage(id);
        }
    };

    return {
        stageSize,
        handleSelectImage,
        updateImage
    };
}
