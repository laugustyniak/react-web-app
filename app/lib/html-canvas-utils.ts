// html-canvas-utils.ts - Utility functions for HTML Canvas
import { CanvasImage } from "../components/Canvas/types";

// Export canvas state to JSON
export function exportCanvasState(images: CanvasImage[]): string {
    return JSON.stringify(images);
}

// Import canvas state from JSON
export function importCanvasState(jsonState: string): CanvasImage[] {
    try {
        return JSON.parse(jsonState);
    } catch (error) {
        console.error("Failed to parse canvas state:", error);
        return [];
    }
}

// Generate a data URL from the current canvas state
export function canvasToImage(
    containerElement: HTMLDivElement,
    images: CanvasImage[]
): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            // Create a temporary canvas element
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject("Could not get 2D context from canvas");
                return;
            }

            // Set canvas dimensions from container
            const rect = containerElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            // Draw white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Load all images
            const loadPromises = images.map(image => {
                return new Promise<void>((resolveImg) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.src = image.src;

                    img.onload = () => {
                        // Save the current context state
                        ctx.save();

                        // Move to position and set rotation point
                        ctx.translate(image.x + image.width / 2, image.y + image.height / 2);
                        ctx.rotate(image.rotation * Math.PI / 180);

                        // Draw centered image
                        ctx.drawImage(
                            img,
                            -image.width / 2, -image.height / 2,
                            image.width, image.height
                        );

                        // Restore the context state
                        ctx.restore();
                        resolveImg();
                    };

                    img.onerror = () => {
                        console.error(`Failed to load image: ${image.src}`);
                        resolveImg(); // Continue with other images
                    };
                });
            });

            // Wait for all images to be drawn
            Promise.all(loadPromises)
                .then(() => {
                    // Convert canvas to data URL
                    const dataUrl = canvas.toDataURL('image/png');
                    resolve(dataUrl);
                })
                .catch(err => {
                    reject(`Error generating canvas image: ${err}`);
                });

        } catch (error) {
            reject(`Error creating canvas image: ${error}`);
        }
    });
}

// Download the canvas as an image
export function downloadCanvasAsImage(
    containerElement: HTMLDivElement,
    images: CanvasImage[],
    filename = 'canvas-image.png'
): void {
    canvasToImage(containerElement, images)
        .then(dataUrl => {
            // Create a temporary link element
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);

            // Trigger download and clean up
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => {
            console.error('Failed to download canvas as image:', error);
        });
}
