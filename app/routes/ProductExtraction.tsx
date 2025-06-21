import { DocumentSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import SearchOptionsPanel, { type SearchOptions } from '~/components/ProductExtraction/SearchOptionsPanel';
import { Alert, AlertDescription } from "~/components/ui/alert";
import { getAllVideos, getFramesByVideoId } from '~/lib/firestoreService';
import AnalyzeProductsButton from "../components/ProductExtraction/AnalyzeProductsButton";
import ExtractedProductsList from "../components/ProductExtraction/ExtractedProductsList";
import FrameGrid from "../components/ProductExtraction/FrameGrid";
import VideoPlayer from "../components/ProductExtraction/VideoPlayer";
import VideoSelector from "../components/ProductExtraction/VideoSelector";
import type { MultipleProducts, VideoData, VideoFrame } from '../types/models';

const DEFAULT_VIDEO_ID = '8X_m6E3XEaw';


const ProductExtraction = () => {
  // URL parameters for direct video loading
  const [searchParams] = useSearchParams();
  
  // State for raw find_images results (must be declared before any usage)
  const [rawFindImagesResults, setRawFindImagesResults] = useState<any[]>([]);
  // State for video and frame selection
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [frames, setFrames] = useState<VideoFrame[]>([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [availableVideos, setAvailableVideos] = useState<VideoData[]>([]);
  const [lastVideoDoc, setLastVideoDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false);
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
  // Product search state (global panel)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MultipleProducts | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  // Per-extracted-product search state
  const [searchResultsByIdx, setSearchResultsByIdx] = useState<Record<number, any>>({});
  const [isSearchingByIdx, setIsSearchingByIdx] = useState<Record<number, boolean>>({});
  const [searchErrorByIdx, setSearchErrorByIdx] = useState<Record<number, string | null>>({});
  // Search options state
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    location: "United States",
    language: "English",
    hl: "en",
    gl: "us",
    context: "",
    marketplace: ""
  });
  // Handler for per-product Buy It AI search
  const handleProductSearchWithAI = async (idx: number, query: string) => {
    setIsSearchingByIdx(prev => ({ ...prev, [idx]: true }));
    setSearchErrorByIdx(prev => ({ ...prev, [idx]: null }));
    setSearchResultsByIdx(prev => ({ ...prev, [idx]: null }));
    try {
      const response = await fetch(`/api/find_image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query + ' ' + searchOptions.marketplace + ' ' + searchOptions.context, hl: searchOptions.hl, gl: searchOptions.gl, location: searchOptions.location })
      });
      if (!response.ok) {
        const errText = await response.text();
        setSearchErrorByIdx(prev => ({ ...prev, [idx]: `API error: ${errText}` }));
      } else {
        const data = await response.json();
        setSearchResultsByIdx(prev => ({ ...prev, [idx]: data }));
      }
    } catch (err) {
      setSearchErrorByIdx(prev => ({ ...prev, [idx]: err instanceof Error ? err.message : 'Failed to search products' }));
    } finally {
      setIsSearchingByIdx(prev => ({ ...prev, [idx]: false }));
    }
  };

  // Step 1: Detect products in frame
  const handleProductDetection = async (frameIndex: number) => {
    if (!frames[frameIndex]) return;
    
    const frame = frames[frameIndex];
    setIsDetectingProducts(frameIndex);
    
    try {
      const imageUrl = frame.storage_url || frame.image_url || frame.frame_path;
      if (!imageUrl) {
        throw new Error('No image URL available for this frame');
      }

      console.log(`Detecting products in frame ${frameIndex + 1}`);
      
      // Convert hosted image to base64 for get_product_description API
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

      // Call get_product_description API
      const descResponse = await fetch('/api/get_product_description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          base64_image: base64, 
          language: searchOptions.language.toLowerCase() || 'english' 
        })
      });

      if (!descResponse.ok) {
        const errText = await descResponse.text();
        throw new Error(`Product description API error: ${errText}`);
      }

      const descData = await descResponse.json();
      console.log(`Frame ${frameIndex + 1} detected products:`, descData);
      
      // Extract products from API response
      let products = [];
      if (descData && Array.isArray(descData.products)) {
        products = descData.products;
      } else if (descData && descData.result && Array.isArray(descData.result.products)) {
        products = descData.result.products;
      } else {
        throw new Error('No products found in frame');
      }

      // Store detected products
      setFrameDetectedProducts(prev => ({
        ...prev,
        [frameIndex]: products
      }));

    } catch (error) {
      console.error(`Error detecting products in frame ${frameIndex + 1}:`, error);
      setFrameDetectedProducts(prev => ({
        ...prev,
        [frameIndex]: [{ error: error instanceof Error ? error.message : 'Unknown error' }]
      }));
    } finally {
      setIsDetectingProducts(null);
    }
  };

  
  // Highlighted frame for UI
  const [highlightedFrameIndex, setHighlightedFrameIndex] = useState<number | null>(null);
  
  // Individual frame analysis state
  const [frameAnalysisResults, setFrameAnalysisResults] = useState<Record<number, any>>({});
  const [isAnalyzingFrame, setIsAnalyzingFrame] = useState<number | null>(null);
  
  // Step-by-step analysis state
  const [frameDetectedProducts, setFrameDetectedProducts] = useState<Record<number, any[]>>({});
  const [isDetectingProducts, setIsDetectingProducts] = useState<number | null>(null);
  const [frameSearchResults, setFrameSearchResults] = useState<Record<number, Record<number, any>>>({});
  const [isSearchingProduct, setIsSearchingProduct] = useState<Record<string, boolean>>({});

  // Load all available videos from Firebase on component mount
  useEffect(() => {
    loadVideosFromFirebase();
    
    // Check for URL parameters for direct video loading
    const urlVideoId = searchParams.get('video_id');
    const urlVideoUrl = searchParams.get('video_url');
    
    if (urlVideoId && urlVideoUrl) {
      console.log('Loading video from URL parameters:', { urlVideoId, urlVideoUrl });
      setVideoUrl(decodeURIComponent(urlVideoUrl));
      // We'll load the specific video after the videos are loaded from Firebase
    } else if (videoUrl === '') {
      setVideoUrl('https://www.youtube.com/watch?v=8X_m6E3XEaw');
    }
  }, []);

  // Handle URL parameter video loading after videos are loaded
  useEffect(() => {
    const urlVideoId = searchParams.get('video_id');
    const urlVideoUrl = searchParams.get('video_url');
    
    if (urlVideoId && urlVideoUrl && availableVideos.length > 0 && !videoData) {
      const decodedUrl = decodeURIComponent(urlVideoUrl);
      console.log('Attempting to load video from URL params:', { urlVideoId, decodedUrl });
      
      // Try to find the video in available videos
      const targetVideo = availableVideos.find(v => v.video_id === urlVideoId || v.video_url === decodedUrl);
      
      if (targetVideo) {
        console.log('Found video in available videos:', targetVideo);
        setVideoData(targetVideo);
        setVideoUrl(targetVideo.video_url);
        loadFrames(targetVideo.video_id);
      } else {
        console.log('Video not found in available videos, creating temporary video data');
        // Create temporary video data for videos not in Firebase
        const tempVideoData: VideoData = {
          video_id: urlVideoId,
          video_url: decodedUrl,
          title: `Video ${urlVideoId}`,
          is_processed: false
        };
        setVideoData(tempVideoData);
        setVideoUrl(decodedUrl);
        loadFrames(urlVideoId);
      }
    }
  }, [availableVideos, searchParams]);

  // Load videos from Firestore
  const loadVideosFromFirebase = async () => {
    try {
      setIsLoadingVideos(true);
      const { documents, lastDoc, hasMore } = await getAllVideos(200, lastVideoDoc); // Load up to 200 videos by default
      setAvailableVideos(prev => [...prev, ...documents]);
      setLastVideoDoc(lastDoc);
      setHasMoreVideos(hasMore);
      // Only set default video if no URL parameters are present
      const urlVideoId = searchParams.get('video_id');
      const urlVideoUrl = searchParams.get('video_url');
      
      if (documents.length > 0 && !videoData && !urlVideoId && !urlVideoUrl) {
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

  // Load ALL videos from Firebase
  const loadAllVideos = async () => {
    if (isLoadingVideos) return;

    try {
      setIsLoadingVideos(true);
      setError(null);

      let allVideos: VideoData[] = [...availableVideos];
      let currentLastDoc = lastVideoDoc;
      let hasMore = hasMoreVideos;

      // Keep loading batches until we have all videos
      while (hasMore) {
        const { documents, lastDoc, hasMore: moreAvailable } = await getAllVideos(50, currentLastDoc);
        allVideos = [...allVideos, ...documents];
        currentLastDoc = lastDoc;
        hasMore = moreAvailable;
      }

      // Update state with all videos
      setAvailableVideos(allVideos);
      setLastVideoDoc(currentLastDoc);
      setHasMoreVideos(false);

      // Set default video if none selected
      if (!videoData && allVideos.length > 0) {
        const defaultVideo = allVideos.find(v => v.video_id === DEFAULT_VIDEO_ID) || allVideos[0];
        setVideoData(defaultVideo);
        await loadFrames(defaultVideo.video_id);
      }

      console.log(`Loaded ${allVideos.length} videos total`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load all videos from Firebase');
    } finally {
      setIsLoadingVideos(false);
    }
  };


  const loadFrames = async (videoId: string) => {
    try {
      setError(null);
      setIsAnalyzing(true);
      const framesData = await getFramesByVideoId(videoId);
      const formattedFrames: VideoFrame[] = framesData.map((frame, idx) => ({
        frame_id: frame.frame_id || `frame_${idx}_${Date.now()}`,
        video_id: frame.video_id,
        frame_number: frame.frame_number || idx + 1,
        timestamp_ms: frame.timestamp_ms || (idx + 1) * 10000,
        frame_path: frame.frame_path,
        storage_url: frame.storage_url,
        image_url: frame.storage_url || frame.frame_path || `https://picsum.photos/800/450?random=${idx}`,
        scene_score: frame.scene_score || Math.random()
      }));
      setFrames(formattedFrames);
      setSelectedFrameIndex(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load frames');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyze products in a selected frame
  const analyzeProducts = async () => {
    if (selectedFrameIndex === null || !frames[selectedFrameIndex]) return;
    setIsAnalyzing(true);
    setError(null);
    setExtractedProducts(null);
    setExtractedProductsError(null);
    setIsExtractedProductsLoading(true);
    try {
      const selectedFrame = frames[selectedFrameIndex];
      const imageUrl = selectedFrame.image_url || selectedFrame.storage_url || selectedFrame.frame_path;
      if (!imageUrl) throw new Error('No image available for selected frame');
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
      const descResponse = await fetch(`/api/get_product_description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64_image: base64, language: 'english' })
      });
      if (!descResponse.ok) {
        const errText = await descResponse.text();
        setExtractedProductsError(`API error: ${errText}`);
      } else {
        const descData = await descResponse.json();
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
  };

  // Unified product search handler - handles both global search and per-product search
  const handleProductSearch = async (query: string, frameIndex?: number, productIndex?: number) => {
    // If frameIndex and productIndex are provided, this is a per-product search
    const isPerProductSearch = frameIndex !== undefined && productIndex !== undefined;
    
    if (isPerProductSearch) {
      const detectedProducts = frameDetectedProducts[frameIndex];
      if (!detectedProducts || !detectedProducts[productIndex]) return;
      
      const product = detectedProducts[productIndex];
      const searchKey = `${frameIndex}-${productIndex}`;
      
      setIsSearchingProduct(prev => ({ ...prev, [searchKey]: true }));
      
      try {
        const searchQuery = query || `${product.product_name || ''} ${product.description_in_english || ''} ${searchOptions.marketplace} ${searchOptions.context}`.trim();
        
        console.log(`Searching for similar products for "${product.product_name}"`);
        
        const searchResponse = await fetch('/api/find_image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            location: searchOptions.location,
            gl: searchOptions.gl,
            hl: searchOptions.hl,
            marketplace: searchOptions.marketplace,
            context: searchOptions.context
          })
        });

        if (!searchResponse.ok) {
          const errText = await searchResponse.text();
          throw new Error(`Search API error: ${errText}`);
        }

        const searchData = await searchResponse.json();
        console.log(`Found ${searchData.serpapi_response?.images_results?.length || 0} similar products`);
        
        // Store search results for per-product search
        setFrameSearchResults(prev => ({
          ...prev,
          [frameIndex]: {
            ...prev[frameIndex],
            [productIndex]: {
              search_results: searchData.serpapi_response?.images_results || [],
              search_query: searchQuery,
              original_product: product
            }
          }
        }));

      } catch (error) {
        console.error(`Error searching for product:`, error);
        setFrameSearchResults(prev => ({
          ...prev,
          [frameIndex]: {
            ...prev[frameIndex],
            [productIndex]: {
              search_results: [],
              search_query: '',
              original_product: product,
              error: error instanceof Error ? error.message : 'Search failed'
            }
          }
        }));
      } finally {
        setIsSearchingProduct(prev => ({ ...prev, [searchKey]: false }));
      }
    } else {
      // Global search (original functionality)
      setIsSearching(true);
      setSearchError(null);
      setSearchResults(null);
      
      try {
        const response = await fetch(`/api/find_image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: query + ' ' + searchOptions.marketplace + ' ' + searchOptions.context, 
            hl: searchOptions.hl, 
            gl: searchOptions.gl, 
            location: searchOptions.location 
          })
        });
        
        if (!response.ok) {
          const errText = await response.text();
          setSearchError(`API error: ${errText}`);
        } else {
          const data = await response.json();
          if (data && Array.isArray(data.products)) {
            setSearchResults({ products: data.products });
          } else if (data && data.result && Array.isArray(data.result.products)) {
            setSearchResults({ products: data.result.products });
          } else {
            setSearchError('Unexpected API response format');
          }
        }
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Failed to search products');
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Handlers for editing extracted products
  const handleEditClick = (idx: number, prod: { product_name: string; description_in_english: string }) => {
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
  const handleSave = (idx: number) => {
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
    <div className="container mx-auto px-4 py-8">
      <div className="py-4">
        <h1 className="text-3xl font-bold mb-4">🎥 Buy It - Turn Videos into Revenue</h1>
        <p className="mb-4">
          Transform any video content into a powerful sales channel. Buy It automatically identifies products in your videos
          and connects them to online retailers, creating new revenue streams with zero effort.
        </p>

        {/* Notification when coming from VideoFrameExtraction */}
        {searchParams.get('video_id') && searchParams.get('video_url') && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✅ Video loaded from Frame Extraction
                </h3>
                <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                  <p>Successfully loaded video "{videoData?.title || videoData?.video_id || 'Unknown'}". Click "🔍 Search" on any frame to find products!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Selector */}
        <VideoSelector
          availableVideos={availableVideos}
          videoData={videoData}
          DEFAULT_VIDEO_ID={DEFAULT_VIDEO_ID}
          hasMoreVideos={hasMoreVideos}
          isLoadingVideos={isLoadingVideos}
          onSelect={async (video) => {
            setVideoData(video);
            setVideoUrl(video.video_url);
            await loadFrames(video.video_id);
          }}
          onLoadMore={loadMoreVideos}
          onLoadAll={loadAllVideos}
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Video Player */}
        {videoData && (
          <VideoPlayer videoData={videoData} />
        )}

        {/* Search Options Panel */}
        {videoData && (
          <div className="mb-6">
            <SearchOptionsPanel
              searchOptions={searchOptions}
              onOptionsChange={setSearchOptions}
            />
          </div>
        )}

        {/* Frame Grid */}
        {frames.length > 0 && (
          <FrameGrid
            frames={frames}
            selectedFrameIndex={selectedFrameIndex}
            onSelect={(idx) => {
              setSelectedFrameIndex(idx);
              setHighlightedFrameIndex(idx);
            }}
            highlightedFrameIndex={highlightedFrameIndex}
            onDetectProducts={handleProductDetection}
            isDetectingProducts={isDetectingProducts}
            frameDetectedProducts={frameDetectedProducts}
            onSearchProduct={(frameIndex: number, productIndex: number) => 
              handleProductSearch('', frameIndex, productIndex)
            }
            isSearchingProduct={isSearchingProduct}
            frameSearchResults={frameSearchResults}
          />
        )}

        {/* Analyze Products Button and Extracted Products List */}
        {selectedFrameIndex !== null && (
          <div className="mb-4 flex flex-col items-center">
            <AnalyzeProductsButton
              isAnalyzing={isAnalyzing}
              onAnalyze={analyzeProducts}
            />

            {/* Always show found products when they exist */}
            {(extractedProducts || (rawFindImagesResults && rawFindImagesResults.length > 0)) && (
              <>
                <ExtractedProductsList
                  extractedProducts={extractedProducts}
                  isLoading={isExtractedProductsLoading}
                  error={extractedProductsError}
                  editingProductIndex={editingProductIndex}
                  editValues={editValues}
                  onEditClick={(idx, product_name, description_in_english) => handleEditClick(idx, { product_name, description_in_english })}
                  onEditChange={handleEditChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onSearchWithAI={handleProductSearchWithAI}
                  searchResultsByIdx={searchResultsByIdx}
                  isSearchingByIdx={isSearchingByIdx}
                  searchErrorByIdx={searchErrorByIdx}
                />
                {/* Raw find_images results display */}
                {rawFindImagesResults && rawFindImagesResults.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-2">Raw find_images API Results</h2>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-96 w-full">
                      {JSON.stringify(rawFindImagesResults, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Product Search Panel */}
        {/* <ProductSearchPanel
          searchQuery={searchQuery}
          onSearchQueryChange={(e) => setSearchQuery(e.target.value)}
          onSearch={() => handleProductSearch(searchQuery)}
          isSearching={isSearching}
          searchResults={searchResults && Array.isArray(searchResults.products) ? searchResults.products : []}
          searchError={searchError}
        /> */}
      </div>
    </div>
  );
};

export default ProductExtraction;
