// Canvas/hooks/useCanvasImages.ts
import { useState, useEffect } from 'react';
import type { CanvasImage } from '../types';

export function useCanvasImages() {
    const [images, setImages] = useState<CanvasImage[]>([]);

    // Load saved canvas state from localStorage
    useEffect(() => {
        const savedCanvas = localStorage.getItem('canvasImages');
        if (savedCanvas) {
            try {
                const parsedImages = JSON.parse(savedCanvas);
                setImages(parsedImages);
            } catch (error) {
                console.error('Failed to parse saved canvas data', error);
            }
        }
    }, []);

    // Save canvas state to localStorage when images change
    useEffect(() => {
        localStorage.setItem('canvasImages', JSON.stringify(images));
    }, [images]);

    const addImage = (newImage: CanvasImage) => {
        setImages(prev => [...prev, newImage]);
    };

    const clearImages = () => {
        setImages([]);
    };

    const updateImage = (id: string, updates: Partial<CanvasImage>) => {
        setImages(images.map(img =>
            img.id === id ? { ...img, ...updates } : img
        ));
    };

    const removeImage = (id: string) => {
        setImages(images.filter(img => img.id !== id));
    };

    const selectImage = (id: string) => {
        setImages(images.map(img => ({
            ...img,
            selected: img.id === id
        })));
    };

    const deselectAllImages = () => {
        setImages(images.map(img => ({
            ...img,
            selected: false
        })));
    };

    return {
        images,
        setImages,
        addImage,
        clearImages,
        updateImage,
        removeImage,
        selectImage,
        deselectAllImages
    };
}
