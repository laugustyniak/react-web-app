
import React, { useState, useEffect } from 'react';
import { getAllVideos, getFramesByVideoId } from '~/lib/firestoreService';
import { DocumentSnapshot } from 'firebase/firestore';
import type { VideoData, VideoFrame, MultipleProducts } from '../types/models';
import VideoSelector from "../components/ProductExtraction/VideoSelector";
import VideoPlayer from "../components/ProductExtraction/VideoPlayer";
import FrameGrid from "../components/ProductExtraction/FrameGrid";
import AnalyzeProductsButton from "../components/ProductExtraction/AnalyzeProductsButton";
import ExtractedProductsList from "../components/ProductExtraction/ExtractedProductsList";
import { Alert, AlertDescription } from "~/components/ui/alert";

const DEFAULT_VIDEO_ID = '8X_m6E3XEaw';

const ProductExtraction = () => {
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
  // Handler for per-product Insbuy AI search
  const handleProductSearchWithAI = async (idx: number, query: string) => {
    setIsSearchingByIdx(prev => ({ ...prev, [idx]: true }));
    setSearchErrorByIdx(prev => ({ ...prev, [idx]: null }));
    setSearchResultsByIdx(prev => ({ ...prev, [idx]: null }));
    try {
      const response = await fetch(`http://localhost:8051/find_image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': "insbuy-a14727b1-58a6-43ad-beae-b393ca192708" },
        body: JSON.stringify({ query })
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
  // Highlighted frame for UI
  const [highlightedFrameIndex, setHighlightedFrameIndex] = useState<number | null>(null);

  // Load all available videos from Firebase on component mount
  useEffect(() => {
    loadVideosFromFirebase();
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
      const videoByUrl = availableVideos.find(v => v.video_url === url);
      if (videoByUrl) {
        setVideoData(videoByUrl);
        await loadFrames(videoByUrl.video_id);
      } else {
        const defaultVideo = availableVideos.find(v => v.video_id === DEFAULT_VIDEO_ID);
        if (defaultVideo) {
          setVideoData(defaultVideo);
          await loadFrames(defaultVideo.video_id);
        } else if (availableVideos.length > 0) {
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
      const descResponse = await fetch(`http://localhost:8051/get_product_description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': "insbuy-a14727b1-58a6-43ad-beae-b393ca192708"
        },
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

  // Product search handler
  const handleProductSearch = async (query: string) => {
    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);
    try {
      // Example: call a search API endpoint (replace with your actual endpoint)
      const response = await fetch(`http://localhost:8051/find_image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': "insbuy-a14727b1-58a6-43ad-beae-b393ca192708" },
        body: JSON.stringify({ query })
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
        <h1 className="text-3xl font-bold mb-4">🎥 Insbuy - Turn Videos into Revenue</h1>
        <p className="mb-4">
          Transform any video content into a powerful sales channel. Insbuy automatically identifies products in your videos
          and connects them to online retailers, creating new revenue streams with zero effort.
        </p>

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
          />
        )}

        {/* Analyze Products Button and Extracted Products List */}
        {selectedFrameIndex !== null && (
          <div className="mb-4 flex flex-col items-center">
            <AnalyzeProductsButton
              isAnalyzing={isAnalyzing}
              onAnalyze={analyzeProducts}
            />
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
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-96">
                  {JSON.stringify(rawFindImagesResults, null, 2)}
                </pre>
              </div>
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