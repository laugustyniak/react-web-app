// Canvas/components/CanvasToolbar.tsx
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Upload, Move, Maximize, Minimize, RotateCw, Trash, Save, Download, Upload as UploadIcon, XCircle } from 'lucide-react';
import type { CanvasTool } from '../types';

interface CanvasToolbarProps {
  selectedTool: CanvasTool;
  setSelectedTool: (tool: CanvasTool | ((prev: CanvasTool) => CanvasTool)) => void;
  handleResize: (direction: 'in' | 'out') => void;
  handleRotate: () => void;
  handleDelete: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  saveAsImage: () => void;
  exportCanvasState: () => void;
  importCanvasState: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearCanvas: () => void;
  hasImages: boolean;
}

export default function CanvasToolbar({
  selectedTool,
  setSelectedTool,
  handleResize,
  handleRotate,
  handleDelete,
  handleFileUpload,
  fileInputRef,
  saveAsImage,
  exportCanvasState,
  importCanvasState,
  handleClearCanvas,
  hasImages
}: CanvasToolbarProps) {
  return (
    <div className="flex gap-4 mb-4 overflow-x-auto pb-2 flex-wrap z-0 relative">
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2"
      >
        <Upload size={16} />
        Upload Image
      </Button>
      <Input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      
      <Button
        variant={selectedTool === 'move' ? "default" : "outline"}
        onClick={() => setSelectedTool(prev => prev === 'move' ? null : 'move')}
        className="flex items-center gap-2"
      >
        <Move size={16} />
        Move
      </Button>
      
      <Button
        variant="outline"
        onClick={() => handleResize('in')}
        className="flex items-center gap-2"
        disabled={!hasImages}
      >
        <Maximize size={16} />
        Enlarge
      </Button>
      
      <Button
        variant="outline"
        onClick={() => handleResize('out')}
        className="flex items-center gap-2"
        disabled={!hasImages}
      >
        <Minimize size={16} />
        Shrink
      </Button>
      
      <Button
        variant="outline"
        onClick={handleRotate}
        className="flex items-center gap-2"
        disabled={!hasImages}
      >
        <RotateCw size={16} />
        Rotate
      </Button>
      
      <Button
        variant="destructive"
        onClick={handleDelete}
        className="flex items-center gap-2"
        disabled={!hasImages}
      >
        <Trash size={16} />
        Delete Image
      </Button>
      
      <div className="ml-auto flex gap-2">
        <Button
          variant="outline"
          onClick={saveAsImage}
          className="flex items-center gap-2"
          disabled={!hasImages}
        >
          <Save size={16} />
          Export as Image
        </Button>
        
        <Button
          variant="outline"
          onClick={exportCanvasState}
          className="flex items-center gap-2"
          disabled={!hasImages}
        >
          <Download size={16} />
          Export Canvas State
        </Button>
        
        <label>
          <Button
            variant="outline"
            tabIndex={-1}
            className="flex items-center gap-2"
            asChild
          >
            <span>
              <UploadIcon size={16} />
              Import Canvas State
            </span>
          </Button>
          <Input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={importCanvasState}
          />
        </label>
        
        <Button
          variant="destructive"
          onClick={handleClearCanvas}
          className="flex items-center gap-2"
          disabled={!hasImages}
        >
          <XCircle size={16} />
          Clear Canvas
        </Button>
      </div>
    </div>
  );
}
