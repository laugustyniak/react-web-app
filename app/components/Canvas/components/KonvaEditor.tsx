// Canvas/components/KonvaEditor.tsx
import { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Stage, 
  Layer, 
  Image as KonvaImage, 
  Text as KonvaText,
  Rect as KonvaRect,
  Circle as KonvaCircle,
  Transformer,
} from '~/lib/react-konva-wrapper';
import useImage from 'use-image';
import type { EditorElement, EditorImage, EditorText, EditorShape } from '../KonvaImageEditor';
import type Konva from 'konva';

interface KonvaEditorProps {
  width: number;
  height: number;
  elements: EditorElement[];
  selectedElementId: string | null;
  onElementSelect: (id: string | null) => void;
  onElementUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onStageRef: (ref: Konva.Stage | null) => void;
  currentTool: 'select' | 'text' | 'rectangle' | 'circle';
  onElementAdd: (element: EditorElement) => void;
  textProperties: {
    fontSize: number;
    fontFamily: string;
    fill: string;
  };
  shapeProperties: {
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
}

// Image component
const EditableImage = ({ 
  element, 
  isSelected, 
  onSelect, 
  onChange 
}: { 
  element: EditorImage; 
  isSelected: boolean; 
  onSelect: () => void; 
  onChange: (updates: Partial<EditorElement>) => void;
}) => {
  const [img] = useImage(element.src);
  const imageRef = useRef<Konva.Image>(null);

  return (
    <KonvaImage
      ref={imageRef}
      image={img}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      scaleX={element.scaleX}
      scaleY={element.scaleY}
      opacity={element.opacity}
      visible={element.visible}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        // Reset scale and apply to width/height
        node.scaleX(1);
        node.scaleY(1);
        
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, (element.width || 100) * scaleX),
          height: Math.max(5, (element.height || 100) * scaleY),
          rotation: node.rotation()
        });
      }}
    />
  );
};

// Text component
const EditableText = ({ 
  element, 
  isSelected, 
  onSelect, 
  onChange 
}: { 
  element: EditorText; 
  isSelected: boolean; 
  onSelect: () => void; 
  onChange: (updates: Partial<EditorElement>) => void;
}) => {
  const textRef = useRef<Konva.Text>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
    // Create text input for editing
    if (textRef.current) {
      const textPosition = textRef.current.absolutePosition();
      const stage = textRef.current.getStage();
      const stageBox = stage?.container().getBoundingClientRect();
      
      if (stageBox) {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        
        textarea.value = element.text;
        textarea.style.position = 'absolute';
        textarea.style.top = (stageBox.top + textPosition.y) + 'px';
        textarea.style.left = (stageBox.left + textPosition.x) + 'px';
        textarea.style.width = (element.fontSize * element.text.length * 0.6) + 'px';
        textarea.style.height = (element.fontSize * 1.2) + 'px';
        textarea.style.fontSize = element.fontSize + 'px';
        textarea.style.fontFamily = element.fontFamily;
        textarea.style.border = '2px solid blue';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.background = 'white';
        textarea.style.color = element.fill;
        textarea.style.resize = 'none';
        textarea.style.outline = 'none';
        textarea.style.zIndex = '1000';
        
        textarea.focus();
        textarea.select();
        
        const handleBlur = () => {
          onChange({ text: textarea.value });
          document.body.removeChild(textarea);
          setIsEditing(false);
        };
        
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
          }
          if (e.key === 'Escape') {
            document.body.removeChild(textarea);
            setIsEditing(false);
          }
        };
        
        textarea.addEventListener('blur', handleBlur);
        textarea.addEventListener('keydown', handleKeyDown);
      }
    }
  };

  return (
    <KonvaText
      ref={textRef}
      text={element.text}
      x={element.x}
      y={element.y}
      fontSize={element.fontSize}
      fontFamily={element.fontFamily}
      fill={element.fill}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        // Reset scale and apply to font size
        node.scaleX(1);
        node.scaleY(1);
        
        onChange({
          x: node.x(),
          y: node.y(),
          fontSize: Math.max(8, element.fontSize * Math.max(scaleX, scaleY)),
          rotation: node.rotation()
        });
      }}
    />
  );
};

