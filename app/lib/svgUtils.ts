/**
 * Utilities for handling SVG elements and converting them to different formats
 */

/**
 * Converts an SVG element to a PNG image using Canvas
 * 
 * @param svgElement The SVG element to convert
 * @param width The desired width of the output image
 * @param height The desired height of the output image
 * @returns A Promise that resolves to the PNG data URL
 */
export function svgToPng(svgElement: SVGElement, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        // Create an image from the SVG
        const image = new Image();
        // Set cross-origin attribute to prevent tainting the canvas
        image.crossOrigin = 'anonymous';

        // Process SVG data - ensure all embedded images have crossorigin attributes
        let svgData = new XMLSerializer().serializeToString(svgElement);

        // Add a base64 data URI prefix to ensure the SVG is treated as same-origin
        const svg64 = btoa(unescape(encodeURIComponent(svgData)));
        const b64Start = 'data:image/svg+xml;base64,';
        const image64 = b64Start + svg64;

        image.onload = () => {
            try {
                // Draw the image to the canvas
                ctx.drawImage(image, 0, 0, width, height);

                // Get the PNG data URL
                const pngDataUrl = canvas.toDataURL('image/png');
                resolve(pngDataUrl);
            } catch (error) {
                console.error('Error during canvas export:', error);
                reject(error);
            }
        };

        image.onerror = (error) => {
            console.error('Failed to load SVG:', error);
            reject(new Error('Failed to load SVG'));
        };

        // Use the base64 encoded data URI instead of a Blob URL
        image.src = image64;
    });
}

/**
 * Converts an HTML element to an SVG document that can then be converted to PNG
 * 
 * @param element The HTML element to convert to SVG
 * @returns An SVG element representing the HTML element
 */
export function htmlToSvg(element: HTMLElement): SVGElement {
    // Get the bounding dimensions
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Create an SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Create a foreign object to embed the HTML
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('width', '100%');
    foreignObject.setAttribute('height', '100%');
    foreignObject.setAttribute('x', '0');
    foreignObject.setAttribute('y', '0');
    foreignObject.setAttribute('externalResourcesRequired', 'false');

    // Clone the element and its styles
    const clone = element.cloneNode(true) as HTMLElement;

    // Process all images in the clone to add crossOrigin attributes
    processImagesForCrossOrigin(clone);

    // Append the clone to the foreign object
    foreignObject.appendChild(clone);

    // Append the foreign object to the SVG
    svg.appendChild(foreignObject);

    return svg;
}

/**
 * Process all images in an element to add crossOrigin attributes
 * and convert external images to data URLs when possible
 */
function processImagesForCrossOrigin(element: HTMLElement): void {
    // Find all images in the element
    const images = element.querySelectorAll('img');

    // Add crossOrigin attribute to each image
    images.forEach(img => {
        if (img.src && !img.hasAttribute('crossorigin')) {
            img.setAttribute('crossorigin', 'anonymous');

            // For images that are already loaded, we can try to convert to data URL
            if (img.complete && img.naturalHeight !== 0) {
                try {
                    convertImgToDataURL(img);
                } catch (e) {
                    console.warn('Could not convert image to data URL:', e);
                }
            }
        }
    });

    // Also process background images in style attributes
    processInlineBackgroundImages(element);
}

/**
 * Convert an img element's src to a data URL if possible
 */
function convertImgToDataURL(img: HTMLImageElement): void {
    try {
        // Create a temporary canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Draw the image to the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0);
            // Convert to data URL
            const dataURL = canvas.toDataURL('image/png');
            // Set the data URL as the src
            img.src = dataURL;
        }
    } catch (e) {
        console.warn('Failed to convert image to data URL:', e);
    }
}

/**
 * Process inline styles that might contain background images
 */
function processInlineBackgroundImages(element: HTMLElement): void {
    // This is a simplified implementation
    // For a complete solution, you would need to parse CSS and replace all background URLs
    // with data URLs or ensure they have proper CORS headers

    if (element.style && element.style.backgroundImage) {
        // Remove url() references that might cause CORS issues
        if (element.style.backgroundImage.includes('url(') &&
            !element.style.backgroundImage.includes('data:')) {
            // Set a safe solid background color instead
            element.style.backgroundColor = element.style.backgroundColor || '#ffffff';
            element.style.backgroundImage = 'none';
        }
    }

    // Process all children recursively
    Array.from(element.children).forEach(child => {
        if (child instanceof HTMLElement) {
            processInlineBackgroundImages(child);
        }
    });
}

/**
 * Converts an HTML element directly to a PNG image
 * This is a combination of htmlToSvg and svgToPng
 * 
 * @param element The HTML element to convert
 * @returns A Promise that resolves to the PNG data URL
 */
export async function htmlToPng(element: HTMLElement): Promise<string | null> {
    try {
        // Create a deep clone of the element to avoid modifying the original
        const elementClone = element.cloneNode(true) as HTMLElement;

        // Process all images in the clone to add crossOrigin attributes
        const allImages = elementClone.querySelectorAll('img');
        const imageLoadPromises: Promise<void>[] = [];

        allImages.forEach(img => {
            // Set crossOrigin on all images to prevent tainting
            img.setAttribute('crossorigin', 'anonymous');

            // Create a promise for each image to ensure it's loaded
            if (!img.complete) {
                const promise = new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => {
                        console.warn(`Failed to load image: ${img.src}`);
                        // Remove or replace problematic images
                        img.style.display = 'none';
                        resolve();
                    };
                });
                imageLoadPromises.push(promise);
            }
        });

        // Wait for all images to load (or fail)
        if (imageLoadPromises.length > 0) {
            await Promise.all(imageLoadPromises);
        }

        // Get dimensions
        const rect = element.getBoundingClientRect();

        // Create the SVG with the processed clone
        const svg = htmlToSvg(elementClone);

        // Add the SVG to the document temporarily in a hidden container
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.visibility = 'hidden';
        container.appendChild(svg);
        document.body.appendChild(container);

        // Give the browser a moment to process
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            // Convert to PNG
            const pngDataUrl = await svgToPng(svg, rect.width, rect.height);
            return pngDataUrl;
        } catch (error) {
            console.error('Error in SVG to PNG conversion:', error);
            return null;
        } finally {
            // Clean up
            document.body.removeChild(container);
        }
    } catch (error) {
        console.error('Error converting HTML to PNG:', error);
        return null;
    }
}
