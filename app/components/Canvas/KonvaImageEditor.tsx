// Canvas/KonvaImageEditor.tsx
import { useState, useRef, useCallback } from 'react';
import { PageLayout, ContentCard } from '~/components/ui/layout';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { 
  Upload, 
  Download, 
  RotateCw, 
  RotateCcw, 
  Trash2, 
  Copy, 
  Layers, 
  Palette,
  Move,
  Square,
  Circle,
  Type,
  Wand2,
  Save,
  Undo,
  Redo
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllProducts } from '~/lib/firestoreService';
import { usePrograms } from '~/hooks/usePrograms';
import ProductSearchPanel from '~/components/ProductSearchPanel';
import InspirationResultModal from '~/components/modals/InspirationResultModal';
import type { Product } from '~/lib/dataTypes';

// Konva components
import KonvaEditor from './components/KonvaEditor';
import LayersPanel from './components/LayersPanel';
import PropertiesPanel from './components/PropertiesPanel';
import ToolsPanel from './components/ToolsPanel';
import ColorPicker from './components/ColorPicker';

// Types
export interface EditorImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  name: string;
  type: 'image' | 'text' | 'shape';
  zIndex: number;
}

export interface EditorText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  rotation: number;
  opacity: number;
  visible: boolean;
  name: string;
  type: 'text';
  zIndex: number;
}

export interface EditorShape {
  id: string;
  shapeType: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  name: string;
  type: 'shape';
  zIndex: number;
}

export type EditorElement = EditorImage | EditorText | EditorShape;

