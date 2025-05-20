// konva-init-module.js
// This module initializes Konva in a browser-compatible way for SSR and ES Modules

// We'll store the Konva module globally once loaded
let KonvaModule = null;

// Promise-based loader to ensure Konva is available when needed
export const loadKonva = async () => {
  if (KonvaModule) return KonvaModule;
  
  try {
    // Dynamic import to avoid SSR issues and CommonJS/ESM conflicts
    const module = await import('konva');
    KonvaModule = module.default || module;
    return KonvaModule;
  } catch (error) {
    console.error('Failed to load Konva:', error);
    throw error;
  }
};

// For synchronous access when we know Konva is already loaded
export const getKonva = () => KonvaModule;

// Initialize right away
loadKonva().catch(console.error);

export default { loadKonva, getKonva };
