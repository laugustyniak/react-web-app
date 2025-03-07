import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import InspirationCard from './InspirationCard';
import { getAllInspirations } from '~/lib/firestoreService';
import type { Inspiration } from '~/lib/dataTypes';
import ProductCard from './ProductCard';
import ProgramCard from './ProgramCard';
import { Button } from './ui/button';

export default function Explore() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow w-full">
        <div className="px-4 py-6 sm:px-0 w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Explore</h1>
            <div className="flex space-x-2">
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('grid')}
                className="rounded-md"
              >
                Grid
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
                className="rounded-md"
              >
                List
              </Button>
            </div>
          </div>

          <div className="mb-6 w-full">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search for inspiration, programs, products..."
                className="pl-10 py-2 text-base w-full border-gray-200 focus:border-gray-300 focus:ring-0"
              />
            </div>
          </div>

          <Tabs defaultValue="inspirations" className="w-full">
            <TabsList className="flex w-full mb-6 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="inspirations"
                className="flex-1 py-2 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Inspirations
              </TabsTrigger>
              <TabsTrigger
                value="programs"
                className="flex-1 py-2 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                TV Programs & Brands
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="flex-1 py-2 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Products
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inspirations" className="w-full">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-100">
                  {error}
                </div>
              ) : inspirations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No inspirations found.</p>
                </div>
              ) : (
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'
                      : 'flex flex-col space-y-4 w-full'
                  }
                >
                  {inspirations.map(inspiration => (
                    <div className={view === 'grid' ? 'w-full' : 'w-full'} key={inspiration.id}>
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
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'
                    : 'flex flex-col space-y-4 w-full'
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
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'
                    : 'flex flex-col space-y-4 w-full'
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
      </div>
      <Footer />
    </div>
  );
}
