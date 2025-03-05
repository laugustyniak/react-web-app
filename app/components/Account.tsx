import Header from './Header';
import Footer from './Footer';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDocument } from '../lib/firestore';
import type { User } from '../lib/dataTypes';

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
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-red-600">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
        {/* User Profile Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 rounded-t-lg"></div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col items-center mb-4">
              <img
                src={user.photoURL || 'https://via.placeholder.com/150'}
                alt={user.displayName || 'User'}
                className="h-24 w-24 rounded-full border-4 border-white -mt-16"
              />
              <h2 className="mt-2 text-xl font-bold text-gray-900">{user.displayName || 'User'}</h2>
            </div>
            <div className="flex justify-center space-x-4">
              {/* <button
                onClick={() => navigate('/account/notifications')}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Notifications"
              >
                <svg
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button> */}

              <button
                onClick={() => navigate('/account/edit-profile')}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Edit Profile"
              >
                <svg
                  className="h-6 w-6 text-gray-700"
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
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Change Password"
              >
                <svg
                  className="h-6 w-6 text-gray-700"
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
      </div>
      <Footer />
    </div>
  );
}
