import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import ProductCard from './ProductCard';
import InspirationCard from './InspirationCard';
import { getRecentInspirations } from '~/lib/firestoreService';
import type { Inspiration } from '~/lib/dataTypes';

interface ProgramDetailProps {
  id: number;
  title: string;
  description: string;
  logoText?: string;
  logoUrl?: string;
}

export default function ProgramDetail({
  id,
  title,
  description,
  logoText,
  logoUrl,
}: ProgramDetailProps) {
  const [programInspirations, setProgramInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setLoading(true);
        // In a real app, you would filter by program ID
        // For now, we'll just get the 3 most recent inspirations
        const data = await getRecentInspirations(3);
        setProgramInspirations(data);
      } catch (err) {
        console.error('Failed to fetch inspirations:', err);
        setError('Failed to load inspirations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInspirations();
  }, [id]); // Re-fetch when program ID changes

  // Mock products related to this program
  const programProducts = [1, 2, 3].map(item => ({
    id: item,
    title: `${title} Product ${item}`,
    description: 'Products related to this program',
    price: `$${(item * 99).toString()}`,
  }));

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xl font-semibold">{logoText || `Logo ${id}`}</span>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-lg text-gray-700 mb-4">{description}</p>
          <div className="flex gap-4">
            <Button>Follow Program</Button>
            <Button variant="outline">Share</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="inspirations">Inspirations</TabsTrigger>
        </TabsList>

        <div className="min-h-[600px] w-full">
          <TabsContent value="products" className="space-y-4 w-full">
            <h2 className="text-2xl font-semibold mb-4">Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {programProducts.map(product => (
                <div className="w-full" key={product.id}>
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    program={title}
                    description={product.description}
                    price={product.price}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inspirations" className="space-y-4 w-full">
            <h2 className="text-2xl font-semibold mb-4">Inspirations</h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
            ) : programInspirations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No inspirations found for this program.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {programInspirations.map(inspiration => (
                  <div className="w-full" key={inspiration.id}>
                    <InspirationCard inspiration={inspiration} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
