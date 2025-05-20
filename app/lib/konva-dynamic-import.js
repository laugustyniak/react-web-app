// app/lib/konva-dynamic-import.js
// Using dynamic import for browser compatibility
let Konva;

// Try to dynamically import Konva as an ES module
try {
  // This will work in modern browsers and we'll wait for the module to load
  const importKonva = async () => {
    const module = await import('konva');
    Konva = module.default || module;
    return Konva;
  };
  
  // Start loading immediately
  importKonva();
} catch (e) {
  console.error('Error importing Konva:', e);
}

// Export the Konva object
export default Konva;
