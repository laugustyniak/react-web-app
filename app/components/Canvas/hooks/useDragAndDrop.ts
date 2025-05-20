// Canvas/hooks/useDragAndDrop.ts
import { useState, useRef } from 'react';
import type { CanvasImage } from '../types';

export function useDragAndDrop(addImagesToCanvas: (files: File[]) => void) {
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Filter for image files only
            const imageFiles = Array.from(e.dataTransfer.files).filter(file =>
                file.type.startsWith('image/')
            );

            if (imageFiles.length > 0) {
                console.log(`Processing ${imageFiles.length} dropped images`);
                addImagesToCanvas(imageFiles);
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        addImagesToCanvas(Array.from(files));

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return {
        isDraggingFile,
        fileInputRef,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFileUpload
    };
}
