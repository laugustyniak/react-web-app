// Canvas/hooks/useInspirationGeneration.ts
import { useState } from 'react';
import { toast } from 'sonner';
import { captureElementDirectly } from '~/lib/directCanvasCapture';
import { htmlToPng } from '~/lib/svgUtils';

export function useInspirationGeneration(
    canvasRef: React.RefObject<HTMLDivElement | null>,
    deselectAllImages: () => void,
    hasImages: boolean
) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // Default prompts
    const defaultPrompt = "Create a sophisticated home decor lifestyle photo featuring elegant furniture and decorative items in a bright, airy living space. Show products in a realistic, high-end home setting with soft natural sunlight streaming through large windows. Include tasteful styling with neutral color palette, layered textures, and organic materials. Capture the products from an editorial perspective with professional composition and depth of field";
    const defaultNegativePrompt = "text, watermarks, logos, poor quality, blurry, artificial lighting, cluttered space, oversaturated colors, distorted proportions, unrealistic shadows, cartoon style, illustration, digital art style";

    const [prompt, setPrompt] = useState<string>(defaultPrompt);
    const [negativePrompt, setNegativePrompt] = useState<string>(defaultNegativePrompt);
    
    const generateInspiration = async () => {
        if (!canvasRef.current || !hasImages) {
            toast.error('Please add at least one image to the canvas');
            return;
        }

        try {
            setIsGenerating(true);
            setGeneratedImage(null);

            toast.loading('Generating inspiration...', {
                id: 'generate-inspiration',
            });

            // Remove selection highlighting temporarily for clean export
            deselectAllImages();

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

            if (!imageData) throw new Error('Both capture methods failed - unable to capture canvas image');

            // Validate the base64 string format
            if (!imageData.startsWith('data:image/png;base64,')) {
                throw new Error('Invalid image data format');
            }

            // Extract the base64 data by removing the prefix
            const base64Data = imageData.split(',')[1];

            // Validate that we have actual base64 data
            if (!base64Data || base64Data.trim() === '') {
                throw new Error('Empty image data');
            }

            // Send only the canvas image to the inpainting API
            const response = await fetch('/api/inpaint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    base64_image: base64Data,
                    prompt,
                    negative_prompt: negativePrompt,
                    internal_model: false,
                }),
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${await response.text()}`);
            }

            const result = await response.json();

            // The API returns a base64 encoded image
            setGeneratedImage(result.image);
            setShowResultModal(true);

            toast.success('Inspiration generated successfully', {
                id: 'generate-inspiration',
            });
        } catch (error) {
            console.error('Failed to generate inspiration:', error);
            toast.error(`Failed to generate inspiration: ${error instanceof Error ? error.message : 'Unknown error'}`, {
                id: 'generate-inspiration',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const resetPrompt = () => setPrompt(defaultPrompt);
    const resetNegativePrompt = () => setNegativePrompt(defaultNegativePrompt);

    return {
        prompt,
        setPrompt,
        negativePrompt,
        setNegativePrompt,
        resetPrompt,
        resetNegativePrompt,
        isGenerating,
        generateInspiration,
        showResultModal,
        setShowResultModal,
        generatedImage
    };
}
