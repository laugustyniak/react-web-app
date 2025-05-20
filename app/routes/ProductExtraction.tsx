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

// Mock types
interface VideoData {
  video_id: string;
  video_url: string;
  duration_ms: number;
}

interface VideoFrame {
  frame_id: string;
  video_id: string;
  frame_number: number;
  timestamp_ms: number;
  frame_path: string;
  scene_score?: number;
}

interface Product {
  product_id: string;
  frame_id: string;
  name: string;
  category: string;
  confidence: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  image_path: string;
}

interface SimilarProduct {
  product_id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  image_url: string;
  product_url: string;
  similarity_score: number;
}

const ProductExtraction = () => {
  // State for video and frame selection
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [frames, setFrames] = useState<VideoFrame[]>([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  
  // State for product analysis
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Record<string, SimilarProduct[]>>({});
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [inspirationProducts, setInspirationProducts] = useState<Product[]>([]);
  const [generatedInspirations, setGeneratedInspirations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Example video URLs
  const exampleVideos = [
    'https://www.youtube.com/watch?v=LCmYC2qeqM0',
    'https://www.youtube.com/watch?v=8X_m6E3XEaw'
  ];

  // Mock API calls
  const loadVideo = async (url: string) => {
    try {
      setError(null);
      
      // Mock API call
      const response = await fetch('/api/videos/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: url })
      });
      
      if (!response.ok) throw new Error('Failed to load video');
      
      // Mock response
      const data: VideoData = {
        video_id: 'video_' + Date.now(),
        video_url: url,
        duration_ms: 180000 // Mock 3 minutes duration
      };
      
      setVideoData(data);
      
      // Load frames for this video
      await loadFrames(data.video_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const loadFrames = async (videoId: string) => {
    try {
      // Mock API call
      const response = await fetch(`/api/frames/list?video_id=${videoId}`);
      
      if (!response.ok) throw new Error('Failed to load frames');
      
      // Mock data for frames
      const mockFrames: VideoFrame[] = Array(9).fill(null).map((_, idx) => ({
        frame_id: `frame_${idx}_${Date.now()}`,
        video_id: videoId,
        frame_number: idx + 1,
        timestamp_ms: (idx + 1) * 10000,
        frame_path: `https://picsum.photos/800/450?random=${idx}`, // Mock image URL
        scene_score: Math.random()
      }));
      
      setFrames(mockFrames);
      // Clear previous selections
      setSelectedFrameIndex(null);
      setProducts([]);
      setSimilarProducts({});
      setInspirationProducts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load frames');
    }
  };

  const analyzeProducts = async () => {
    if (selectedFrameIndex === null || !frames[selectedFrameIndex]) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Get selected frame
      const selectedFrame = frames[selectedFrameIndex];
      
      // Mock API call to analyze products
      const response = await fetch('/api/products/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame_id: selectedFrame.frame_id })
      });
      
      if (!response.ok) throw new Error('Failed to analyze products');
      
      // Mock product detection
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
      
      // Mock API call to find similar products
      const searchResponse = await fetch('/api/products/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          products: mockProducts.map(p => p.product_id)
        })
      });
      
      if (!searchResponse.ok) throw new Error('Failed to search for similar products');
      
      // Generate mock similar products
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
    } finally {
      setIsAnalyzing(false);
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
      const response = await fetch('/api/inspirations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          <h2 className="text-xl font-semibold">Example Video Links:</h2>
          <div className="flex flex-wrap gap-2">
            {exampleVideos.map((url, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="cursor-pointer"
                onClick={() => setVideoUrl(url)}
              >
                Example {index + 1}
              </Badge>
            ))}
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
                  {frames.map((frame, idx) => (
                    <Card 
                      key={frame.frame_id}
                      className="cursor-pointer border-none transition-transform hover:scale-102"
                      onClick={() => setSelectedFrameIndex(idx)}
                    >
                      <div className="relative aspect-video">
                        <img
                          src={frame.frame_path}
                          alt={`Frame ${idx + 1}`}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-sm">Frame {idx + 1}</p>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {selectedFrameIndex !== null && (
                  <div className="mb-4 flex justify-center">
                    <Button 
                      variant="default" 
                      onClick={analyzeProducts}
                      disabled={isAnalyzing}
                      className={`${isAnalyzing ? 'animate-spin' : ''}`}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze and Find Products'}
                    </Button>
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