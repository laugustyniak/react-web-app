// Canvas/hooks/useCanvasExport.ts
import { toast } from 'sonner';
import { htmlToPng } from '~/lib/svgUtils';
import { captureElementDirectly } from '~/lib/directCanvasCapture';
import type { CanvasImage } from '../types';

export function useCanvasExport(
    images: CanvasImage[],
    setImages: (images: CanvasImage[]) => void,
    canvasRef: React.RefObject<HTMLDivElement | null>,
    deselectAllImages: () => void
) {
    // Function to save canvas as image
    const saveAsImage = async () => {
        if (!canvasRef.current) return;
        try {
            // Remove selection highlighting temporarily for clean export
            const selectedImage = images.find(img => img.selected);
            if (selectedImage) {
                deselectAllImages();
            }

            // Small delay to ensure DOM updates
            await new Promise(resolve => setTimeout(resolve, 100));

            // Try two capture methods in order, with fallback
            let imageData: string | null = null;

            // Method 1: Try the SVG-based approach first (should handle most cases)
            try {
                imageData = await htmlToPng(canvasRef.current);
                console.log("SVG conversion succeeded");
            } catch (svgError) {
                console.warn("SVG conversion failed with error:", svgError);
            }

            // Method 2: If SVG approach fails, try direct canvas capture
            if (!imageData) {
                try {
                    console.log("Trying direct canvas capture");
                    imageData = await captureElementDirectly(canvasRef.current);
                    console.log("Direct canvas capture succeeded");
                } catch (directError) {
                    console.warn("Direct canvas capture failed with error:", directError);
                }
            }

            if (!imageData) {
                throw new Error('Both image capture methods failed');
            }

            // Create and trigger download
            const link = document.createElement('a');
            link.download = `canvas-export-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = imageData;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Restore selection if there was one
            if (selectedImage) {
                setImages(images);
            }

            toast.success('Canvas exported as image successfully');
        } catch (error) {
            console.error('Failed to export canvas as image:', error);
            toast.error(`Failed to export canvas as image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Function to export canvas state
    const exportCanvasState = () => {
        try {
            const canvasState = JSON.stringify(images);
            const blob = new Blob([canvasState], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.download = `canvas-state-${new Date().toISOString().slice(0, 10)}.json`;
            link.href = url;
            link.click();

            // Clean up
            URL.revokeObjectURL(url);
            toast.success('Canvas state exported successfully');
        } catch (error) {
            console.error('Failed to export canvas state:', error);
            toast.error('Failed to export canvas state. Please try again.');
        }
    };

    // Function to import canvas state
    const importCanvasState = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (file.type !== 'application/json') {
            toast.error('Please select a valid JSON file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const contents = event.target?.result as string;
                const parsedImages = JSON.parse(contents) as CanvasImage[];

                // Verify the imported data structure
                if (!Array.isArray(parsedImages) || parsedImages.some(img => !img.id || !img.src)) {
                    throw new Error('Invalid canvas state format');
                }

                setImages(parsedImages);
                toast.success('Canvas state imported successfully');
            } catch (error) {
                console.error('Failed to import canvas state:', error);
                toast.error('Failed to import canvas state. File format is invalid.');
            }
        };

        reader.readAsText(file);

        // Reset file input
        if (e.target) {
            e.target.value = '';
        }
    };

    return {
        saveAsImage,
        exportCanvasState,
        importCanvasState
    };
}
