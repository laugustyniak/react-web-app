// Canvas/components/LayersPanel.tsx
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy, 
  Image, 
  Type, 
  Square,
  Circle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import type { EditorElement } from '../KonvaImageEditor';

interface LayersPanelProps {
  elements: EditorElement[];
  selectedElementId: string | null;
  onElementSelect: (id: string | null) => void;
  onElementUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onElementDelete: (id: string) => void;
  onElementDuplicate: (id: string) => void;
}

export default function LayersPanel({
  elements,
  selectedElementId,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate
}: LayersPanelProps) {
  const getElementIcon = (element: EditorElement) => {
    switch (element.type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'shape':
        return element.shapeType === 'circle' 
          ? <Circle className="h-4 w-4" />
          : <Square className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  const moveLayer = (elementId: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const newZIndex = direction === 'up' ? element.zIndex + 1 : element.zIndex - 1;
    const minZ = Math.min(...elements.map(el => el.zIndex));
    const maxZ = Math.max(...elements.map(el => el.zIndex));

    if ((direction === 'up' && element.zIndex < maxZ) || 
        (direction === 'down' && element.zIndex > minZ)) {
      // Find element to swap with
      const targetElement = elements.find(el => el.zIndex === newZIndex);
      if (targetElement) {
        onElementUpdate(targetElement.id, { zIndex: element.zIndex });
      }
      onElementUpdate(elementId, { zIndex: newZIndex });
    }
  };

  // Sort elements by zIndex (reverse for layer panel display)
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  if (elements.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium mb-2">Layers</h3>
        <div className="text-xs text-muted-foreground text-center py-4">
          No layers yet. Add some elements to get started.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Layers ({elements.length})</h3>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {sortedElements.map((element) => (
          <div
            key={element.id}
            className={`p-2 rounded border cursor-pointer transition-colors ${
              selectedElementId === element.id
                ? 'bg-primary/10 border-primary'
                : 'bg-background border-border hover:bg-muted'
            }`}
            onClick={() => onElementSelect(element.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getElementIcon(element)}
                <Input
                  value={element.name}
                  onChange={(e) => onElementUpdate(element.id, { name: e.target.value })}
                  className="h-6 text-xs border-none bg-transparent p-0 focus-visible:ring-0"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onElementUpdate(element.id, { visible: !element.visible });
                  }}
                >
                  {element.visible ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(element.id, 'up');
                  }}
                  disabled={element.zIndex === Math.max(...elements.map(el => el.zIndex))}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(element.id, 'down');
                  }}
                  disabled={element.zIndex === Math.min(...elements.map(el => el.zIndex))}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onElementDuplicate(element.id);
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onElementDelete(element.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Opacity slider */}
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Opacity:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.opacity}
                  onChange={(e) => onElementUpdate(element.id, { opacity: parseFloat(e.target.value) })}
                  className="flex-1 h-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs text-muted-foreground w-8">
                  {Math.round(element.opacity * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