// Shape component
const EditableShape = ({ 
  element, 
  isSelected, 
  onSelect, 
  onChange 
}: { 
  element: EditorShape; 
  isSelected: boolean; 
  onSelect: () => void; 
  onChange: (updates: Partial<EditorElement>) => void;
}) => {
  const shapeRef = useRef<Konva.Shape>(null);

  const ShapeComponent = element.shapeType === 'circle' ? KonvaCircle : KonvaRect;
  const shapeProps = element.shapeType === 'circle' 
    ? { radius: Math.min(element.width, element.height) / 2 }
    : { width: element.width, height: element.height };

  return (
    <ShapeComponent
      ref={shapeRef}
      x={element.x}
      y={element.y}
      {...shapeProps}
      fill={element.fill}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        // Reset scale and apply to width/height
        node.scaleX(1);
        node.scaleY(1);
        
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, (element.width || 100) * scaleX),
          height: Math.max(5, (element.height || 100) * scaleY),
          rotation: node.rotation()
        });
      }}
    />
  );
};

export default function KonvaEditor({
  width,
  height,
  elements,
  selectedElementId,
  onElementSelect,
  onElementUpdate,
  onStageRef,
  currentTool,
  onElementAdd,
  textProperties,
  shapeProperties
}: KonvaEditorProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Set stage ref for parent component
  useEffect(() => {
    onStageRef(stageRef.current);
  }, [onStageRef]);

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current) {
      const selectedNode = stageRef.current?.findOne(`#${selectedElementId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedElementId]);

  // Handle stage click for tool-based creation
  const handleStageClick = useCallback((e: any) => {
    // If clicked on empty area, deselect
    if (e.target === e.target.getStage()) {
      onElementSelect(null);
      
      // Handle tool-based creation
      const pos = e.target.getPointerPosition();
      if (pos && currentTool !== 'select') {
        switch (currentTool) {
          case 'text':
            const newText: EditorText = {
              id: `text_${Date.now()}`,
              text: 'Click to edit',
              x: pos.x,
              y: pos.y,
              fontSize: textProperties.fontSize,
              fontFamily: textProperties.fontFamily,
              fill: textProperties.fill,
              rotation: 0,
              opacity: 1,
              visible: true,
              name: 'Text Layer',
              type: 'text',
              zIndex: elements.length
            };
            onElementAdd(newText);
            break;
            
          case 'rectangle':
            const newRect: EditorShape = {
              id: `rect_${Date.now()}`,
              shapeType: 'rectangle',
              x: pos.x,
              y: pos.y,
              width: 100,
              height: 100,
              fill: shapeProperties.fill,
              stroke: shapeProperties.stroke,
              strokeWidth: shapeProperties.strokeWidth,
              rotation: 0,
              opacity: 1,
              visible: true,
              name: 'Rectangle',
              type: 'shape',
              zIndex: elements.length
            };
            onElementAdd(newRect);
            break;
            
          case 'circle':
            const newCircle: EditorShape = {
              id: `circle_${Date.now()}`,
              shapeType: 'circle',
              x: pos.x,
              y: pos.y,
              width: 100,
              height: 100,
              fill: shapeProperties.fill,
              stroke: shapeProperties.stroke,
              strokeWidth: shapeProperties.strokeWidth,
              rotation: 0,
              opacity: 1,
              visible: true,
              name: 'Circle',
              type: 'shape',
              zIndex: elements.length
            };
            onElementAdd(newCircle);
            break;
        }
      }
    }
  }, [currentTool, onElementSelect, onElementAdd, textProperties, shapeProperties, elements.length]);

  // Sort elements by zIndex
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="border border-gray-300 bg-white shadow-lg">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {/* Render all elements */}
          {sortedElements.map((element) => {
            const isSelected = element.id === selectedElementId;
            const handleSelect = () => onElementSelect(element.id);
            const handleUpdate = (updates: Partial<EditorElement>) => 
              onElementUpdate(element.id, updates);

            if (element.type === 'image') {
              return (
                <EditableImage
                  key={element.id}
                  element={element as EditorImage}
                  isSelected={isSelected}
                  onSelect={handleSelect}
                  onChange={handleUpdate}
                />
              );
            } else if (element.type === 'text') {
              return (
                <EditableText
                  key={element.id}
                  element={element as EditorText}
                  isSelected={isSelected}
                  onSelect={handleSelect}
                  onChange={handleUpdate}
                />
              );
            } else if (element.type === 'shape') {
              return (
                <EditableShape
                  key={element.id}
                  element={element as EditorShape}
                  isSelected={isSelected}
                  onSelect={handleSelect}
                  onChange={handleUpdate}
                />
              );
            }
            return null;
          })}
          
          {/* Transformer for selected element */}
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            borderEnabled={true}
            anchorSize={8}
            anchorStroke="#4F46E5"
            anchorFill="white"
            anchorCornerRadius={4}
            borderStroke="#4F46E5"
            borderStrokeWidth={2}
            boundBoxFunc={(oldBox, newBox) => {
              // Minimum size constraints
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
