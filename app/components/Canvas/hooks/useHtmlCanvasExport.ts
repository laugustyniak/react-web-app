// useHtmlCanvasExport.ts - Hook for exporting HTML Canvas
import { useRef } from "react";
import type { CanvasImage } from "../types";
import {
    exportCanvasState,
    importCanvasState,
    downloadCanvasAsImage
} from "~/lib/html-canvas-utils";

interface UseHtmlCanvasExportProps {
    images: CanvasImage[];
    setImages: (images: CanvasImage[]) => void;
    deselectAllImages: () => void;
}

export function useHtmlCanvasExport({
    images,
    setImages,
    deselectAllImages
}: UseHtmlCanvasExportProps) {
    // Container ref for the canvas
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Save the canvas as an image file
    const saveAsImage = (filename = "canvas-image.png") => {
        if (!containerRef.current) {
            console.error("Canvas container not found");
            return;
        }

        // Deselect all images to make a clean export
        deselectAllImages();

        // Process after a short delay to ensure UI is updated
        setTimeout(() => {
            downloadCanvasAsImage(containerRef.current!, images, filename);
        }, 100);
    };

    // Export the canvas state as JSON
    const exportCanvasStateToJson = () => {
        return exportCanvasState(images);
    };

    // Import canvas state from JSON
    const importCanvasStateFromJson = (jsonState: string) => {
        try {
            const importedImages = importCanvasState(jsonState);
            setImages(importedImages);
            return true;
        } catch (error) {
            console.error("Error importing canvas state:", error);
            return false;
        }
    };

    return {
        containerRef,
        saveAsImage,
        exportCanvasState: exportCanvasStateToJson,
        importCanvasState: importCanvasStateFromJson
    };
}
