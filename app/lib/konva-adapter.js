// app/lib/konva-adapter.js
// This adapter module provides a clean interface to Konva and React-Konva
// while handling the ES Module/CommonJS compatibility issues

// Import from main package directly
import { 
  Stage, 
  Layer, 
  Rect, 
  Circle, 
  Line, 
  Text, 
  Image, 
  Group, 
  Shape, 
  Label, 
  Tag, 
  Path,
  Transformer,
  Arrow,
  Star,
  Ring,
  Wedge,
  Ellipse
} from 'react-konva';

// Import Konva dynamically to avoid ESM issues
let Konva = null;
try {
  import('konva').then(k => {
    Konva = k.default || k;
  });
} catch (e) {
  console.error('Error importing Konva:', e);
}

// Export all components
export {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Text,
  Image,
  Group,
  Shape,
  Label,
  Tag,
  Path,
  Transformer,
  Arrow,
  Star,
  Ring,
  Wedge,
  Ellipse,
  Konva // Export Konva itself if needed
};
