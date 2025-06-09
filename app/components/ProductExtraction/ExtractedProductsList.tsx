import React, { useState } from 'react';
import { CreateProductModal } from "~/components/modals";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { generateAffiliateLink } from '~/lib/affiliateLink';
import type { MultipleProducts } from '../../types/models';

interface ExtractedProductsListProps {
  extractedProducts: MultipleProducts | null;
  isLoading: boolean;
  error: string | null;
  editingProductIndex: number | null;
  editValues: { product_name: string; description_in_english: string } | null;
  onEditClick: (idx: number, product_name: string, description_in_english: string) => void;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: (idx: number) => void;
  onCancel: () => void;
  onSearchWithAI: (idx: number, query: string) => void;
  searchResultsByIdx: Record<number, any>;
  isSearchingByIdx: Record<number, boolean>;
  searchErrorByIdx: Record<number, string | null>;
  onSaveProductFromImage?: (product: any) => void;
}


const ExtractedProductsList: React.FC<ExtractedProductsListProps> = ({
  extractedProducts,
  isLoading,
  error,
  editingProductIndex,
  editValues,
  onEditClick,
  onEditChange,
  onSave,
  onCancel,
  onSearchWithAI,
  searchResultsByIdx,
  isSearchingByIdx,
  searchErrorByIdx,
  onSaveProductFromImage,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<any>(null);
  // Track expanded/collapsed state for each product by index
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleProduct = (idx: number) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div>
      {isLoading && (
        <Alert className="mb-2"><AlertDescription>🔎 Insbuy AI is looking for products in the image...</AlertDescription></Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-2"><AlertDescription>{error}</AlertDescription></Alert>
      )}
      {extractedProducts && extractedProducts.products && extractedProducts.products.length > 0 && (
        <div>
          {extractedProducts.products.map((prod, idx) => {
            const isEditing = editingProductIndex === idx;
            const isExpanded = expanded[idx];
            return (
              <div key={prod.product_id || idx} className="mb-4 w-full">
                <Card className="w-full">
                  <div className="p-4 w-full">
                    {/* Toggle Button */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold">{prod.product_name}</span>
                      <Button size="sm" variant="ghost" onClick={() => toggleProduct(idx)}>
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                    {isExpanded && (
                      <div>
                        {isEditing && editValues ? (
                          <>
                            <input
                              className="mb-2 w-full border rounded px-2 py-1"
                              name="product_name"
                              value={editValues.product_name}
                              onChange={onEditChange}
                              placeholder="Product Name"
                            />
                            <textarea
                              className="mb-2 w-full border rounded px-2 py-1"
                              name="description_in_english"
                              value={editValues.description_in_english}
                              onChange={onEditChange}
                              placeholder="Description (EN)"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="default" onClick={() => onSave(idx)}>Save</Button>
                              <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-sm mb-1"><strong>Description:</strong> {prod.description_in_english}</p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" onClick={() => onEditClick(idx, prod.product_name, prod.description_in_english)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => onSearchWithAI(idx, prod.product_name)} disabled={isSearchingByIdx[idx]}>
                                {isSearchingByIdx[idx] ? 'Searching...' : 'Search with Insbuy AI'}
                              </Button>
                            </div>
                            {searchErrorByIdx[idx] && (
                              <Alert variant="destructive" className="mt-2 mb-2"><AlertDescription>{searchErrorByIdx[idx]}</AlertDescription></Alert>
                            )}
                            {searchResultsByIdx[idx] && (
                              <div className="mt-2">
                                {/* Try to parse and show images_results if available */}
                                {(() => {
                                  const result = searchResultsByIdx[idx];
                                  const images = result?.serpapi_response?.images_results;
                                  if (Array.isArray(images) && images.length > 0) {
                                    return (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {images.map((img, i) => (
                                          <div key={img.link || i} className="bg-white rounded shadow p-2 flex flex-col items-center">
                                            <a href={img.link} target="_blank" rel="noopener noreferrer">
                                              <img src={img.thumbnail || img.original} alt={img.title || img.source} className="w-32 h-32 object-cover rounded mb-2 border" />
                                            </a>
                                            <div className="text-xs font-semibold text-center mb-1 line-clamp-2" title={img.title}>{img.title}</div>
                                            <a href={img.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs break-all">{img.source || 'Visit'}</a>
                                            <Button size="sm" variant="default" className="mt-2"
                                              onClick={() => {
                                                setModalInitial({
                                                  title: img.title,
                                                  image_url: img.original || img.thumbnail,
                                                  affiliate_link: generateAffiliateLink(img.link) || img.link,
                                                  description: `${prod.product_name} ${prod.description_in_english}`,
                                                });
                                                setModalOpen(true);
                                              }}
                                            >
                                              Save Product
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }
                                  // fallback: show raw
                                  return (
                                    <div className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-60">
                                      <strong>Raw Insbuy AI Result:</strong>
                                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(result, null, 2)}</pre>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
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

export default ExtractedProductsList;
