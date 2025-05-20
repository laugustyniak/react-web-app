// konva-esm-patch.ts - Vite plugin to handle Konva ESM issues
import type { Plugin } from 'vite';

export default function konvaEsmPatchPlugin(): Plugin {
    return {
        name: 'konva-esm-patch',

        // Intercept imports to Konva modules
        resolveId(source: string): string | null {
            // Only handle specific problematic Konva paths
            if (source.includes('konva/lib/Core.js') || source.includes('konva/lib/Global.js')) {
                console.log(`Intercepted Konva import: ${source}`);
                // Return a special ID that we'll handle in the load hook
                return `\0virtual:${source}`;
            }
            return null;
        },

        // Generate content for the intercepted modules
        load(id: string): string | null {
            if (id.startsWith('\0virtual:konva/lib/')) {
                console.log(`Providing virtual module for: ${id}`);

                // For Core.js
                if (id.includes('Core.js')) {
                    return `
            // Stub for Konva Core.js
            export default {
              // Basic Konva stubs
              Stage: class Stage {},
              Layer: class Layer {},
              Image: class Image {},
              Rect: class Rect {},
              Circle: class Circle {},
              Group: class Group {},
              // Add other needed classes...
              
              // Stubs for methods that might be called
              isDragging: () => false,
              DD: { isDragging: () => false }
            };
          `;
                }

                // For Global.js
                if (id.includes('Global.js')) {
                    return `
            // Stub for Konva Global.js
            export const Konva = {
              _isUnminified: true,
              isBrowser: true,
              _parseUA: () => ({}),
              // Add other global properties...
            };
          `;
                }
            }
            return null;
        }
    };
}
