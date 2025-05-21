/**
 * Color utility functions for converting between color spaces.
 * This helps solve compatibility issues with html2canvas which doesn't support modern CSS color formats like oklch.
 */

// Simple mapping of common oklch colors to RGB for fast lookups
const commonOklchColors: Record<string, string> = {
    'oklch(0.961151 0 0)': 'rgb(255, 255, 255)',             // white
    'oklch(0 0 0)': 'rgb(0, 0, 0)',                          // black
    'oklch(0.278 0.191 256.8)': 'rgb(0, 0, 255)',            // blue
    'oklch(0.628 0.266 29.2)': 'rgb(255, 0, 0)',             // red
    'oklch(0.863 0.185 134.5)': 'rgb(0, 255, 0)',            // green
};

/**
 * Approximates the conversion from oklch() to RGB.
 * For complex scientific conversion see: https://bottosson.github.io/posts/oklab/
 * 
 * This is a simplified approach for html2canvas compatibility.
 * 
 * @param oklchStr - The oklch color string, e.g., "oklch(0.6 0.2 30)"
 * @returns An RGB color string
 */
export function oklchToRGB(oklchStr: string): string {
    // First check if it's a common color we already know
    if (commonOklchColors[oklchStr]) {
        return commonOklchColors[oklchStr];
    }

    try {
        // Extract values from the oklch string
        // Format: oklch(lightness chroma hue [/ alpha])
        // Improved regex pattern to handle more formats and white space variations
        const matches = /oklch\(\s*([0-9.]+)(?:%?)\s+([0-9.]+)(?:%?)\s+([0-9.]+)(?:deg|turn|rad|grad)?(?:\s*\/\s*([0-9.]+)(?:%?))?\s*\)/i.exec(oklchStr);

        if (!matches) {
            console.warn('Failed to parse oklch color:', oklchStr);
            return 'rgb(128, 128, 128)'; // Default gray for parsing failure
        }

        const lightness = parseFloat(matches[1]);
        const chroma = parseFloat(matches[2]);
        const hue = parseFloat(matches[3]);
        const alpha = matches[4] ? parseFloat(matches[4]) : 1;

        // This is a very basic approximation
        // - Lightness maps to general brightness (0-1 → 0-255)
        // - Chroma influences saturation
        // - Hue maps to color wheel (0-360)

        // Convert hue to RGB using a simplified approach
        const hPrime = hue / 60;
        const x = chroma * (1 - Math.abs((hPrime % 2) - 1));

        let r = 0, g = 0, b = 0;

        if (hPrime >= 0 && hPrime < 1) { r = chroma; g = x; b = 0; }
        else if (hPrime >= 1 && hPrime < 2) { r = x; g = chroma; b = 0; }
        else if (hPrime >= 2 && hPrime < 3) { r = 0; g = chroma; b = x; }
        else if (hPrime >= 3 && hPrime < 4) { r = 0; g = x; b = chroma; }
        else if (hPrime >= 4 && hPrime < 5) { r = x; g = 0; b = chroma; }
        else { r = chroma; g = 0; b = x; }

        // Apply lightness adjustment and scale to 0-255
        const lightnessAdjustment = lightness * 255;
        r = Math.round(Math.max(0, Math.min(255, r * lightnessAdjustment)));
        g = Math.round(Math.max(0, Math.min(255, g * lightnessAdjustment)));
        b = Math.round(Math.max(0, Math.min(255, b * lightnessAdjustment)));

        // Return the RGB string, with optional alpha
        return alpha < 1 ?
            `rgba(${r}, ${g}, ${b}, ${alpha})` :
            `rgb(${r}, ${g}, ${b})`;
    } catch (e) {
        console.warn('Error converting oklch to RGB:', e);
        return 'rgb(128, 128, 128)'; // Fallback to gray
    }
}

/**
 * Processes a CSS style string and replaces all oklch colors with RGB equivalents
 * 
 * @param cssText The CSS text to process
 * @returns CSS text with oklch colors replaced by RGB colors
 */
export function replaceOklchWithRGB(cssText: string): string {
    if (!cssText) return cssText;

    try {
        // More robust pattern to catch different oklch formats including with variables
        return cssText.replace(/oklch\([^)]+\)/gi, (match) => {
            // If the oklch contains CSS variables, replace with a fallback color
            if (match.includes('var(') || match.includes('--')) {
                return 'rgb(128, 128, 128)'; // Default gray for variable-based colors
            }
            return oklchToRGB(match);
        });
    } catch (e) {
        console.warn('Error replacing oklch colors:', e);
        return cssText; // Return original if replacement fails
    }
}
