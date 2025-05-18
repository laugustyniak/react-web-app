// Canvas/utils/canvasHelpers.ts
import type { Product } from '~/lib/dataTypes';
import type { CanvasImage } from '../types';

// Create a canvas image from a product
export function createCanvasImageFromProduct(product: Product): CanvasImage | null {
    if (!product.image_url) return null;

    return {
        id: `product-${product.id}-${Date.now()}`,
        src: product.image_url,
        x: 100 + (Math.random() * 100), // Random position
        y: 100 + (Math.random() * 100), // Random position
        width: 200,
        height: 200,
        rotation: 0,
        selected: false
    };
}

// Process files and create canvas images
export function processFilesToCanvasImages(
    files: File[],
    startingIndex: number,
    callback: (newImage: CanvasImage) => void
) {
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target) return;

            // Calculate grid position (3 columns)
            const position = startingIndex + index;
            const col = position % 3;
            const row = Math.floor(position / 3);

            const newImage: CanvasImage = {
                id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                src: event.target.result as string,
                x: 100 + (col * 220), // Add horizontal spacing
                y: 100 + (row * 220), // Add vertical spacing
                width: 200,
                height: 200,
                rotation: 0,
                selected: false
            };

            callback(newImage);
        };

        reader.readAsDataURL(file);
    });
}
