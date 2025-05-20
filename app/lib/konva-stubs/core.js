// Stub for Konva Core.js
export default {
  // Core classes
  Stage: class Stage {
    constructor() {}
    add() { return this; }
    getStage() { return this; }
    getLayer() { return { batchDraw: () => {} }; }
  },
  Layer: class Layer {
    constructor() {}
    add() { return this; }
    batchDraw() {}
  },
  Image: class Image {
    constructor() {}
    x() { return 0; }
    y() { return 0; }
    width() { return 0; }
    height() { return 0; }
    scaleX() { return 1; }
    scaleY() { return 1; }
    rotation() { return 0; }
  },
  Rect: class Rect {},
  Circle: class Circle {},
  Group: class Group {},
  
  // Common utilities
  isDragging: () => false,
  DD: { 
    isDragging: () => false,
    get node() { return null; }
  }
};
