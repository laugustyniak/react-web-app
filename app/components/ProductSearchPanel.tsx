import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import type { Product } from '~/lib/dataTypes';
import { ContentCard } from './ui/layout';

interface ProductSearchPanelProps {
  products: Product[];
  programs: { id: string; title: string }[];
  isLoading: boolean;
  onAddProduct: (product: Product) => void;
}

export default function ProductSearchPanel({
  products,
  programs,
  isLoading,
  onAddProduct,
}: ProductSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper: Map program id to title
  const programIdToTitle = (id: string) => {
    const program = programs.find((p) => p.id === id);
    return program ? program.title : id;
  };

  // Extract unique program titles from filtered products
  const getUniquePrograms = () => {
    const searchFilteredProducts = searchQuery.trim() === ''
      ? products
      : products.filter(product => {
          const query = searchQuery.toLowerCase();
          return (
            product.title.toLowerCase().includes(query) ||
            programIdToTitle(product.program).toLowerCase().includes(query) ||
            (product.metadata?.description_in_english?.toLowerCase().includes(query) || false)
          );
        });
    const uniquePrograms = Array.from(
      new Set(searchFilteredProducts.map(product => programIdToTitle(product.program)))
    ).filter(Boolean);
    return uniquePrograms;
  };

  // Filter products based on search query and selected program title
  useEffect(() => {
    if (searchQuery.trim() === '' && !selectedProgram) {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(product => {
        const matchesSearch = searchQuery.trim() === '' || (
          product.title.toLowerCase().includes(query) ||
          programIdToTitle(product.program).toLowerCase().includes(query) ||
          (product.metadata?.description_in_english?.toLowerCase().includes(query) || false)
        );
        const matchesProgram = !selectedProgram || programIdToTitle(product.program) === selectedProgram;
        return matchesSearch && matchesProgram;
      });
      setFilteredProducts(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, products, selectedProgram, programs]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium mr-1">Filter by program:</span>
          <Button
            variant={selectedProgram === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedProgram(null)}
            className="mb-1"
          >
            All
          </Button>
          {getUniquePrograms().map((program) => (
            <Button
              key={program}
              variant={selectedProgram === program ? 'default' : 'outline'}
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
        {isLoading ? (
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
                  <p className="text-xs text-gray-500 text-center line-clamp-1 mb-2">{programIdToTitle(product.program)}</p>
                  <Button
                    className="w-full bg-primary text-white"
                    size="sm"
                    disabled={!product.image_url}
                    onClick={() => onAddProduct(product)}
                  >
                    Add to Canvas
                  </Button>
                </div>
              ))}
            </div>
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
                      let pageToShow;
                      if (totalPages <= 5) {
                        pageToShow = i + 1;
                      } else if (currentPage <= 3) {
                        pageToShow = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageToShow = totalPages - 4 + i;
                      } else {
                        pageToShow = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageToShow}
                          variant={currentPage === pageToShow ? 'default' : 'outline'}
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
  );
}
