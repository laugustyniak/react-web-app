import html2canvas from 'html2canvas';

/**
 * Creates a temporary container and returns an image of the element
 * while handling incompatible oklch colors.
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
        // Add stylesheet to override problematic colors
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
      [style*="oklch"] { color: #000000 !important; background-color: #ffffff !important; }
      .dark [style*="oklch"] { color: #ffffff !important; background-color: #000000 !important; }
    `;
        document.head.appendChild(styleSheet);

        // Replace all oklch colors in the clone
        replaceColorFormats(clone);

        // Use html2canvas with additional handling for oklch
        const canvas = await html2canvas(clone, {
            backgroundColor: null,
            scale: 2,
            onclone: (doc) => {
                const additionalStyle = doc.createElement('style');
                additionalStyle.textContent = `
          * {
            color-scheme: light !important;
          }
          [style*="oklch"] { 
            color: #000000 !important; 
            background-color: #ffffff !important;
          }
        `;
                doc.head.appendChild(additionalStyle);
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
        styleElements.forEach(el => {
            if (el.textContent?.includes('oklch')) {
                document.head.removeChild(el);
            }
        });
    }
}

/**
 * Recursively replaces all oklch colors in style attributes
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
