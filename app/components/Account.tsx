import Header from './Header';
import Footer from './Footer';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDocument } from '../lib/firestore';
import type { User } from '../lib/dataTypes';
import { PageLayout } from './ui/layout';

export default function Account() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // First, initialize with Firebase auth data
        const userData: User = {
          id: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
          phoneNumber: authUser.phoneNumber,
        };

        // Get user document from Firestore
        const firestoreUser = await getDocument<User>('users', authUser.uid, { useCache: true });

        if (firestoreUser) {
          // Merge Firebase auth data with Firestore data
          setUser({
            ...userData,
            ...firestoreUser,
            // Always keep the id and email from Firebase auth
            id: authUser.uid,
            email: authUser.email,
          });
        } else {
          setUser(userData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  if (loading) {
    return (
      <>
        <Header />
        <PageLayout>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </PageLayout>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <PageLayout>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="text-red-600 dark:text-red-400">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </PageLayout>
        <Footer />
      </>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Header />
      <PageLayout fullHeight={false}>
        {/* User Profile Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6 w-full">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 rounded-t-lg"></div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col items-center mb-4">
              <img
                src={user.photoURL || 'https://via.placeholder.com/150'}
                alt={user.displayName || 'User'}
                className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 -mt-16"
              />
              <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                {user.displayName || 'User'}
              </h2>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/account/edit-profile')}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Edit Profile"
              >
                <svg
                  className="h-6 w-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>

              <button
                onClick={() => navigate('/account/change-password')}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Change Password"
              >
                <svg
                  className="h-6 w-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 w-full">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Your Favorites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(item => (
              <ProductCard
                key={item}
                id={item}
                title={`Product ${item}`}
                program={`Program ${item}`}
                description="Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
                price="$299"
              />
            ))}
          </div>
        </div>
      </PageLayout>
      <Footer />
    </>
  );
}
