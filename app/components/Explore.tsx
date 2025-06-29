import type { DocumentSnapshot } from 'firebase/firestore';
import { AlertCircle, Grid, List, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Inspiration, Product, Program } from '~/lib/dataTypes';
import { getAllInspirations, getAllProducts, getAllPrograms } from '~/lib/firestoreService';
import { programIdToTitle } from '~/lib/programUtils';
import InspirationCard from './InspirationCard';
import InspirationModal from './InspirationModal';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import ProgramCard from './ProgramCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PageLayout } from './ui/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function Explore() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('programs');
  const [hasMoreInspirations, setHasMoreInspirations] = useState(true);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [hasMorePrograms, setHasMorePrograms] = useState(true);
  const [lastInspirationDoc, setLastInspirationDoc] = useState<DocumentSnapshot | null>(null);
  const [lastProductDoc, setLastProductDoc] = useState<DocumentSnapshot | null>(null);
  const [lastProgramDoc, setLastProgramDoc] = useState<DocumentSnapshot | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);

  const ITEMS_PER_PAGE = 12;

  // Filter items based on search query
  const filteredInspirations =
    inspirations?.filter(inspiration =>
      inspiration.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredProducts =
    products?.filter(product => product.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    [];

  const filteredPrograms =
    programs?.filter(program => program.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    [];

  const loadMore = useCallback(() => {
    if (loadingMore) return;

    if (activeTab === 'inspirations' && hasMoreInspirations) {
      fetchInspirations(ITEMS_PER_PAGE, true);
    } else if (activeTab === 'products' && hasMoreProducts) {
      fetchProducts(ITEMS_PER_PAGE, true);
    } else if (activeTab === 'programs' && hasMorePrograms) {
      fetchPrograms(ITEMS_PER_PAGE, true);
    }
  }, [
    activeTab,
    loadingMore,
    hasMoreInspirations,
    hasMoreProducts,
    hasMorePrograms,
    lastInspirationDoc,
    lastProductDoc,
    lastProgramDoc,
  ]);

  const fetchInspirations = async (
    limitCount: number = ITEMS_PER_PAGE,
    loadMore: boolean = false
  ) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setLastInspirationDoc(null);
      }

      const response = await getAllInspirations(limitCount, loadMore ? lastInspirationDoc : null);

      setInspirations(prev => (loadMore ? [...prev, ...response.documents] : response.documents));
      setLastInspirationDoc(response.lastDoc);
      setHasMoreInspirations(response.hasMore);
    } catch (err) {
      console.error('Failed to fetch inspirations:', err);
      setError('Failed to load inspirations. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchProducts = async (limitCount: number = ITEMS_PER_PAGE, loadMore: boolean = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setLastProductDoc(null);
      }

      const response = await getAllProducts(limitCount, loadMore ? lastProductDoc : null);

      setProducts(prev => (loadMore ? [...prev, ...response.documents] : response.documents));
      setLastProductDoc(response.lastDoc);
      setHasMoreProducts(response.hasMore);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchPrograms = async (limitCount: number = ITEMS_PER_PAGE, loadMore: boolean = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setLastProgramDoc(null);
      }

      const response = await getAllPrograms(limitCount, loadMore ? lastProgramDoc : null);

      setPrograms(prev => (loadMore ? [...prev, ...response.documents] : response.documents));
      setLastProgramDoc(response.lastDoc);
      setHasMorePrograms(response.hasMore);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
      setError('Failed to load programs. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchInspirations(ITEMS_PER_PAGE);
    fetchProducts(ITEMS_PER_PAGE);
    fetchPrograms(ITEMS_PER_PAGE);

    // Add event listeners for refresh events
    const handleInspirationRefresh = () => fetchInspirations(ITEMS_PER_PAGE);
    const handleProgramRefresh = () => fetchPrograms(ITEMS_PER_PAGE);
    const handleProductRefresh = () => fetchProducts(ITEMS_PER_PAGE);

    window.addEventListener('refreshInspirations', handleInspirationRefresh);
    window.addEventListener('refreshPrograms', handleProgramRefresh);
    window.addEventListener('refreshProducts', handleProductRefresh);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('refreshInspirations', handleInspirationRefresh);
      window.removeEventListener('refreshPrograms', handleProgramRefresh);
      window.removeEventListener('refreshProducts', handleProductRefresh);
    };
  }, []);

  const handleInspirationEdit = useCallback(() => {
    fetchInspirations(ITEMS_PER_PAGE);
  }, []);

  const handleInspirationDelete = useCallback(() => {
    fetchInspirations(ITEMS_PER_PAGE);
  }, []);

  const handleProgramEdit = useCallback(() => {
    fetchPrograms(ITEMS_PER_PAGE);
  }, []);

  const handleProgramDelete = useCallback(() => {
    fetchPrograms(ITEMS_PER_PAGE);
  }, []);

  const handleProductEdit = useCallback(() => {
    fetchProducts(ITEMS_PER_PAGE);
  }, []);

  const handleProductDelete = useCallback(() => {
    fetchProducts(ITEMS_PER_PAGE);
  }, []);

  // Reset pagination when search query changes
  useEffect(() => {
    if (activeTab === 'inspirations') {
      fetchInspirations(ITEMS_PER_PAGE);
    } else if (activeTab === 'products') {
      fetchProducts(ITEMS_PER_PAGE);
    } else if (activeTab === 'programs') {
      fetchPrograms(ITEMS_PER_PAGE);
    }
  }, [searchQuery]);

  // Reset pagination when tab changes
  useEffect(() => {
    if (activeTab === 'inspirations' && inspirations.length === 0) {
      fetchInspirations(ITEMS_PER_PAGE);
    } else if (activeTab === 'products' && products.length === 0) {
      fetchProducts(ITEMS_PER_PAGE);
    } else if (activeTab === 'programs' && programs.length === 0) {
      fetchPrograms(ITEMS_PER_PAGE);
    }
  }, [activeTab]);

  // Determine if we should show the loading indicator based on the current tab and filter state
  const shouldShowLoadingIndicator = (tab: string) => {
    if (loadingMore) return true;

    if (tab === 'inspirations') {
      return hasMoreInspirations;
    } else if (tab === 'products') {
      return hasMoreProducts;
    } else if (tab === 'programs') {
      return hasMorePrograms;
    }

    return false;
  };

  // Add intersection observer to detect when user scrolls to bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const targets = document.querySelectorAll('.auto-load-trigger');
    targets.forEach(target => {
      if (target) {
        observer.observe(target);
      }
    });

    return () => {
      targets.forEach(target => {
        if (target) {
          observer.unobserve(target);
        }
      });
    };
  }, [loadMore, activeTab]);

  const renderLoadMoreButton = (hasMore: boolean) => {
    if (!hasMore) return null;

    return (
      <div className="flex justify-center items-center my-6">
        {loadingMore ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        ) : (
          <>
            <Button onClick={loadMore} variant="default" size="default" className="px-6">
              Load More
            </Button>
            <div className="auto-load-trigger h-4" />
          </>
        )}
      </div>
    );
  };

  return (
    <PageLayout fullHeight={false}>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Explore</h1>
          <div className="flex space-x-2 self-end sm:self-auto">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('grid')}
              className="rounded-md cursor-pointer"
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
              className="rounded-md cursor-pointer"
              aria-label="List view"
            >
              <List className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search inspirations, products, or programs..."
              className="pl-10 bg-white dark:bg-gray-800"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs
          defaultValue="programs"
          className="w-full"
          onValueChange={value => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-2">
            <TabsTrigger value="inspirations" className="flex-1 text-xs sm:text-sm cursor-pointer">
              Inspirations
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1 text-xs sm:text-sm cursor-pointer">
              Products
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex-1 text-xs sm:text-sm cursor-pointer">
              Programs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inspirations">
            {loading && !loadingMore ? (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : filteredInspirations.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-500">No inspirations found.</p>
              </div>
            ) : (
              <>
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full'
                      : 'flex flex-col space-y-3 sm:space-y-4 w-full'
                  }
                >
                  {filteredInspirations.map(inspiration => (
                    <div className="w-full" key={inspiration.id}>
                      <InspirationCard
                        inspiration={inspiration}
                        onEdit={handleInspirationEdit}
                        onDelete={handleInspirationDelete}
                        onImageClick={() => setSelectedInspiration(inspiration)} // Only image opens modal
                      />
                    </div>
                  ))}
                </div>

                {activeTab === 'inspirations' && renderLoadMoreButton(hasMoreInspirations)}
                <InspirationModal inspiration={selectedInspiration} programs={programs} onClose={() => setSelectedInspiration(null)} />
              </>
            )}
          </TabsContent>

          <TabsContent value="products" className="w-full">
            {loading && !loadingMore ? (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-500">No products found.</p>
              </div>
            ) : (
              <>
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full'
                      : 'flex flex-col space-y-3 sm:space-y-4 w-full'
                  }
                >
                  {filteredProducts.map((item, index) => (
                    <div className="w-full" key={item.id || index}>
                      <ProductCard
                        id={item.id}
                        title={item.title}
                        programTitle={programIdToTitle(programs, item.program)}
                        description={item.metadata?.description_in_english}
                        imageUrl={item.image_url}
                        affiliateLink={item.affiliate_link}
                        onEdit={handleProductEdit}
                        onDelete={handleProductDelete}
                        onImageClick={() => setSelectedProduct(item)} // Only image opens modal
                      />
                    </div>
                  ))}
                </div>

                {activeTab === 'products' && renderLoadMoreButton(hasMoreProducts)}
                <ProductModal product={selectedProduct} programs={programs} onClose={() => setSelectedProduct(null)} />
              </>
            )}
          </TabsContent>

          <TabsContent value="programs" className="w-full">
            {loading && !loadingMore ? (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-500">No programs found.</p>
              </div>
            ) : (
              <>
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full'
                      : 'flex flex-col space-y-3 sm:space-y-4 w-full'
                  }
                >
                  {filteredPrograms.map(item => (
                    <div className="w-full" key={item.id}>
                      <ProgramCard
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        logoUrl={item.logo_url}
                        onEdit={handleProgramEdit}
                        onDelete={handleProgramDelete}
                      />
                    </div>
                  ))}
                </div>

                {activeTab === 'programs' && renderLoadMoreButton(hasMorePrograms)}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
