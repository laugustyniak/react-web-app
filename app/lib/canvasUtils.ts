import html2canvas from 'html2canvas';

/**
 * Creates a temporary container and returns an image of the element
 * while preserving CSS styles including oklch colors.
 */
export async function captureElementAsImage(
    element: HTMLElement
): Promise<string | null> {
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
                        cssRules += rule.cssText + '\n';
                    });
                }
            } catch (e) {
                // Skip cross-origin stylesheets that can't be accessed
                console.log('Could not access stylesheet', e);
            }
        });

        styleSheet.textContent = cssRules;
        document.head.appendChild(styleSheet);

        // Use html2canvas with proper settings
        const canvas = await html2canvas(clone, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            imageTimeout: 0,
            onclone: (doc) => {
                // Copy over class attributes to maintain styling
                const sourceElement = doc.querySelector('.dark');
                if (sourceElement) {
                    // If the document has a 'dark' class somewhere, copy it to the cloned document
                    doc.documentElement.classList.add('dark');
                }
            },
        });

        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error capturing element as image:', error);
        return null;
    } finally {
        // Clean up
        document.body.removeChild(tempContainer);
        // Find and remove the style element we added
        const styleElements = document.head.querySelectorAll('style');
        Array.from(styleElements).slice(-1).forEach(el => {
            document.head.removeChild(el);
        });
    }
}

/**
 * Recursively replaces all oklch colors in style attributes
 * Note: This function is kept for reference but is no longer used
 * in the updated captureElementAsImage implementation
 */
function replaceColorFormats(element: HTMLElement) {
    if (element instanceof HTMLElement) {
        const style = element.getAttribute('style');
        if (style) {
            // Replace all color function instances with safe colors
            const newStyle = style
                .replace(/oklch\([^)]+\)/g, '#000000')
                .replace(/color:\s*oklch\([^;]+/g, 'color: #000000')
                .replace(/background(?:-color)?:\s*oklch\([^;]+/g, 'background-color: #ffffff');

            element.setAttribute('style', newStyle);
        }

        // Process all children recursively
        Array.from(element.children).forEach(child => {
            if (child instanceof HTMLElement) {
                replaceColorFormats(child);
            }
        });
    }
}
