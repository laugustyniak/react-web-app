// Initialize browser environment for Konva in the browser
import Canvas from './konva-browser-shim';

// Make the canvas module available globally for Konva
if (typeof window !== 'undefined') {
    // @ts-ignore - Add canvas module to global scope for Konva to use
    window.canvas = Canvas;
}

export default Canvas;
