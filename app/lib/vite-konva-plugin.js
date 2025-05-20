// app/lib/vite-konva-plugin.js
// This is a Vite plugin to handle Konva's ES Module/CommonJS compatibility issues

/**
 * Creates a Vite plugin that handles Konva ES Module compatibility issues
 * @returns {import('vite').Plugin}
 */
export function konvaESMCompatPlugin() {
  return {
    name: 'vite-plugin-konva-compat',
    
    // Transform CommonJS requires of ES modules to dynamic imports
    transform(code, id) {
      // Only process react-konva and konva files
      if (id.includes('react-konva') || id.includes('konva/lib')) {
        // Replace requires of konva with dynamic imports
        if (code.includes('require("konva")') || code.includes("require('konva')")) {
          console.log(`[konvaESMCompatPlugin] Transforming requires in ${id}`);
          
          // Convert require('konva') to dynamic import
          code = code.replace(
            /const\s+(\w+)\s*=\s*(?:__importDefault\()?\s*require\(['"]konva['"]\)(?:\))?/g,
            `let $1 = { default: {} };
            import('konva').then(m => { $1 = { default: m.default || m }; }).catch(e => console.error('Error loading Konva:', e))`
          );
          
          // Convert require('konva/lib/X') to dynamic import
          code = code.replace(
            /const\s+(\w+)\s*=\s*(?:__importDefault\()?\s*require\(['"]konva\/lib\/([^'"]+)['"]\)(?:\))?/g,
            `let $1 = { default: {} };
            import('konva/lib/$2').then(m => { $1 = { default: m.default || m }; }).catch(e => console.error('Error loading Konva module:', e))`
          );
        }
      }
      return code;
    }
  };
}
