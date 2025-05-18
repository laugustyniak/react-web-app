// Canvas/hooks/useInspirationGeneration.ts
import { useState } from 'react';
import { toast } from 'sonner';
import { captureElementAsImage } from '~/lib/canvasUtils';

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

            // Use the captureElementAsImage utility to get base64 image data
            const imageData = await captureElementAsImage(canvasRef.current);

            if (!imageData) throw new Error('Failed to capture canvas image');

            // Send only the canvas image to the inpainting API
            const response = await fetch('/api/inpaint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    base64_image: imageData.split(',')[1], // Remove data:image/png;base64, prefix
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
