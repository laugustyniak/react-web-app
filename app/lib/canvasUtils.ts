import html2canvas from 'html2canvas';
import { replaceOklchWithRGB, oklchToRGB } from './colorUtils';

/**
 * Creates a temporary container and returns an image of the element
 * while preserving CSS styles including oklch colors.
 */
export async function captureElementAsImage(
    element: HTMLElement
): Promise<string | null> {
    if (!element) {
        console.error('Error capturing element as image: Element is null or undefined');
        return null;
    }

    // Create a temporary container to clone into
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    tempContainer.appendChild(clone);

    try {
        // Get all stylesheets from the document
        const styles = Array.from(document.styleSheets);
        const styleSheet = document.createElement('style');

        // Extract and apply all CSS rules to ensure styles are properly captured
        let cssRules = '';
        styles.forEach(sheet => {
            try {
                // Only process same-origin stylesheets
                if (sheet.href === null || sheet.href.startsWith(window.location.origin)) {
                    Array.from(sheet.cssRules).forEach(rule => {
                        try {
                            // Process the rule text to replace oklch colors with RGB
                            let processedRule = replaceOklchWithRGB(rule.cssText);
                            cssRules += processedRule + '\n';
                        } catch (ruleError) {
                            console.warn('Error processing CSS rule:', ruleError);
                        }
                    });
                }
            } catch (e) {
                // Skip cross-origin stylesheets that can't be accessed
                console.log('Could not access stylesheet', e);
            }
        });

        styleSheet.textContent = cssRules;
        document.head.appendChild(styleSheet);

        // Also process inline styles of the cloned element and its children
        processInlineStyles(clone);

        // Use html2canvas with proper settings
        const canvas = await html2canvas(clone, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            imageTimeout: 0,
            onclone: (doc) => {
                try {
                    // Copy over class attributes to maintain styling
                    const sourceElement = doc.querySelector('.dark');
                    if (sourceElement) {
                        // If the document has a 'dark' class somewhere, copy it to the cloned document
                        doc.documentElement.classList.add('dark');
                    }
                    // Process any inline styles in the cloned document
                    processInlineStyles(doc.body);
                } catch (cloneError) {
                    console.warn('Error in onclone handler:', cloneError);
                }
            },
        });

        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error capturing element as image:', error);
        // More descriptive error for oklch issues
        if (error instanceof Error && error.message.includes('oklch')) {
            throw new Error(`Failed to convert oklch colors: ${error.message}`);
        }
        return null;
    } finally {
        // Clean up
        if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
        }
        // Find and remove the style element we added
        const styleElements = document.head.querySelectorAll('style');
        Array.from(styleElements).slice(-1).forEach(el => {
            if (document.head.contains(el)) {
                document.head.removeChild(el);
            }
        });
    }
}

/**
 * Recursively processes inline styles to replace unsupported color formats
 */
function processInlineStyles(element: HTMLElement) {
    if (!element || !(element instanceof HTMLElement)) {
        return;
    }

    try {
        const style = element.getAttribute('style');
        if (style) {
            // Replace all oklch color instances with RGB equivalents
            const newStyle = replaceOklchWithRGB(style);
            element.setAttribute('style', newStyle);
        }

        // Process all children recursively
        Array.from(element.children).forEach(child => {
            if (child instanceof HTMLElement) {
                processInlineStyles(child);
            }
        });
    } catch (error) {
        console.warn('Error processing inline styles:', error);
    }
}
