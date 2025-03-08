import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import InspirationCard from './InspirationCard';
import { getStarredInspirations } from '~/lib/firestoreService';
import type { Inspiration } from '~/lib/dataTypes';
import { useAuth } from '~/contexts/AuthContext';
import { PageLayout } from './ui/layout';
import { AlertCircle } from 'lucide-react';

export default function Starred() {
  const { user } = useAuth();
  const [starredInspirations, setStarredInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStarredInspirations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getStarredInspirations(user.uid);
        setStarredInspirations(data);
      } catch (err) {
        console.error('Failed to fetch starred inspirations:', err);
        setError('Failed to load starred inspirations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStarredInspirations();
  }, [user]);

  return (
    <>
      <Header />
      <PageLayout fullHeight={false}>
        <div className="w-full">
          {/* <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Starred Inspirations</h1>
          </div> */}

          <section className="w-full">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : !user ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Please sign in to view your starred inspirations.</p>
              </div>
            ) : starredInspirations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't starred any inspirations yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {starredInspirations.map(inspiration => (
                  <InspirationCard key={inspiration.id} inspiration={inspiration} />
                ))}
              </div>
            )}
          </section>
        </div>
      </PageLayout>
      <Footer />
    </>
  );
}
