import { useState, useRef, useEffect } from 'react';
import { PageLayout, ContentCard } from './ui/layout';
import ProtectedRoute from './ProtectedRoute';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Upload, Move, Maximize, Minimize, Crop, Save, Trash, RotateCw, AlertTriangle, XCircle, Download, Upload as UploadIcon, Wand2, Search } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useAuth } from '~/contexts/AuthContext';
import { Navigate } from 'react-router';
import html2canvas from 'html2canvas';
import ProductCard from './ProductCard';
import { getAllProducts } from '~/lib/firestoreService';
import type { Product } from '~/lib/dataTypes';
import InspirationResultModal from './modals/InspirationResultModal';
import { toast } from 'sonner';
import { usePrograms } from '~/hooks/usePrograms';
import ProductSearchPanel from './ProductSearchPanel';

interface CanvasImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  selected: boolean;
}

export default function Canvas() {
  const { user, isAdmin } = useAuth();
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [selectedTool, setSelectedTool] = useState<'move' | 'resize' | 'crop' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Product search state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { programs } = usePrograms();
  
  // Load saved canvas state from localStorage
  useEffect(() => {
    const savedCanvas = localStorage.getItem('canvasImages');
    if (savedCanvas) {
      try {
        const parsedImages = JSON.parse(savedCanvas);
        setImages(parsedImages);
      } catch (error) {
        console.error('Failed to parse saved canvas data', error);
      }
    }
  }, []);
  
  // Save canvas state to localStorage when images change
  useEffect(() => {
    localStorage.setItem('canvasImages', JSON.stringify(images));
  }, [images]);
  
  // Load products from Firestore on component mount
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Load products from Firestore
  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const result = await getAllProducts(100);
      setProducts(result.documents);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    addImagesToCanvas(Array.from(files));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Shared function to add images to canvas
  const addImagesToCanvas = (files: File[]) => {
    const startingIndex = images.length;
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target) return;
        
        // Calculate grid position (3 columns)
        const position = startingIndex + index;
        const col = position % 3;
        const row = Math.floor(position / 3);
        
        const newImage: CanvasImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          src: event.target.result as string,
          x: 100 + (col * 220), // Add horizontal spacing
          y: 100 + (row * 220), // Add vertical spacing
          width: 200,
          height: 200,
          rotation: 0,
          selected: false
        };
        
        setImages(prev => [...prev, newImage]);
      };
      
      reader.readAsDataURL(file);
    });
  };
  
  // Handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };
  
  // Handle drag leave event
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Filter for image files only
      const imageFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length > 0) {
        console.log(`Processing ${imageFiles.length} dropped images`);
        addImagesToCanvas(imageFiles);
      }
    }
  };
  
  // Handle image selection
  const selectImage = (id: string) => {
    setImages(images.map(img => ({
      ...img,
      selected: img.id === id
    })));
  };
  
  // Handle image movement
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (selectedTool !== 'move' && selectedTool !== null) return;
    
    const image = images.find(img => img.id === id);
    if (!image) return;
    
    selectImage(id);
    setIsDragging(true);
    setDragStartPos({
      x: e.clientX - image.x,
      y: e.clientY - image.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const selectedImage = images.find(img => img.selected);
    if (!selectedImage) return;
    
    setImages(images.map(img => {
      if (img.selected) {
        return {
          ...img,
          x: e.clientX - dragStartPos.x,
          y: e.clientY - dragStartPos.y
        };
      }
      return img;
    }));
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle image resize
  const handleResize = (direction: 'in' | 'out') => {
    const selectedImage = images.find(img => img.selected);
    if (!selectedImage) return;
    
    const scaleFactor = direction === 'in' ? 1.1 : 0.9;
    
    setImages(images.map(img => {
      if (img.selected) {
        return {
          ...img,
          width: img.width * scaleFactor,
          height: img.height * scaleFactor
        };
      }
      return img;
    }));
  };
  
  // Handle image rotation
  const handleRotate = () => {
    const selectedImage = images.find(img => img.selected);
    if (!selectedImage) return;
    
    setImages(images.map(img => {
      if (img.selected) {
        return {
          ...img,
          rotation: img.rotation + 90
        };
      }
      return img;
    }));
  };
  
  // Handle delete image
  const handleDelete = () => {
    setImages(images.filter(img => !img.selected));
  };
  
  // Clean up event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Redirect to home if not an admin user
  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <ContentCard className="max-w-lg text-center py-12">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Admin Access Only</h2>
          <p className="mb-4">This is an internal tool restricted to administrator users only.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </ContentCard>
      </PageLayout>
    );
  }
  
  // Clear all images from canvas
  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas? All images will be removed.')) {
      setImages([]);
      toast.success('Canvas cleared successfully');
    }
  };
  
  // Function to save canvas as image
  const saveAsImage = async () => {
    if (!canvasRef.current) return;

    try {
      // Remove selection highlighting temporarily for clean export
      const selectedImage = images.find(img => img.selected);
      let tempImages = [...images];

      if (selectedImage) {
        tempImages = images.map(img => ({ ...img, selected: false }));
        setImages(tempImages);
      }

      // Small delay to ensure DOM updates
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null, // transparent background
        scale: 2, // higher quality
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `canvas-export-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Restore selection if there was one
      if (selectedImage) {
        setImages(images);
      }

      toast.success('Canvas exported as image successfully');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to export canvas as image:', error.message, '\nStack:', error.stack);
        toast.error(`Failed to export canvas as image: ${error.message}`);
      } else {
        console.error('Failed to export canvas as image:', error);
        toast.error('Failed to export canvas as image. Please try again.');
      }
    }
  };
  
  // Function to export canvas state
  const exportCanvasState = () => {
    try {
      const canvasState = JSON.stringify(images);
      const blob = new Blob([canvasState], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `canvas-state-${new Date().toISOString().slice(0, 10)}.json`;
      link.href = url;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      toast.success('Canvas state exported successfully');
    } catch (error) {
      console.error('Failed to export canvas state:', error);
      toast.error('Failed to export canvas state. Please try again.');
    }
  };
  
  // Function to import canvas state
  const importCanvasState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/json') {
      toast.error('Please select a valid JSON file.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const contents = event.target?.result as string;
        const parsedImages = JSON.parse(contents) as CanvasImage[];
        
        // Verify the imported data structure
        if (!Array.isArray(parsedImages) || parsedImages.some(img => !img.id || !img.src)) {
          throw new Error('Invalid canvas state format');
        }
        
        setImages(parsedImages);
        toast.success('Canvas state imported successfully');
      } catch (error) {
        console.error('Failed to import canvas state:', error);
        toast.error('Failed to import canvas state. File format is invalid.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Function to generate inspiration based on canvas
  // Utility function to recursively replace oklch colors in style attributes with rgb fallback
  function replaceOklchColors(element: HTMLElement) {
    const style = element.getAttribute('style');
    if (style && style.includes('oklch')) {
      // Replace all oklch(...) with #cccccc (or any fallback color you prefer)
      const newStyle = style.replace(/oklch\([^)]+\)/g, '#cccccc');
      element.setAttribute('style', newStyle);
    }
    Array.from(element.children).forEach(child => {
      if (child instanceof HTMLElement) {
        replaceOklchColors(child);
      }
    });
  }

  const generateInspiration = async () => {
    if (!canvasRef.current || images.length === 0) {
      toast.error('Please add at least one image to the canvas');
      return;
    }
    
    try {
      setIsGenerating(true);
      setGeneratedImage(null);
      
      toast.loading('Generating inspiration...', {
        id: 'generate-inspiration',
      });
      
      // Remove selection highlighting temporarily for clean export
      const selectedImage = images.find(img => img.selected);
      let tempImages = [...images];
      
      if (selectedImage) {
        tempImages = images.map(img => ({ ...img, selected: false }));
        setImages(tempImages);
      }
      
      // Small delay to ensure DOM updates
      await new Promise(resolve => setTimeout(resolve, 100));

      // Replace oklch colors on the actual DOM node before rendering
      if (canvasRef.current) {
        replaceOklchColors(canvasRef.current);
      }

      // Create canvas image only (no mask)
      const imageCanvas = await html2canvas(canvasRef.current!, {
        backgroundColor: null, // transparent background
        scale: 2, // higher quality
      });

      // Define prompts based on the Python implementation
      const prompt = "Create a sophisticated home decor lifestyle photo featuring elegant furniture and decorative items in a bright, airy living space. Show products in a realistic, high-end home setting with soft natural sunlight streaming through large windows. Include tasteful styling with neutral color palette, layered textures, and organic materials. Capture the products from an editorial perspective with professional composition and depth of field";
      const negativePrompt = "text, watermarks, logos, poor quality, blurry, artificial lighting, cluttered space, oversaturated colors, distorted proportions, unrealistic shadows, cartoon style, illustration, digital art style";
      
      // Send only the canvas image to the inpainting API (mask will be created on backend)
      const response = await fetch('/api/inpaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64_image: imageCanvas.toDataURL('image/png').split(',')[1], // Remove data:image/png;base64, prefix
          prompt,
          negative_prompt: negativePrompt,
          internal_model: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      
      // The API returns a base64 encoded image
      setGeneratedImage(result.image);
      setShowResultModal(true);
      
      // Restore selection if there was one
      if (selectedImage) {
        setImages(images);
      }
      
      toast.success('Inspiration generated successfully', {
        id: 'generate-inspiration',
      });
    } catch (error) {
      console.error('Failed to generate inspiration:', error);
      toast.error(`Failed to generate inspiration: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        id: 'generate-inspiration',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Add product to canvas
  const addProductToCanvas = (product: Product) => {
    if (!product.image_url) return;
    
    // Create a new canvas image from the product
    const newImage: CanvasImage = {
      id: `product-${product.id}-${Date.now()}`,
      src: product.image_url,
      x: 100 + (Math.random() * 100), // Random position
      y: 100 + (Math.random() * 100), // Random position
      width: 200,
      height: 200,
      rotation: 0,
      selected: false
    };
    
    setImages(prev => [...prev, newImage]);
  };
  
  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="w-full flex flex-col h-full">
          <h1 className="text-3xl font-bold mb-6">Generate Inspiration</h1>

          <ProductSearchPanel
            products={products}
            programs={programs}
            isLoading={isLoadingProducts}
            onAddProduct={addProductToCanvas}
          />

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
            >
              <Maximize size={16} />
              Enlarge
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleResize('out')}
              className="flex items-center gap-2"
            >
              <Minimize size={16} />
              Shrink
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRotate}
              className="flex items-center gap-2"
            >
              <RotateCw size={16} />
              Rotate
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash size={16} />
              Delete Image from Canvas
            </Button>
            
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                onClick={saveAsImage}
                className="flex items-center gap-2"
                disabled={images.length === 0}
              >
                <Save size={16} />
                Export as Image
              </Button>
              
              <Button
                variant="outline"
                onClick={exportCanvasState}
                className="flex items-center gap-2"
                disabled={images.length === 0}
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
                disabled={images.length === 0}
              >
                <XCircle size={16} />
                Clear Canvas
              </Button>
            </div>
          </div>
          
          <ContentCard className="flex-grow p-0 overflow-hidden bg-gray-100 dark:bg-gray-900 relative z-0">
            <div
              ref={canvasRef}
              className={cn(
                "w-full h-[600px] relative overflow-auto",
                isDraggingFile && "border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              )}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {images.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "absolute cursor-move",
                    image.selected ? "ring-2 ring-blue-500" : ""
                  )}
                  style={{
                    left: `${image.x}px`,
                    top: `${image.y}px`,
                    width: `${image.width}px`,
                    height: `${image.height}px`,
                    transform: `rotate(${image.rotation}deg)`,
                    zIndex: image.selected ? 10 : 1
                  }}
                  onMouseDown={(e) => handleMouseDown(e, image.id)}
                >
                  <img
                    src={image.src}
                    alt="Canvas image"
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                </div>
              ))}
              
              {isDraggingFile && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-100/50 dark:bg-blue-900/50 pointer-events-none">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
                    <Upload size={32} className="mx-auto mb-2 text-blue-500" />
                    <p className="font-medium">Drop images here</p>
                    <p className="text-sm text-gray-500">You can drop multiple images at once</p>
                  </div>
                </div>
              )}
              
              {/* Empty canvas message - now inside the canvas container */}
              {images.length === 0 && !isDraggingFile && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-gray-400">
                    <Upload size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Upload images to get started</p>
                    <p className="text-sm mt-2">Click the Upload Image button above or drag and drop images here</p>
                  </div>
                </div>
              )}
            </div>
          </ContentCard>
          
          <div className="mt-4 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-4 text-center">
              Tip: Select an image and use the tools above to manipulate it. You can upload multiple images to create a collage.
              It's important to maintain the real sizes of products. The background will be automatically removed, and a new
              inspiration will be generated from your arrangement.
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={generateInspiration}
              disabled={images.length === 0 || isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              <Wand2 size={18} />
              {isGenerating ? "Generating..." : "Generate Inspiration"}
            </Button>
          </div>
        </div>
        
        <InspirationResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          imageData={generatedImage}
        />
        
      </PageLayout>
    </ProtectedRoute>
  );
}