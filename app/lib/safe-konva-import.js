// safe-konva-import.js
// This file provides a safe way to import Konva components
// while avoiding the ES Module errors

// Flag to determine if Konva is available and working
let konvaAvailable = false;

// Components to export
let Stage, Layer, Image, Transformer;

// Try to import Konva components
try {
  // Use a dynamic import to avoid static analysis issues
  const dynamicImport = async () => {
    try {
      const reactKonva = await import('react-konva');
      Stage = reactKonva.Stage;
      Layer = reactKonva.Layer;
      Image = reactKonva.Image;
      Transformer = reactKonva.Transformer;
      
      // Mark Konva as available if we got here without errors
      konvaAvailable = true;
      
      console.log("Successfully loaded react-konva components");
      return true;
    } catch (error) {
      console.error("Failed to load react-konva:", error);
      return false;
    }
  };
  
  // Start the import process (but don't wait)
  dynamicImport();
} catch (error) {
  console.error("Error importing Konva components:", error);
}

// Fallback components (stubs) that render nothing
const FallbackComponent = ({ children }) => {
  console.warn("Using fallback Konva component - Konva failed to load");
  return null;
};

// Export the components or their fallbacks
export { 
  Stage: konvaAvailable ? Stage : FallbackComponent,
  Layer: konvaAvailable ? Layer : FallbackComponent,
  Image: konvaAvailable ? Image : FallbackComponent,
  Transformer: konvaAvailable ? Transformer : FallbackComponent,
  konvaAvailable
};
