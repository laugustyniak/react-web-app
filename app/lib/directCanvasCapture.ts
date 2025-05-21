/**
 * Alternative methods for capturing HTML elements as images
 * These approaches are designed to work around CORS and tainted canvas issues
 */

/**
 * Captures an HTML element directly using Canvas API
 * This approach handles CORS issues by drawing directly to canvas
 * without going through the SVG foreign object approach
 * 
 * @param element The HTML element to capture
 * @returns Promise that resolves to PNG data URL or null if failed
 */
export async function captureElementDirectly(element: HTMLElement): Promise<string | null> {
    try {
        const rect = element.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Create canvas at the same size as the element
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return null;

        // First draw a white background (optional, can be removed if you want transparency)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Capture background colors and borders from CSS
        const styles = window.getComputedStyle(element);
        if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            ctx.fillStyle = styles.backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }

        // Find all visible child elements and render them individually
        // This approach will be limited but helps avoid CORS issues
        const childElements = Array.from(element.querySelectorAll('*')) as HTMLElement[];

        // First, try to render text content
        renderTextElements(ctx, element, childElements, rect.left, rect.top);

        // Then, try to render images that we can safely render
        await renderSafeImages(ctx, element, childElements, rect.left, rect.top);

        // Draw shapes based on div borders and backgrounds
        renderBoxElements(ctx, element, childElements, rect.left, rect.top);

        try {
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error('Canvas tainted despite precautions:', e);
            return null;
        }
    } catch (error) {
        console.error('Error in direct element capture:', error);
        return null;
    }
}

/**
 * Render text elements to canvas
 */
function renderTextElements(
    ctx: CanvasRenderingContext2D,
    rootElement: HTMLElement,
    elements: HTMLElement[],
    offsetLeft: number,
    offsetTop: number
): void {
    elements.forEach(el => {
        // Skip hidden elements
        const styles = window.getComputedStyle(el);
        if (styles.display === 'none' || styles.visibility === 'hidden') {
            return;
        }

        // Get position relative to the root element
        const rect = el.getBoundingClientRect();
        const x = rect.left - offsetLeft;
        const y = rect.top - offsetTop;

        // Only process text nodes without children (leaf nodes)
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE && el.children.length === 0) {
            const text = el.textContent || '';
            if (!text.trim()) return;

            // Apply text styles
            ctx.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
            ctx.fillStyle = styles.color;
            ctx.textBaseline = 'top';

            // Draw the text
            ctx.fillText(text, x, y);
        }
    });
}

/**
 * Render images that can be safely rendered without CORS issues
 */
async function renderSafeImages(
    ctx: CanvasRenderingContext2D,
    rootElement: HTMLElement,
    elements: HTMLElement[],
    offsetLeft: number,
    offsetTop: number
): Promise<void> {
    const imgElements = elements.filter(el => el.tagName === 'IMG') as HTMLImageElement[];

    // Create array to hold all image loading promises
    const imagePromises: Promise<void>[] = [];

    imgElements.forEach(img => {
        // Only process complete images or those with data URLs
        if (img.complete && img.naturalWidth > 0 || img.src.startsWith('data:')) {
            const rect = img.getBoundingClientRect();
            const x = rect.left - offsetLeft;
            const y = rect.top - offsetTop;

            try {
                // Try to directly draw the image
                ctx.drawImage(img, x, y, rect.width, rect.height);
            } catch (e) {
                console.warn('Could not draw image directly, will try with proxy:', img.src);

                // If direct drawing fails, try to proxy it through a data URL
                const promise = new Promise<void>((resolve) => {
                    // Create a new temp canvas to convert the image
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = img.naturalWidth;
                    tempCanvas.height = img.naturalHeight;

                    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
                    if (!tempCtx) {
                        resolve();
                        return;
                    }

                    // Create a new image with crossOrigin set
                    const safeImg = new Image();
                    safeImg.crossOrigin = 'anonymous';

                    safeImg.onload = () => {
                        try {
                            tempCtx.drawImage(safeImg, 0, 0);
                            const dataUrl = tempCanvas.toDataURL('image/png');

                            // Create another image from the data URL
                            const finalImg = new Image();
                            finalImg.onload = () => {
                                try {
                                    ctx.drawImage(finalImg, x, y, rect.width, rect.height);
                                } catch (err) {
                                    console.warn('Failed to draw proxy image:', err);
                                }
                                resolve();
                            };
                            finalImg.onerror = () => {
                                console.warn('Failed to load proxy image');
                                resolve();
                            };
                            finalImg.src = dataUrl;
                        } catch (err) {
                            console.warn('Failed to convert to data URL:', err);
                            resolve();
                        }
                    };

                    safeImg.onerror = () => {
                        console.warn('Failed to load image with crossOrigin');
                        resolve();
                    };

                    // Try to load with crossOrigin
                    safeImg.src = img.src;
                });

                imagePromises.push(promise);
            }
        }
    });

    // Wait for all proxy image operations to complete
    if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
    }
}

/**
 * Render box elements (divs, etc.) to canvas
 */
function renderBoxElements(
    ctx: CanvasRenderingContext2D,
    rootElement: HTMLElement,
    elements: HTMLElement[],
    offsetLeft: number,
    offsetTop: number
): void {
    elements.forEach(el => {
        // Skip hidden elements
        const styles = window.getComputedStyle(el);
        if (styles.display === 'none' || styles.visibility === 'hidden') {
            return;
        }

        // Get position relative to the root element
        const rect = el.getBoundingClientRect();
        const x = rect.left - offsetLeft;
        const y = rect.top - offsetTop;
        const width = rect.width;
        const height = rect.height;

        // Draw background if it's a color (not an image)
        if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            ctx.fillStyle = styles.backgroundColor;

            // Handle border radius
            const borderRadius = parseInt(styles.borderRadius, 10);
            if (borderRadius > 0) {
                ctx.beginPath();
                ctx.moveTo(x + borderRadius, y);
                ctx.lineTo(x + width - borderRadius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
                ctx.lineTo(x + width, y + height - borderRadius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
                ctx.lineTo(x + borderRadius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
                ctx.lineTo(x, y + borderRadius);
                ctx.quadraticCurveTo(x, y, x + borderRadius, y);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillRect(x, y, width, height);
            }
        }

        // Draw borders
        if (styles.borderWidth && parseInt(styles.borderWidth, 10) > 0 && styles.borderStyle !== 'none') {
            ctx.strokeStyle = styles.borderColor;
            ctx.lineWidth = parseInt(styles.borderWidth, 10);

            // Handle border radius for stroke
            const borderRadius = parseInt(styles.borderRadius, 10);
            if (borderRadius > 0) {
                ctx.beginPath();
                ctx.moveTo(x + borderRadius, y);
                ctx.lineTo(x + width - borderRadius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
                ctx.lineTo(x + width, y + height - borderRadius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
                ctx.lineTo(x + borderRadius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
                ctx.lineTo(x, y + borderRadius);
                ctx.quadraticCurveTo(x, y, x + borderRadius, y);
                ctx.closePath();
                ctx.stroke();
            } else {
                ctx.strokeRect(x, y, width, height);
            }
        }
    });
}
