import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, AlertCircle, Grid, List } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import InspirationCard from './InspirationCard';
import { getAllInspirations } from '~/lib/firestoreService';
import type { Inspiration } from '~/lib/dataTypes';
import ProductCard from './ProductCard';
import ProgramCard from './ProgramCard';
import { Button } from './ui/button';
import { PageLayout } from './ui/layout';

export default function Explore() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setLoading(true);
        const data = await getAllInspirations();
        setInspirations(data);
      } catch (err) {
        console.error('Failed to fetch inspirations:', err);
        setError('Failed to load inspirations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInspirations();
  }, []);

  const filteredInspirations = inspirations.filter(inspiration =>
    inspiration.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <PageLayout fullHeight={false}>
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Explore</h1>
            <div className="flex space-x-2 self-end sm:self-auto">
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('grid')}
                className="rounded-md"
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
                className="rounded-md"
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

          <Tabs defaultValue="inspirations" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="inspirations" className="flex-1 text-xs sm:text-sm">
                Inspirations
              </TabsTrigger>
              <TabsTrigger value="products" className="flex-1 text-xs sm:text-sm">
                Products
              </TabsTrigger>
              <TabsTrigger value="programs" className="flex-1 text-xs sm:text-sm">
                Programs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inspirations">
              {loading ? (
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
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full'
                      : 'flex flex-col space-y-3 sm:space-y-4 w-full'
                  }
                >
                  {filteredInspirations.map(inspiration => (
                    <div className="w-full" key={inspiration.id}>
                      <InspirationCard inspiration={inspiration} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="programs" className="w-full">
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full'
                    : 'flex flex-col space-y-3 sm:space-y-4 w-full'
                }
              >
                {[1, 2, 3, 4, 5, 6].map(item => (
                  <div className="w-full" key={item}>
                    <ProgramCard
                      id={item}
                      title={`Program ${item}`}
                      description="Popular programs and brands"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="products" className="w-full">
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full'
                    : 'flex flex-col space-y-3 sm:space-y-4 w-full'
                }
              >
                {[1, 2, 3, 4, 5, 6].map(item => (
                  <div className="w-full" key={item}>
                    <ProductCard
                      id={item}
                      title={`Product ${item}`}
                      program={`Program ${item}`}
                      description="Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
                      price="$299"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
      <Footer />
    </>
  );
}
