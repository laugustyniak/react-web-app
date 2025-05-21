import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Progress } from "~/components/ui/progress";
import { 
  getAllVideos, 
  getFramesByVideoId, 
  getProductsByIds, 
  getProductById 
} from '~/lib/firestoreService';
import { DocumentSnapshot } from 'firebase/firestore';
import type { VideoData, VideoFrame, UIProduct as Product, SimilarProduct, MultipleProducts } from '../types/models';

const API_KEY = "insbuy-a14727b1-58a6-43ad-beae-b393ca192708"
const API_URL = "http://localhost:8051";


// Import types from models

const ProductExtraction = () => {
  // State for video and frame selection
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [frames, setFrames] = useState<VideoFrame[]>([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [availableVideos, setAvailableVideos] = useState<VideoData[]>([]);
  const [lastVideoDoc, setLastVideoDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true);
  
  // State for product analysis
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Record<string, SimilarProduct[]>>({});
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [inspirationProducts, setInspirationProducts] = useState<Product[]>([]);
  const [generatedInspirations, setGeneratedInspirations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  // State for product description API response
  const [extractedProducts, setExtractedProducts] = useState<MultipleProducts | null>(null);
  const [isExtractedProductsLoading, setIsExtractedProductsLoading] = useState<boolean>(false);
  const [extractedProductsError, setExtractedProductsError] = useState<string | null>(null);
  // Editing state for extracted products
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<null | {
    product_name: string;
    description_in_english: string;
  }>(null);
  
  // Default video ID from the requirement
  const DEFAULT_VIDEO_ID = '8X_m6E3XEaw';
  


  // Load all available videos from Firebase on component mount
  useEffect(() => {
    loadVideosFromFirebase();
    
    // Set the default video URL if availableVideos is empty
    if (videoUrl === '') {
      setVideoUrl('https://www.youtube.com/watch?v=8X_m6E3XEaw');
    }
  }, []);



  // Load videos from Firestore
  const loadVideosFromFirebase = async () => {
    try {
      setIsLoadingVideos(true);
      const { documents, lastDoc, hasMore } = await getAllVideos(10, lastVideoDoc);
      
      setAvailableVideos(prev => [...prev, ...documents]);
      setLastVideoDoc(lastDoc);
      setHasMoreVideos(hasMore);
      
      // If we have videos and no videoData set, load the first one (or the default one)
      if (documents.length > 0 && !videoData) {
        const defaultVideo = documents.find(v => v.video_id === DEFAULT_VIDEO_ID) || documents[0];
        setVideoData(defaultVideo);
        await loadFrames(defaultVideo.video_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos from Firebase');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Load more videos from Firebase
  const loadMoreVideos = () => {
    if (hasMoreVideos && !isLoadingVideos) {
      loadVideosFromFirebase();
    }
  };

  // Load a specific video
  const loadVideo = async (url: string) => {
    try {
      setError(null);
      
      // Find the video in our available videos by URL or use the first one
      const videoByUrl = availableVideos.find(v => v.video_url === url);
      
      if (videoByUrl) {
        setVideoData(videoByUrl);
        await loadFrames(videoByUrl.video_id);
      } else {
        // If not in our list, try to find it by the default ID
        const defaultVideo = availableVideos.find(v => v.video_id === DEFAULT_VIDEO_ID);
        if (defaultVideo) {
          setVideoData(defaultVideo);
          await loadFrames(defaultVideo.video_id);
        } else if (availableVideos.length > 0) {
          // Fall back to the first video in the list
          setVideoData(availableVideos[0]);
          await loadFrames(availableVideos[0].video_id);
        } else {
          throw new Error('No videos available');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const loadFrames = async (videoId: string) => {
    try {
      setError(null);
      setIsAnalyzing(true);
      
      // Get frames from Firebase
      const framesData = await getFramesByVideoId(videoId);
      
      // Convert the frame data to the expected format
      const formattedFrames: VideoFrame[] = framesData.map((frame, idx) => ({
        frame_id: frame.frame_id || `frame_${idx}_${Date.now()}`,
        video_id: frame.video_id,
        frame_number: frame.frame_number || idx + 1,
        timestamp_ms: frame.timestamp_ms || (idx + 1) * 10000,
        frame_path: frame.frame_path,
        storage_url: frame.storage_url,
        // Use storage_url, frame_path, or a placeholder for the image
        image_url: frame.storage_url || frame.frame_path || `https://picsum.photos/800/450?random=${idx}`,
        scene_score: frame.scene_score || Math.random()
      }));
      
      setFrames(formattedFrames);
      // Clear previous selections
      setSelectedFrameIndex(null);
      setProducts([]);
      setSimilarProducts({});
      setInspirationProducts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load frames');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeProducts = async () => {
    if (selectedFrameIndex === null || !frames[selectedFrameIndex]) return;
    setIsAnalyzing(true);
    setError(null);
    setExtractedProducts(null);
    setExtractedProductsError(null);
    setIsExtractedProductsLoading(true);
    try {
      // Get selected frame
      const selectedFrame = frames[selectedFrameIndex];

      // --- Product Description API Call ---
      // Get the image URL (prefer image_url, then storage_url, then frame_path)
      const imageUrl = selectedFrame.image_url || selectedFrame.storage_url || selectedFrame.frame_path;
      if (!imageUrl) throw new Error('No image available for selected frame');

      // Fetch the image and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') resolve(reader.result.split(',')[1]);
          else reject('Failed to convert image to base64');
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });

      // Call the product description API
      const descResponse = await fetch(`${API_URL}/get_product_description`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({ base64_image: base64, language: 'english' })
      });
      if (!descResponse.ok) {
        const errText = await descResponse.text();
        setExtractedProductsError(`API error: ${errText}`);
      } else {
        const descData = await descResponse.json();
        // Expect descData to be an object with a 'products' array
        if (descData && Array.isArray(descData.products)) {
          setExtractedProducts({ products: descData.products });
        } else if (descData && descData.result && Array.isArray(descData.result.products)) {
          setExtractedProducts({ products: descData.result.products });
        } else {
          setExtractedProductsError('Unexpected API response format');
        }
      }
    } catch (err) {
      setExtractedProductsError(err instanceof Error ? err.message : 'Failed to get product description');
    } finally {
      setIsExtractedProductsLoading(false);
      setIsAnalyzing(false);
    }

    // --- Existing mock product analysis logic (unchanged) ---
    try {
      // Get selected frame
      const selectedFrame = frames[selectedFrameIndex];
      // Mock products
      const mockProducts: Product[] = Array(3).fill(null).map((_, idx) => ({
        product_id: `product_${idx}_${Date.now()}`,
        frame_id: selectedFrame.frame_id,
        name: ['Chair', 'Table', 'Lamp'][idx],
        category: ['Furniture', 'Furniture', 'Lighting'][idx],
        confidence: 0.7 + (idx * 0.1),
        bounding_box: {
          x: 0.1 + (idx * 0.2),
          y: 0.1 + (idx * 0.2),
          width: 0.2,
          height: 0.2
        },
        image_path: `https://picsum.photos/200/200?random=${idx}`
      }));
      setProducts(mockProducts);
      // Mock similar products
      const mockSimilarProducts: Record<string, SimilarProduct[]> = {};
      mockProducts.forEach(product => {
        mockSimilarProducts[product.product_id] = Array(4).fill(null).map((_, idx) => ({
          product_id: `similar_${idx}_${Date.now()}`,
          name: `${product.name} - Model ${idx + 1}`,
          brand: ['IKEA', 'West Elm', 'CB2', 'Pottery Barn'][idx % 4],
          price: 50 + (idx * 30),
          currency: 'USD',
          image_url: `https://picsum.photos/200/200?random=${idx + 10}`,
          product_url: `https://example.com/product/${idx}`,
          similarity_score: 0.9 - (idx * 0.1)
        }));
      });
      setSimilarProducts(mockSimilarProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze products');
    }
  };

  const toggleProductForInspiration = (product: Product) => {
    setInspirationProducts(prev => {
      // Check if product is already selected
      const isSelected = prev.some(p => p.product_id === product.product_id);
      
      if (isSelected) {
        // Remove from selection
        return prev.filter(p => p.product_id !== product.product_id);
      } else {
        // Add to selection
        return [...prev, product];
      }
    });
  };

  const generateInspiration = async () => {
    if (inspirationProducts.length === 0) {
      setError('Please select at least one product for inspiration');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Mock API call
      const response = await fetch(`${API_URL}/inspirations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({
          products: inspirationProducts.map(p => p.product_id)
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate inspiration');
      
      // Mock response with a random image URL
      const mockInspirationImageUrl = `https://picsum.photos/1000/800?random=${Date.now()}`;
      
      // Add to generated inspirations
      setGeneratedInspirations(prev => [mockInspirationImageUrl, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate inspiration');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Check if a product is selected for inspiration
  const isProductSelected = (productId: string) => {
    return inspirationProducts.some(p => p.product_id === productId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="py-4">
        <h1 className="text-3xl font-bold mb-4">
          🎥 Insbuy - Turn Videos into Revenue
        </h1>
        
        <p className="mb-4">
          Transform any video content into a powerful sales channel. Insbuy automatically identifies products in your videos
          and connects them to online retailers, creating new revenue streams with zero effort.
        </p>
        
        <div className="mb-4 flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Available Videos:</h2>
          <div className="flex flex-wrap gap-2">
            {availableVideos.length > 0 ? (
              availableVideos.map((video, index) => (
                <Badge 
                  key={video.video_id} 
                  variant={videoData?.video_id === video.video_id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setVideoUrl(video.video_url);
                    setVideoData(video);
                    loadFrames(video.video_id);
                  }}
                >
                  {video.video_id === DEFAULT_VIDEO_ID ? '⭐ ' : ''}{video.title ? video.title : video.video_id}
                </Badge>
              ))
            ) : (
              <p>Loading videos...</p>
            )}
            
            {hasMoreVideos && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadMoreVideos}
                disabled={isLoadingVideos}
              >
                {isLoadingVideos ? 'Loading...' : 'Load More Videos'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <Input
            className="w-full"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)}
          />
          <Button 
            variant="default" 
            onClick={() => loadVideo(videoUrl)}
            disabled={!videoUrl || isAnalyzing}
            className="min-w-[180px]"
          >
            Load Video & Frames
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {videoData && (
          <div className="mb-4">
            <Card className="p-4 mb-4">
              <h3 className="text-2xl font-semibold mb-4">Video Player</h3>
              <div className="relative aspect-video">
                <ReactPlayer
                  url={videoData.video_url}
                  width="100%"
                  height="100%"
                  controls
                  style={{ position: 'absolute', top: 0, left: 0 }}
                />
              </div>
            </Card>
            
            {frames.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold mb-2">
                  All Available Frames
                </h2>
                
                <p className="mb-2">
                  📊 Showing all {frames.length} available frames. Select any frame to analyze products.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {frames.map((frame, idx) => {
                    const isSelected = selectedFrameIndex === idx;
                    return (
                      <Card
                        key={frame.frame_id}
                        className={`cursor-pointer border-2 transition-transform hover:scale-102 ${isSelected ? 'border-blue-500 ring-2 ring-blue-400' : 'border-none'}`}
                        onClick={() => setSelectedFrameIndex(idx)}
                      >
                        <div className="relative aspect-video">
                          <img
                            src={frame.image_url || frame.storage_url || frame.frame_path || `https://picsum.photos/800/450?random=${idx}`}
                            alt={`Frame ${idx + 1}`}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <p className="text-sm">Frame {idx + 1}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                
                {selectedFrameIndex !== null && (
                  <div className="mb-4 flex flex-col items-center">
                    <Button 
                      variant="default" 
                      onClick={analyzeProducts}
                      disabled={isAnalyzing}
                      className={`${isAnalyzing ? 'animate-spin' : ''}`}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze and Find Products'}
                    </Button>
                    {/* Show product description API response below the button */}
                    <div className="w-full max-w-2xl mt-4">
                      {isExtractedProductsLoading && (
                        <Alert className="mb-2"><AlertDescription>🔎 Insbuy AI is looking for products in the image...</AlertDescription></Alert>
                      )}
                      {extractedProductsError && (
                        <Alert variant="destructive" className="mb-2"><AlertDescription>{extractedProductsError}</AlertDescription></Alert>
                      )}
                      {extractedProducts && extractedProducts.products && extractedProducts.products.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {extractedProducts.products.map((prod: import('../types/models').Product, idx: number) => {
                            const isEditing = editingProductIndex === idx;
                            const handleEditClick = () => {
                              setEditingProductIndex(idx);
                              setEditValues({
                                product_name: prod.product_name,
                                description_in_english: prod.description_in_english,
                              });
                            };
                            const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                              const { name, value } = e.target;
                              setEditValues(prev => prev ? { ...prev, [name]: value } : null);
                            };
                            const handleSave = () => {
                              if (!extractedProducts || editValues == null) return;
                              const updatedProducts = extractedProducts.products.map((p, i) =>
                                i === idx ? { ...p, product_name: editValues.product_name, description_in_english: editValues.description_in_english } : p
                              );
                              setExtractedProducts({ products: updatedProducts });
                              setEditingProductIndex(null);
                              setEditValues(null);
                            };
                            const handleCancel = () => {
                              setEditingProductIndex(null);
                              setEditValues(null);
                            };
                            return (
                              <Card key={prod.product_id || idx} className="mb-2">
                                <div className="p-4">
                                  {isEditing && editValues ? (
                                    <>
                                      <input
                                        className="mb-2 w-full border rounded px-2 py-1"
                                        name="product_name"
                                        value={editValues.product_name}
                                        onChange={handleEditChange}
                                        placeholder="Product Name"
                                      />
                                      <textarea
                                        className="mb-2 w-full border rounded px-2 py-1"
                                        name="description_in_english"
                                        value={editValues.description_in_english}
                                        onChange={handleEditChange}
                                        placeholder="Description (EN)"
                                      />
                                      <div className="flex gap-2 mt-2">
                                        <Button size="sm" variant="default" onClick={handleSave}>Save</Button>
                                        <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <h4 className="text-lg font-semibold mb-2">{prod.product_name || prod.product_name}</h4>
                                      <p className="text-sm mb-1"><strong>Description:</strong> {prod.description_in_english}</p>
                                      <Button size="sm" variant="outline" className="mt-2" onClick={handleEditClick}>
                                        Edit
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {products.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                      ✨ Product Opportunities
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {products.map((product, idx) => (
                        <Card key={product.product_id} className="h-full flex flex-col">
                          <div className="relative aspect-square">
                            <img
                              src={product.image_path}
                              alt={product.name}
                              className="absolute top-0 left-0 w-full h-full object-contain p-4"
                            />
                          </div>
                          <div className="p-4 flex-grow">
                            <h3 className="text-base font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Category: {product.category}
                            </p>
                            
                            <div className="mb-2">
                              <Badge className="text-xs">
                                Confidence: {(product.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            
                            <Separator className="my-2" />
                            
                            <h4 className="text-sm font-semibold mb-2">
                              Similar Products:
                            </h4>
                            
                            <div className="flex gap-2 flex-wrap mb-2">
                              {similarProducts[product.product_id]?.map((similar, idx) => (
                                <Badge 
                                  key={idx}
                                  className="cursor-pointer"
                                  onClick={() => window.open(similar.product_url, '_blank')}
                                >
                                  {similar.brand} - ${similar.price}
                                </Badge>
                              ))}
                            </div>
                            
                            <Button 
                              variant={isProductSelected(product.product_id) ? "default" : "outline"}
                              onClick={() => toggleProductForInspiration(product)}
                              className="w-full"
                            >
                              {isProductSelected(product.product_id) 
                                ? "✓ Selected for Inspiration" 
                                : "Add to Inspiration"}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {inspirationProducts.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold mb-4">
                      🎨 Create Inspiration
                    </h2>
                    
                    <div className="p-4 mb-3">
                      <h3 className="text-base font-semibold mb-3">
                        Selected Products ({inspirationProducts.length})
                      </h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {inspirationProducts.map((product) => (
                          <Card key={product.product_id} className="h-full">
                            <div className="relative aspect-square">
                              <img
                                src={product.image_path}
                                alt={product.name}
                                className="absolute top-0 left-0 w-full h-full object-contain p-4"
                              />
                            </div>
                            <div className="p-2">
                              <p className="text-sm font-semibold">{product.name}</p>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toggleProductForInspiration(product)}
                                className="w-full"
                              >
                                Remove
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      <Button 
                        variant="default"
                        onClick={generateInspiration}
                        disabled={isAnalyzing || inspirationProducts.length === 0}
                        className={`${isAnalyzing ? 'animate-spin' : ''} w-full`}
                      >
                        {isAnalyzing ? 'Generating...' : 'Generate Insbuy Inspiration'}
                      </Button>
                    </div>
                    
                    {generatedInspirations.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">
                          Generated Inspirations
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {generatedInspirations.map((url, idx) => (
                            <Card key={idx} className="h-full">
                              <div className="relative aspect-video">
                                <img
                                  src={url}
                                  alt={`Inspiration ${idx + 1}`}
                                  className="absolute top-0 left-0 w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-4">
                                <h4 className="text-base font-semibold">Inspiration {idx + 1}</h4>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => window.open(url, '_blank')}
                                >
                                  Download
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductExtraction;