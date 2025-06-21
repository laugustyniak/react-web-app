import React, { useState } from 'react';
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CreateProductModal } from "~/components/modals";
import { generateAffiliateLink } from '~/lib/affiliateLink';
import type { VideoFrame } from '../../types/models';

interface FrameGridProps {
  frames: VideoFrame[];
  selectedFrameIndex: number | null;
  onSelect: (idx: number) => void;
  highlightedFrameIndex?: number | null;
  onDetectProducts?: (frameIndex: number) => void;
  isDetectingProducts?: number | null;
  frameDetectedProducts?: Record<number, any[]>;
  onSearchProduct?: (frameIndex: number, productIndex: number) => void;
  isSearchingProduct?: Record<string, boolean>;
  frameSearchResults?: Record<number, Record<number, any>>;
}

const FrameGrid: React.FC<FrameGridProps> = ({ 
  frames, 
  selectedFrameIndex, 
  onSelect, 
  highlightedFrameIndex, 
  onDetectProducts,
  isDetectingProducts,
  frameDetectedProducts,
  onSearchProduct,
  isSearchingProduct,
  frameSearchResults
}) => {
  const [expandedFrame, setExpandedFrame] = useState<number | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<any>(null);

  const toggleProductExpansion = (frameIndex: number, productIndex: number) => {
    const key = `${frameIndex}-${productIndex}`;
    setExpandedProducts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
  <div>
    <h2 className="text-2xl font-semibold mb-2">All Available Frames</h2>
    <p className="mb-2">📊 Showing all {frames.length} available frames. Click "🔍 Detect Products" to analyze each frame.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
      {frames.map((frame, idx) => {
        const isSelected = selectedFrameIndex === idx;
        const isHighlighted = highlightedFrameIndex === idx;
        const isExpanded = expandedFrame === idx;
        const isDetecting = isDetectingProducts === idx;
        const detectedProducts = frameDetectedProducts?.[idx] || [];
        const hasDetectedProducts = detectedProducts.length > 0 && !detectedProducts[0]?.error;
        const frameSearchResults_current = frameSearchResults?.[idx] || {};
        
        return (
          <Card
            key={frame.frame_id}
            className={`border-2 transition-all duration-300 ${
              isExpanded 
                ? 'col-span-full border-blue-500 ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : isSelected 
                  ? 'border-blue-500 ring-2 ring-blue-400' 
                  : isHighlighted 
                    ? 'border-yellow-400 ring-2 ring-yellow-300' 
                    : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`relative ${isExpanded ? 'aspect-video max-w-md mx-auto' : 'aspect-video'}`}>
              <img
                src={frame.image_url || frame.storage_url || frame.frame_path || `https://picsum.photos/800/450?random=${idx}`}
                alt={`Frame ${idx + 1}`}
                className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
                onClick={() => onSelect(idx)}
              />
              {hasDetectedProducts && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                  ✓ {detectedProducts.length} products
                </div>
              )}
            </div>
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Frame {idx + 1}</p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFrame(isExpanded ? null : idx);
                    }}
                    className="text-xs px-2 py-1"
                  >
                    {isExpanded ? '📉 Collapse' : '📊 Expand'}
                  </Button>
                  
                  {onDetectProducts && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDetectProducts(idx);
                        if (!isExpanded) setExpandedFrame(idx);
                      }}
                      disabled={isDetecting}
                      className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isDetecting ? '⏳' : '🔍'} Detect Products
                    </Button>
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="mt-4 space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Video Timestamp:</strong> {Math.floor((frame.timestamp_ms || 0) / 60000)}:{Math.floor(((frame.timestamp_ms || 0) % 60000) / 1000).toString().padStart(2, '0')}</p>
                    {frame.scene_score && <p><strong>Scene Score:</strong> {frame.scene_score.toFixed(2)}</p>}
                  </div>
                  
                  {isDetecting && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm">🔍 Detecting products...</span>
                    </div>
                  )}
                  
                  {/* Step 1: Show detected products */}
                  {hasDetectedProducts && !isDetecting && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm mb-3">
                        🏷️ Detected Products ({detectedProducts.length})
                      </h4>
                      <div className="space-y-3">
                        {detectedProducts.map((product: any, productIdx: number) => {
                          const searchKey = `${idx}-${productIdx}`;
                          const isExpandedProduct = expandedProducts[searchKey];
                          const isSearching = isSearchingProduct?.[searchKey] || false;
                          const searchResults = frameSearchResults_current[productIdx];
                          const hasSearchResults = searchResults?.search_results?.length > 0;
                          
                          return (
                            <div key={productIdx} className="bg-white dark:bg-gray-700 rounded-lg p-3 border">
                              {/* Product Header */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                    {product.product_name || `Product ${productIdx + 1}`}
                                  </h5>
                                  {product.description_in_english && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      {product.description_in_english}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleProductExpansion(idx, productIdx)}
                                    className="text-xs px-2 py-1"
                                  >
                                    {isExpandedProduct ? '🔼' : '🔽'}
                                  </Button>
                                  {onSearchProduct && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => {
                                        onSearchProduct(idx, productIdx);
                                        if (!isExpandedProduct) toggleProductExpansion(idx, productIdx);
                                      }}
                                      disabled={isSearching}
                                      className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700"
                                    >
                                      {isSearching ? '⏳' : '🔍'} Search
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Step 2: Show search results when expanded */}
                              {isExpandedProduct && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                  {isSearching && (
                                    <div className="flex items-center justify-center py-4">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                      <span className="ml-2 text-sm">🔍 Searching for similar products...</span>
                                    </div>
                                  )}
                                  
                                  {searchResults?.error && (
                                    <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                                      ❌ {searchResults.error}
                                    </div>
                                  )}
                                  
                                  {hasSearchResults && !isSearching && (
                                    <div>
                                      <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                          🛍️ Similar Products ({searchResults.search_results.length})
                                        </h6>
                                        {searchResults.search_query && (
                                          <p className="text-xs text-blue-600 dark:text-blue-400">
                                            Query: "{searchResults.search_query}"
                                          </p>
                                        )}
                                      </div>
                                      
                                      {/* Responsive grid: 1 col mobile, 2-6 cols desktop */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                                        {searchResults.search_results.map((img: any, imgIdx: number) => (
                                          <div key={`${idx}-${productIdx}-${imgIdx}`} className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                                            <div className="aspect-square w-full mb-2 overflow-hidden rounded">
                                              <img 
                                                src={img.thumbnail || img.original} 
                                                alt={img.title || img.source} 
                                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                                onClick={() => window.open(img.link, '_blank')}
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <h6 className="text-xs font-medium text-gray-800 dark:text-gray-200 overflow-hidden" 
                                                  style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                  }}
                                                  title={img.title}>
                                                {img.title || 'Product'}
                                              </h6>
                                              <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                                {img.source || 'Unknown Source'}
                                              </p>
                                              <div className="flex gap-1">
                                                <Button 
                                                  size="sm" 
                                                  variant="outline"
                                                  className="text-xs px-1 py-1 flex-1"
                                                  onClick={() => window.open(img.link, '_blank')}
                                                >
                                                  🔗
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="default"
                                                  className="text-xs px-1 py-1 flex-1 bg-green-600 hover:bg-green-700"
                                                  onClick={() => {
                                                    setModalInitial({
                                                      title: img.title || product.product_name || 'Product from Frame',
                                                      image_url: img.original || img.thumbnail,
                                                      affiliate_link: generateAffiliateLink(img.link) || img.link,
                                                      description: product.description_in_english || `Product found in video frame ${idx + 1}`,
                                                    });
                                                    setModalOpen(true);
                                                  }}
                                                >
                                                  💾
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {!isSearching && !hasSearchResults && !searchResults?.error && searchResults && (
                                    <div className="text-gray-500 text-sm text-center py-4">
                                      🔍 No similar products found. Try adjusting search options.
                                    </div>
                                  )}
                                  
                                  {!searchResults && !isSearching && (
                                    <div className="text-gray-500 text-sm text-center py-2">
                                      Click "🔍 Search" to find similar products
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Show error if product detection failed */}
                  {detectedProducts.length > 0 && detectedProducts[0]?.error && !isDetecting && (
                    <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                      ❌ {detectedProducts[0].error}
                    </div>
                  )}
                  
                  {/* Show message if no products detected yet */}
                  {!isDetecting && detectedProducts.length === 0 && (
                    <div className="text-gray-500 text-sm text-center py-4">
                      Click "🔍 Detect Products" to analyze this frame
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
    
    <CreateProductModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      onSuccess={() => setModalOpen(false)}
      {...(modalInitial ? {
        initialTitle: modalInitial.title,
        initialImageUrl: modalInitial.image_url,
        initialAffiliateLink: modalInitial.affiliate_link,
        initialDescription: modalInitial.description,
      } : {})}
    />
  </div>
  );
};

export default FrameGrid;