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
  
  // Product search state
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      setFilteredProducts(result.documents);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Reset pagination when search query or program filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedProgram]);

  // Extract unique program names from filtered products
  const getUniquePrograms = () => {
    // First filter products by search query only
    const searchFilteredProducts = searchQuery.trim() === ''
      ? products
      : products.filter(product => {
          const query = searchQuery.toLowerCase();
          return (
            product.title.toLowerCase().includes(query) || 
            product.program.toLowerCase().includes(query) ||
            (product.metadata?.description_in_english?.toLowerCase().includes(query) || false)
          );
        });
    
    // Extract unique program names
    const uniquePrograms = Array.from(
      new Set(searchFilteredProducts.map(product => product.program))
    ).filter(Boolean);
    
    return uniquePrograms;
  };

  // Filter products based on search query and selected program
  useEffect(() => {
    if (searchQuery.trim() === '' && !selectedProgram) {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      
      const filtered = products.filter(product => {
        const matchesSearch = searchQuery.trim() === '' || (
          product.title.toLowerCase().includes(query) || 
          product.program.toLowerCase().includes(query) ||
          (product.metadata?.description_in_english?.toLowerCase().includes(query) || false)
        );
        
        const matchesProgram = !selectedProgram || product.program === selectedProgram;
        
        return matchesSearch && matchesProgram;
      });
      
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products, selectedProgram]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
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
    } catch (error) {
      console.error('Failed to export canvas as image:', error);
      alert('Failed to export canvas as image. Please try again.');
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
    } catch (error) {
      console.error('Failed to export canvas state:', error);
      alert('Failed to export canvas state. Please try again.');
    }
  };
  
  // Function to import canvas state
  const importCanvasState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/json') {
      alert('Please select a valid JSON file.');
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
      } catch (error) {
        console.error('Failed to import canvas state:', error);
        alert('Failed to import canvas state. File format is invalid.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Function to generate inspiration based on canvas
  const generateInspiration = async () => {
    if (!canvasRef.current || images.length === 0) return;
    
    try {
      setIsGenerating(true);
      
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
      
      // Get canvas data
      const canvasData = canvas.toDataURL('image/png');
      
      // Here you would typically send this data to your backend API
      // For now, we'll just simulate a delay and show an alert
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Inspiration generated! In a real implementation, this would call your backend API to process the image and generate inspiration.');
      
      // Restore selection if there was one
      if (selectedImage) {
        setImages(images);
      }
    } catch (error) {
      console.error('Failed to generate inspiration:', error);
      alert('Failed to generate inspiration. Please try again.');
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
          
          {/* Product search section - Now positioned before the button toolbar and full width */}
          <ContentCard className="mb-4 p-4 w-full max-w-none relative z-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search products by name, program, or description..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedProgram(null);
                  }}
                  disabled={searchQuery === '' && selectedProgram === null}
                >
                  Clear All
                </Button>
              </div>
              
              {/* Program filter buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium mr-1">Filter by program:</span>
                <Button
                  variant={selectedProgram === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProgram(null)}
                  className="mb-1"
                >
                  All
                </Button>
                
                {getUniquePrograms().map(program => (
                  <Button
                    key={program}
                    variant={selectedProgram === program ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedProgram(program)}
                    className="mb-1"
                  >
                    {program}
                  </Button>
                ))}
                
                {getUniquePrograms().length === 0 && (
                  <span className="text-sm text-gray-500">No programs available for current search</span>
                )}
              </div>
              
              {isLoadingProducts ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No products found. Try a different search term or filter.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3 mt-2">
                    {currentProducts.map((product) => (
                      <div key={product.id} className="flex flex-col items-center">
                        <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden mb-2">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-center line-clamp-1 mb-2">{product.title}</p>
                        <p className="text-xs text-gray-500 text-center line-clamp-1 mb-2">{product.program}</p>
                        <Button 
                          className="w-full bg-primary text-white"
                          size="sm"
                          disabled={!product.image_url}
                          onClick={() => addProductToCanvas(product)}
                        >
                          Add to Canvas
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            // Show first page, last page, current page, and pages around current
                            let pageToShow;
                            if (totalPages <= 5) {
                              // If 5 or fewer pages, show all page numbers
                              pageToShow = i + 1;
                            } else if (currentPage <= 3) {
                              // If near start, show first 5 pages
                              pageToShow = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              // If near end, show last 5 pages
                              pageToShow = totalPages - 4 + i;
                            } else {
                              // Otherwise show current page and 2 pages before/after
                              pageToShow = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageToShow}
                                variant={currentPage === pageToShow ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => setCurrentPage(pageToShow)}
                              >
                                {pageToShow}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ContentCard>
          
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
      </PageLayout>
    </ProtectedRoute>
  );
} 