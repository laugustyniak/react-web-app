// This file creates a browser-compatible shim for konva and react-konva
// to handle the Node.js canvas requirements

// Create a browser environment module that simulates the Node.js canvas module
if (typeof window !== 'undefined') {
    // Define a global canvas mock for browser environments
    window.HTMLCanvasElement.prototype.getContext = (function (originalGetContext) {
        return function (type) {
            const context = originalGetContext.apply(this, arguments);
            if (type === '2d' && !context.resetTransform) {
                context.resetTransform = function () {
                    this.setTransform(1, 0, 0, 1, 0, 0);
                };
            }
            return context;
        };
    })(window.HTMLCanvasElement.prototype.getContext);
}

// Export a fake canvas module
const Canvas = {
    createCanvas: (width, height) => {
        if (typeof document !== 'undefined') {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            return canvas;
        }
        return null;
    },
    // Add other necessary canvas APIs here
};

export default Canvas;