export default function KonvaImageEditor() {
  // Canvas state
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [currentTool, setCurrentTool] = useState<'select' | 'text' | 'rectangle' | 'circle'>('select');
  const [history, setHistory] = useState<EditorElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // UI state
  const [showProductPanel, setShowProductPanel] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [generatedInspirations, setGeneratedInspirations] = useState<any[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Text properties
  const [textProperties, setTextProperties] = useState({
    fontSize: 24,
    fontFamily: 'Arial',
    fill: '#000000'
  });
  
  // Shape properties
  const [shapeProperties, setShapeProperties] = useState({
    fill: '#ff0000',
    stroke: '#000000',
    strokeWidth: 2
  });

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<any>(null);

  // Programs hook
  const { programs } = usePrograms();

  // History management
  const saveToHistory = useCallback((newElements: EditorElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setElements(previousState);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Element management
  const addElement = useCallback((element: EditorElement) => {
    const newElements = [...elements, element];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElementId(element.id);
  }, [elements, saveToHistory]);

  const updateElement = useCallback((id: string, updates: Partial<EditorElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
  }, [elements]);

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    saveToHistory(newElements);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }, [elements, selectedElementId, saveToHistory]);

  const duplicateElement = useCallback((id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const duplicated = {
        ...element,
        id: `${element.id}_copy_${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20,
        name: `${element.name} Copy`
      };
      addElement(duplicated);
    }
  }, [elements, addElement]);

  // File handling
  const handleImageUpload = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const maxWidth = 400;
            const maxHeight = 400;
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }

            const newImage: EditorImage = {
              id: `image_${Date.now()}_${Math.random()}`,
              src: e.target?.result as string,
              x: 50,
              y: 50,
              width,
              height,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
              opacity: 1,
              visible: true,
              name: file.name,
              type: 'image',
              zIndex: elements.length
            };
            addElement(newImage);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    });
  }, [addElement, elements.length]);

  const handleProductSelect = useCallback((product: Product) => {
    if (product.image) {
      const newImage: EditorImage = {
        id: `product_${Date.now()}_${Math.random()}`,
        src: product.image,
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        visible: true,
        name: product.title || 'Product Image',
        type: 'image',
        zIndex: elements.length
      };
      addElement(newImage);
    }
    setShowProductPanel(false);
  }, [addElement, elements.length]);

  // Text handling
  const addText = useCallback(() => {
    const newText: EditorText = {
      id: `text_${Date.now()}`,
      text: 'Double click to edit',
      x: 100,
      y: 100,
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
    addElement(newText);
  }, [addElement, elements.length, textProperties]);

  // Shape handling
  const addShape = useCallback((shapeType: 'rectangle' | 'circle') => {
    const newShape: EditorShape = {
      id: `shape_${Date.now()}`,
      shapeType,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: shapeProperties.fill,
      stroke: shapeProperties.stroke,
      strokeWidth: shapeProperties.strokeWidth,
      rotation: 0,
      opacity: 1,
      visible: true,
      name: `${shapeType} Shape`,
      type: 'shape',
      zIndex: elements.length
    };
    addElement(newShape);
  }, [addElement, elements.length, shapeProperties]);

  // Export functionality
  const exportCanvas = useCallback(async () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ 
        pixelRatio: 2,
        quality: 1,
        mimeType: 'image/png'
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `inspiration_${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Canvas exported successfully!');
    }
  }, []);

  // Generate inspiration
  const generateInspiration = useCallback(async () => {
    if (elements.length === 0) {
      toast.error('Please add at least one element to the canvas');
      return;
    }

    setIsGenerating(true);
    try {
      // Export canvas as base64
      const dataURL = stageRef.current?.toDataURL({ 
        pixelRatio: 1,
        quality: 0.8,
        mimeType: 'image/jpeg'
      });

      if (dataURL) {
        // Here you would integrate with your inspiration generation API
        // For now, we'll create a mock result
        const mockInspiration = {
          id: `inspiration_${Date.now()}`,
          image: dataURL,
          title: 'Generated Inspiration',
          createdAt: new Date().toISOString()
        };
        
        setGeneratedInspirations([mockInspiration]);
        setShowResultModal(true);
        toast.success('Inspiration generated successfully!');
      }
    } catch (error) {
      console.error('Error generating inspiration:', error);
      toast.error('Failed to generate inspiration');
    } finally {
      setIsGenerating(false);
    }
  }, [elements]);

  return (
    <PageLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Konva Image Editor</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCanvas}
                disabled={elements.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={generateInspiration}
                disabled={isGenerating || elements.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Inspiration'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Tools */}
          <div className="w-64 border-r bg-muted/50 p-4 space-y-4">
            <ToolsPanel
              currentTool={currentTool}
              onToolChange={setCurrentTool}
              onAddText={addText}
              onAddShape={addShape}
              onUploadImage={() => fileInputRef.current?.click()}
              onShowProducts={() => setShowProductPanel(true)}
            />
            
            <LayersPanel
              elements={elements}
              selectedElementId={selectedElementId}
              onElementSelect={setSelectedElementId}
              onElementUpdate={updateElement}
              onElementDelete={deleteElement}
              onElementDuplicate={duplicateElement}
            />
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 p-4 overflow-auto bg-gray-100">
            <div className="flex justify-center">
              <KonvaEditor
                width={canvasSize.width}
                height={canvasSize.height}
                elements={elements}
                selectedElementId={selectedElementId}
                onElementSelect={setSelectedElementId}
                onElementUpdate={updateElement}
                onStageRef={(ref) => { stageRef.current = ref; }}
                currentTool={currentTool}
                onElementAdd={addElement}
                textProperties={textProperties}
                shapeProperties={shapeProperties}
              />
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="w-80 border-l bg-muted/50 p-4">
            <PropertiesPanel
              selectedElement={elements.find(el => el.id === selectedElementId)}
              onElementUpdate={updateElement}
              textProperties={textProperties}
              onTextPropertiesChange={setTextProperties}
              shapeProperties={shapeProperties}
              onShapePropertiesChange={setShapeProperties}
              canvasSize={canvasSize}
              onCanvasSizeChange={setCanvasSize}
            />
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleImageUpload(e.target.files);
          }
        }}
      />

      {/* Product selection panel */}
      {showProductPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Product</h2>
              <Button
                variant="outline"
                onClick={() => setShowProductPanel(false)}
              >
                Close
              </Button>
            </div>
            <ProductSearchPanel
              onProductSelect={handleProductSelect}
            />
          </div>
        </div>
      )}

      {/* Inspiration result modal */}
      {showResultModal && (
        <InspirationResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          inspirations={generatedInspirations}
          programs={programs}
        />
      )}
    </PageLayout>
  );
}
