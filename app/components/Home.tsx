import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import InspirationCard from './InspirationCard';
import { getAllInspirations } from '~/lib/firestoreService';
import type { Inspiration } from '~/lib/dataTypes';

export default function Home() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setLoading(true);
        const data = await getAllInspirations();
        console.log('data', data);
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
        <div className="px-4 py-6 sm:px-0">
          <section>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
            ) : inspirations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No inspirations found. Visit the admin page to upload data.
                </p>
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
      </div>

      <Footer />
    </div>
  );
}
