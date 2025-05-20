import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ProductCard from './ProductCard';
import InspirationCard from './InspirationCard';
import {
  getProductsByProgramId,
  getInspirationsByProgramId,
} from '~/lib/firestoreService';
import type { Inspiration, Product } from '~/lib/dataTypes';
import { usePrograms } from '../hooks/usePrograms';
import { programIdToTitle } from '~/lib/programUtils';

interface ProgramDetailProps {
  programId: string;
  title: string;
  description: string;
  logoUrl?: string;
}

export default function ProgramDetails({
  programId,
  title,
  description,
  logoUrl,
}: ProgramDetailProps) {
  const [programInspirations, setProgramInspirations] = useState<Inspiration[]>([]);
  const [programProducts, setProgramProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { programs } = usePrograms();

  const fetchInspirations = async (id: string) => {
    try {
      setLoading(true);
      const data = await getInspirationsByProgramId(id);
      setProgramInspirations(data);
    } catch (err) {
      console.error('Failed to fetch inspirations:', err);
      setError('Failed to load inspirations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (id: string) => {
    try {
      const products = await getProductsByProgramId(id);
      setProgramProducts(products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add event listener for product refresh
    const handleProductRefresh = () => {
      if (programId) {
        fetchInspirations(programId);
        fetchProducts(programId);
      }
    };

    window.addEventListener('refreshProducts', handleProductRefresh);

    // Cleanup event listener
    return () => {
      window.removeEventListener('refreshProducts', handleProductRefresh);
    };
  }, []);

  useEffect(() => {
    if (programId) {
      fetchInspirations(programId);
      fetchProducts(programId);
    }
  }, [programId]);

  const handleProductEdit = useCallback(() => {
    if (programId) {
      fetchInspirations(programId);
      fetchProducts(programId);
    }
  }, [programId]);

  const handleProductDelete = useCallback(() => {
    if (programId) {
      fetchInspirations(programId);
      fetchProducts(programId);
    }
  }, [programId]);

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
        <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xl font-semibold">{title}</span>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-lg text-gray-700 mb-4">{description}</p>
          {/* <div className="flex gap-4">
            <Button>Follow Program</Button>
            <Button variant="outline">Share</Button>
          </div> */}
        </div>
      </div>

      <Tabs defaultValue="inspirations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="inspirations">Inspirations</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <div className="min-h-[600px] w-full">
          <TabsContent value="inspirations" className="space-y-4 w-full">
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

          <TabsContent value="products" className="space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {programProducts.map(product => (
                <div className="w-full" key={product.id}>
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    programTitle={programIdToTitle(programs, product.program)}
                    description={product.metadata?.description_in_english}
                    imageUrl={product.image_url}
                    affiliateLink={product.affiliate_link}
                    onEdit={handleProductEdit}
                    onDelete={handleProductDelete}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
