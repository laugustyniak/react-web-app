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

export default function Explore() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow w-full">
        <div className="px-4 py-6 sm:px-0 w-full">
          <h1 className="text-3xl font-bold mb-6">Explore</h1>

          <div className="mb-8 w-full">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search for inspiration, programs, products..."
                className="pl-10 py-6 text-lg w-full rounded-lg shadow-md"
              />
            </div>
          </div>

          <Tabs defaultValue="inspirations" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="inspirations">Inspirations</TabsTrigger>
              <TabsTrigger value="programs">TV Programs & Brands</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>

            <div className="min-h-[800px] w-full">
              <TabsContent value="inspirations" className="space-y-4 w-full">
                <h2 className="text-2xl font-semibold mb-4">Inspirations</h2>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
                ) : inspirations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No inspirations found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {inspirations.map(inspiration => (
                      <div className="w-full" key={inspiration.id}>
                        <InspirationCard inspiration={inspiration} />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="programs" className="space-y-4 w-full">
                <h2 className="text-2xl font-semibold mb-4">TV Programs & Brands</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
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

              <TabsContent value="products" className="space-y-4 w-full">
                <h2 className="text-2xl font-semibold mb-4">Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
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
            </div>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
