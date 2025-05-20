// Canvas/index.tsx
import { useState, useRef, useEffect } from 'react';
import { PageLayout, ContentCard } from '~/components/ui/layout';
import ProtectedRoute from '~/components/ProtectedRoute';
import { Button } from '~/components/ui/button';
import { AlertTriangle, Wand2 } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';
import { Navigate } from 'react-router';
import { getAllProducts } from '~/lib/firestoreService';
import { toast } from 'sonner';
import { usePrograms } from '~/hooks/usePrograms';
import ProductSearchPanel from '~/components/ProductSearchPanel';
import InspirationResultModal from '~/components/modals/InspirationResultModal';
import type { Product } from '~/lib/dataTypes';

// Import our components and hooks
import CanvasToolbar from './components/CanvasToolbar';
import CanvasArea from './components/CanvasArea';
import PromptInputs from './components/PromptInputs';
import { useCanvasImages } from './hooks/useCanvasImages';
import { useImageManipulation } from './hooks/useImageManipulation';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useCanvasExport } from './hooks/useCanvasExport';
import { useInspirationGeneration } from './hooks/useInspirationGeneration';
import { processFilesToCanvasImages, createCanvasImageFromProduct } from './utils/canvasHelpers';

export default function Canvas() {
  const { user, isAdmin } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const {
    images, 
    setImages, 
    addImage, 
    clearImages, 
    updateImage, 
    removeImage, 
    selectImage,
    deselectAllImages
  } = useCanvasImages();
  
  const {
    selectedTool,
    setSelectedTool,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleResize,
    handleRotate
  } = useImageManipulation(images, updateImage, selectImage);
  
  // Add images to canvas from files
  const addImagesToCanvas = (files: File[]) => {
    processFilesToCanvasImages(files, images.length, addImage);
  };
  
  const {
    isDraggingFile,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileUpload
  } = useDragAndDrop(addImagesToCanvas);
  
  const {
    saveAsImage,
    exportCanvasState,
    importCanvasState
  } = useCanvasExport(images, setImages, canvasRef, deselectAllImages);
  
  const {
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    resetPrompt,
    resetNegativePrompt,
    isGenerating,
    generateInspiration,
    showResultModal,
    setShowResultModal,
    generatedImage
  } = useInspirationGeneration(canvasRef, deselectAllImages, images.length > 0);
  
  // Product search state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const { programs } = usePrograms();
  
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
  
  // Clear all images from canvas
  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas? All images will be removed.')) {
      clearImages();
      toast.success('Canvas cleared successfully');
    }
  };
  
  const handleDelete = () => {
    const selectedImage = images.find(img => img.selected);
    if (selectedImage) {
      removeImage(selectedImage.id);
    }
  };
  
  // Add product to canvas
  const addProductToCanvas = (product: Product) => {
    const newImage = createCanvasImageFromProduct(product);
    if (newImage) {
      addImage(newImage);
    }
  };
  
  // Handle global mouse events
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);
  
  // Redirect if not authenticated or not admin
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
  
  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="w-full flex flex-col h-full">
          <h1 className="text-3xl font-bold mb-6">Generate Inspiration</h1>

          {/* Product Search Panel */}
          <ProductSearchPanel
            products={products}
            programs={programs}
            isLoading={isLoadingProducts}
            onAddProduct={addProductToCanvas}
          />

          {/* Canvas Toolbar */}
          <CanvasToolbar
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            handleResize={handleResize}
            handleRotate={handleRotate}
            handleDelete={handleDelete}
            handleFileUpload={handleFileUpload}
            fileInputRef={fileInputRef}
            saveAsImage={saveAsImage}
            exportCanvasState={exportCanvasState}
            importCanvasState={importCanvasState}
            handleClearCanvas={handleClearCanvas}
            hasImages={images.length > 0}
          />
          
          {/* Canvas Area */}
          <CanvasArea
            canvasRef={canvasRef}
            images={images}
            isDraggingFile={isDraggingFile}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleMouseDown={handleMouseDown}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
          />
          
          <div className="mt-4 flex flex-col items-center w-full">
            <p className="text-sm text-gray-500 mb-4 text-center">
              Tip: Select an image and use the tools above to manipulate it. You can upload multiple images to create a collage.
              It's important to maintain the real sizes of products. The background will be automatically removed, and a new
              inspiration will be generated from your arrangement.
            </p>
            
            {/* Prompt Inputs */}
            <PromptInputs
              prompt={prompt}
              setPrompt={setPrompt}
              negativePrompt={negativePrompt}
              setNegativePrompt={setNegativePrompt}
              resetPrompt={resetPrompt}
              resetNegativePrompt={resetNegativePrompt}
            />
            
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
