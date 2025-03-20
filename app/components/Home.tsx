import { useState, useEffect } from 'react';
import InspirationCard from './InspirationCard';
import { getAllInspirations } from '~/lib/firestoreService';
import type { Inspiration } from '~/lib/dataTypes';
import { PageLayout } from './ui/layout';

export default function Home() {
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
    <PageLayout fullHeight={false}>
      <div className="w-full">
        {/* <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Home</h1>
          </div> */}

        <section className="w-full">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded flex items-center gap-2">
              {error}
            </div>
          ) : inspirations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No inspirations found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inspirations.map(inspiration => (
                <InspirationCard key={inspiration.id} inspiration={inspiration} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
