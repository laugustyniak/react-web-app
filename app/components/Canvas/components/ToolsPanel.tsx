// Canvas/components/ToolsPanel.tsx
import { Button } from '~/components/ui/button';
import { 
  MousePointer, 
  Type, 
  Square, 
  Circle, 
  Upload, 
  ShoppingBag 
} from 'lucide-react';

interface ToolsPanelProps {
  currentTool: 'select' | 'text' | 'rectangle' | 'circle';
  onToolChange: (tool: 'select' | 'text' | 'rectangle' | 'circle') => void;
  onAddText: () => void;
  onAddShape: (shape: 'rectangle' | 'circle') => void;
  onUploadImage: () => void;
  onShowProducts: () => void;
}

export default function ToolsPanel({
  currentTool,
  onToolChange,
  onAddText,
  onAddShape,
  onUploadImage,
  onShowProducts
}: ToolsPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={currentTool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('select')}
            className="flex items-center justify-center"
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('text')}
            className="flex items-center justify-center"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('rectangle')}
            className="flex items-center justify-center"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('circle')}
            className="flex items-center justify-center"
          >
            <Circle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Add Elements</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddText}
            className="w-full justify-start"
          >
            <Type className="h-4 w-4 mr-2" />
            Add Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddShape('rectangle')}
            className="w-full justify-start"
          >
            <Square className="h-4 w-4 mr-2" />
            Add Rectangle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddShape('circle')}
            className="w-full justify-start"
          >
            <Circle className="h-4 w-4 mr-2" />
            Add Circle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onUploadImage}
            className="w-full justify-start"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShowProducts}
            className="w-full justify-start"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Tips:</p>
        <ul className="space-y-1">
          <li>• Click to select elements</li>
          <li>• Double-click text to edit</li>
          <li>• Drag corners to resize</li>
          <li>• Use rotation handles</li>
          <li>• Hold Shift for proportional scaling</li>
        </ul>
      </div>
    </div>
  );
}
