import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import InspirationCard from './InspirationCard';
import { getStarredInspirations } from '~/lib/firestoreService';
import type { Inspiration } from '~/lib/dataTypes';
import { useAuth } from '~/contexts/AuthContext';

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
      </div>

      <Footer />
    </div>
  );
}
