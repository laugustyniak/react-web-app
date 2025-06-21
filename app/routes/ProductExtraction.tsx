import { DocumentSnapshot } from 'firebase/firestore';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  const handleProductDetection = useCallback(async (frameIndex: number) => {
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
  }, [frames, searchOptions]);

  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              🎥
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Product Discovery
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered product identification from video content</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">

        {/* Modern Success Notification */}
        {searchParams.get('video_id') && searchParams.get('video_url') && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white shadow-xl">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Video Successfully Loaded</h3>
                <p className="text-emerald-100 text-sm">
                  Ready to analyze "{videoData?.title || videoData?.video_id || 'Unknown'}" • Click any frame to start product discovery
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Video Selector Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Select Video</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Choose a video to analyze for product discovery</p>
          </div>
          <div className="p-6">
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
          </div>
        </div>

        {/* Modern Error Alert */}
        {error && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white shadow-xl">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Something went wrong</h3>
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Player Card */}
        {videoData && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white">
                  ▶️
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {videoData.title || `Video ${videoData.video_id}`}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {videoData.video_id} • Ready for analysis
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <VideoPlayer videoData={videoData} />
            </div>
          </div>
        )}

        {/* Search Configuration Card */}
        {videoData && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white">
                  ⚙️
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Search Configuration</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Customize location, language, and marketplace preferences</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <SearchOptionsPanel
                searchOptions={searchOptions}
                onOptionsChange={setSearchOptions}
              />
            </div>
          </div>
        )}

        {/* Frame Analysis Card */}
        {frames.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
                  🎞️
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Video Frames</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {frames.length} frames available • Click any frame to start product detection
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
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
            </div>
          </div>
        )}

        {/* Product Analysis Card */}
        {selectedFrameIndex !== null && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white">
                  🔍
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Product Analysis</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Frame {selectedFrameIndex + 1} selected • Analyze to discover products
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                <AnalyzeProductsButton
                  isAnalyzing={isAnalyzing}
                  onAnalyze={analyzeProducts}
                />
              </div>

              {/* Always show found products when they exist */}
              {(extractedProducts || (rawFindImagesResults && rawFindImagesResults.length > 0)) && (
                <div className="space-y-6">
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
                  {/* Raw API Results */}
                  {rawFindImagesResults && rawFindImagesResults.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                      <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">API Debug Results</h3>
                      <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto max-h-96 w-full">
                        {JSON.stringify(rawFindImagesResults, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductExtraction;
