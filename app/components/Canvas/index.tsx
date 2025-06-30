// Canvas/index.tsx
import { AlertTriangle, Wand2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import ProductSearchPanel from '~/components/ProductSearchPanel';
import ProtectedRoute from '~/components/ProtectedRoute';
import InspirationResultModal from '~/components/modals/InspirationResultModal';
import { Button } from '~/components/ui/button';
import { ContentCard, PageLayout } from '~/components/ui/layout';
import { useAuth } from '~/contexts/AuthContext';
import { usePrograms } from '~/hooks/usePrograms';
import type { Product } from '~/lib/dataTypes';
import { getAllProducts } from '~/lib/firestoreService';

// Import our components and hooks
import CanvasArea from './components/CanvasArea';
import CanvasSnapshots from './components/CanvasSnapshots';
import CanvasToolbar from './components/CanvasToolbar';
import PromptInputs from './components/PromptInputs';
import SessionInspirations from './components/SessionInspirations';
import { useCanvasExport } from './hooks/useCanvasExport';
import { useCanvasImages } from './hooks/useCanvasImages';
import { useCanvasSnapshots } from './hooks/useCanvasSnapshots';
import { useSessionInspirations } from './hooks/useSessionInspirations';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useImageManipulation } from './hooks/useImageManipulation';
import { useInspirationGeneration } from './hooks/useInspirationGeneration';
import { createCanvasImageFromProduct, processFilesToCanvasImages } from './utils/canvasHelpers';

export default function Canvas() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Check authentication/authorization FIRST, before any other hooks
  useEffect(() => {
    if (!user) {
      navigate('/sign-in', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
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

  // Now all other hooks can be called safely
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

  // Canvas snapshots functionality
  const {
    snapshots,
    createSnapshot,
    createInspirationSnapshot,
    deleteSnapshot,
    clearAllSnapshots,
    downloadSnapshot
  } = useCanvasSnapshots({
    images,
    canvasRef
  });

  // Session inspirations functionality
  const {
    sessionInspirations,
    addSessionInspiration,
    deleteSessionInspiration,
    clearAllSessionInspirations,
    downloadSessionInspiration
  } = useSessionInspirations();

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
  } = useInspirationGeneration(canvasRef, deselectAllImages, images.length > 0, addSessionInspiration);

  // Wrapper function for inspiration generation that creates a snapshot and adds to session
  const handleGenerateInspiration = async () => {
    const canvasSnapshot = await createInspirationSnapshot();
    await generateInspiration(canvasSnapshot);
  };

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

  // Manual snapshot capture
  const handleManualSnapshot = async () => {
    if (images.length === 0) {
      toast.error('Add some images to the canvas first');
      return;
    }

    const description = window.prompt(`Enter a description for this snapshot:`,
      `Manual snapshot - ${images.length} item${images.length !== 1 ? 's' : ''}`);

    if (description !== null) {
      await createSnapshot(description);
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
            exportCanvasState={exportCanvasState}
            importCanvasState={importCanvasState}
            handleClearCanvas={handleClearCanvas}
            handleManualSnapshot={handleManualSnapshot}
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
              inspiration will be generated from your arrangement. Canvas snapshots are captured when you export images or generate inspiration.
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
              onClick={handleGenerateInspiration}
              disabled={images.length === 0 || isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              <Wand2 size={18} />
              {isGenerating ? "Generating..." : "Generate Inspiration"}
            </Button>
          </div>

          {/* Canvas Snapshots */}
          <CanvasSnapshots
            snapshots={snapshots}
            onDeleteSnapshot={deleteSnapshot}
            onDownloadSnapshot={downloadSnapshot}
            onClearAllSnapshots={clearAllSnapshots}
          />

          {/* Session Inspirations */}
          <SessionInspirations
            inspirations={sessionInspirations}
            onDeleteInspiration={deleteSessionInspiration}
            onDownloadInspiration={downloadSessionInspiration}
            onClearAllInspirations={clearAllSessionInspirations}
          />
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
