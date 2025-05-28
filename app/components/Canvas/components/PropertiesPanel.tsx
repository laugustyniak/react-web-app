// Canvas/components/PropertiesPanel.tsx
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { RotateCw, RotateCcw } from 'lucide-react';
import type { EditorElement, EditorText, EditorShape } from '../KonvaImageEditor';

interface PropertiesPanelProps {
  selectedElement: EditorElement | undefined;
  onElementUpdate: (id: string, updates: Partial<EditorElement>) => void;
  textProperties: {
    fontSize: number;
    fontFamily: string;
    fill: string;
  };
  onTextPropertiesChange: (properties: { fontSize: number; fontFamily: string; fill: string }) => void;
  shapeProperties: {
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
  onShapePropertiesChange: (properties: { fill: string; stroke: string; strokeWidth: number }) => void;
  canvasSize: { width: number; height: number };
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
}

export default function PropertiesPanel({
  selectedElement,
  onElementUpdate,
  textProperties,
  onTextPropertiesChange,
  shapeProperties,
  onShapePropertiesChange,
  canvasSize,
  onCanvasSizeChange
}: PropertiesPanelProps) {
  const handleInputChange = (field: string, value: number | string) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, { [field]: value });
    }
  };

  const rotateElement = (degrees: number) => {
    if (selectedElement) {
      const newRotation = selectedElement.rotation + degrees;
      onElementUpdate(selectedElement.id, { rotation: newRotation });
    }
  };

  return (
    <div className="space-y-6">
      {/* Canvas Properties */}
      <div>
        <h3 className="text-sm font-medium mb-3">Canvas</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="canvas-width" className="text-xs">Width</Label>
              <Input
                id="canvas-width"
                type="number"
                value={canvasSize.width}
                onChange={(e) => onCanvasSizeChange({ ...canvasSize, width: parseInt(e.target.value) || 800 })}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="canvas-height" className="text-xs">Height</Label>
              <Input
                id="canvas-height"
                type="number"
                value={canvasSize.height}
                onChange={(e) => onCanvasSizeChange({ ...canvasSize, height: parseInt(e.target.value) || 600 })}
                className="h-8"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCanvasSizeChange({ width: 800, height: 600 })}
              className="flex-1"
            >
              4:3
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCanvasSizeChange({ width: 1200, height: 675 })}
              className="flex-1"
            >
              16:9
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCanvasSizeChange({ width: 800, height: 800 })}
              className="flex-1"
            >
              1:1
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Default Text Properties */}
      <div>
        <h3 className="text-sm font-medium mb-3">Default Text Style</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="default-font-size" className="text-xs">Font Size</Label>
            <Input
              id="default-font-size"
              type="number"
              value={textProperties.fontSize}
              onChange={(e) => onTextPropertiesChange({ 
                ...textProperties, 
                fontSize: parseInt(e.target.value) || 24 
              })}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="default-font-family" className="text-xs">Font Family</Label>
            <select
              id="default-font-family"
              value={textProperties.fontFamily}
              onChange={(e) => onTextPropertiesChange({ 
                ...textProperties, 
                fontFamily: e.target.value 
              })}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
              <option value="Impact">Impact</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
            </select>
          </div>
          <div>
            <Label htmlFor="default-text-color" className="text-xs">Color</Label>
            <div className="flex gap-2">
              <Input
                id="default-text-color"
                type="color"
                value={textProperties.fill}
                onChange={(e) => onTextPropertiesChange({ 
                  ...textProperties, 
                  fill: e.target.value 
                })}
                className="h-8 w-16"
              />
              <Input
                type="text"
                value={textProperties.fill}
                onChange={(e) => onTextPropertiesChange({ 
                  ...textProperties, 
                  fill: e.target.value 
                })}
                className="h-8 flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Default Shape Properties */}
      <div>
        <h3 className="text-sm font-medium mb-3">Default Shape Style</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="default-shape-fill" className="text-xs">Fill Color</Label>
            <div className="flex gap-2">
              <Input
                id="default-shape-fill"
                type="color"
                value={shapeProperties.fill}
                onChange={(e) => onShapePropertiesChange({ 
                  ...shapeProperties, 
                  fill: e.target.value 
                })}
                className="h-8 w-16"
              />
              <Input
                type="text"
                value={shapeProperties.fill}
                onChange={(e) => onShapePropertiesChange({ 
                  ...shapeProperties, 
                  fill: e.target.value 
                })}
                className="h-8 flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="default-shape-stroke" className="text-xs">Stroke Color</Label>
            <div className="flex gap-2">
              <Input
                id="default-shape-stroke"
                type="color"
                value={shapeProperties.stroke}
                onChange={(e) => onShapePropertiesChange({ 
                  ...shapeProperties, 
                  stroke: e.target.value 
                })}
                className="h-8 w-16"
              />
              <Input
                type="text"
                value={shapeProperties.stroke}
                onChange={(e) => onShapePropertiesChange({ 
                  ...shapeProperties, 
                  stroke: e.target.value 
                })}
                className="h-8 flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="default-stroke-width" className="text-xs">Stroke Width</Label>
            <Input
              id="default-stroke-width"
              type="number"
              value={shapeProperties.strokeWidth}
              onChange={(e) => onShapePropertiesChange({ 
                ...shapeProperties, 
                strokeWidth: parseInt(e.target.value) || 2 
              })}
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Selected Element Properties */}
      {selectedElement && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-3">Selected Element</h3>
            <div className="space-y-3">
              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="element-x" className="text-xs">X</Label>
                  <Input
                    id="element-x"
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => handleInputChange('x', parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="element-y" className="text-xs">Y</Label>
                  <Input
                    id="element-y"
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => handleInputChange('y', parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
              </div>

              {/* Size (for images and shapes) */}
              {(selectedElement.type === 'image' || selectedElement.type === 'shape') && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="element-width" className="text-xs">Width</Label>
                    <Input
                      id="element-width"
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 1)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="element-height" className="text-xs">Height</Label>
                    <Input
                      id="element-height"
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 1)}
                      className="h-8"
                    />
                  </div>
                </div>
              )}

              {/* Rotation */}
              <div>
                <Label className="text-xs">Rotation</Label>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateElement(-90)}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={Math.round(selectedElement.rotation)}
                    onChange={(e) => handleInputChange('rotation', parseInt(e.target.value) || 0)}
                    className="h-8 flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateElement(90)}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Text-specific properties */}
              {selectedElement.type === 'text' && (
                <>
                  <div>
                    <Label htmlFor="text-content" className="text-xs">Text</Label>
                    <Input
                      id="text-content"
                      value={(selectedElement as EditorText).text}
                      onChange={(e) => handleInputChange('text', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="text-font-size" className="text-xs">Font Size</Label>
                    <Input
                      id="text-font-size"
                      type="number"
                      value={(selectedElement as EditorText).fontSize}
                      onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value) || 12)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="text-color" className="text-xs">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={(selectedElement as EditorText).fill}
                        onChange={(e) => handleInputChange('fill', e.target.value)}
                        className="h-8 w-16"
                      />
                      <Input
                        type="text"
                        value={(selectedElement as EditorText).fill}
                        onChange={(e) => handleInputChange('fill', e.target.value)}
                        className="h-8 flex-1"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Shape-specific properties */}
              {selectedElement.type === 'shape' && (
                <>
                  <div>
                    <Label htmlFor="shape-fill" className="text-xs">Fill Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="shape-fill"
                        type="color"
                        value={(selectedElement as EditorShape).fill}
                        onChange={(e) => handleInputChange('fill', e.target.value)}
                        className="h-8 w-16"
                      />
                      <Input
                        type="text"
                        value={(selectedElement as EditorShape).fill}
                        onChange={(e) => handleInputChange('fill', e.target.value)}
                        className="h-8 flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="shape-stroke" className="text-xs">Stroke Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="shape-stroke"
                        type="color"
                        value={(selectedElement as EditorShape).stroke}
                        onChange={(e) => handleInputChange('stroke', e.target.value)}
                        className="h-8 w-16"
                      />
                      <Input
                        type="text"
                        value={(selectedElement as EditorShape).stroke}
                        onChange={(e) => handleInputChange('stroke', e.target.value)}
                        className="h-8 flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="shape-stroke-width" className="text-xs">Stroke Width</Label>
                    <Input
                      id="shape-stroke-width"
                      type="number"
                      value={(selectedElement as EditorShape).strokeWidth}
                      onChange={(e) => handleInputChange('strokeWidth', parseInt(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
