// app/lib/react-konva-wrapper.js
// Using our adapter module to handle ES Module compatibility issues
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
  Path 
} from './konva-adapter.js';

// Export all the components without directly requiring the core module
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
  Path
};

// Add any additional components you're using here
