import Header from './Header';
import Footer from './Footer';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router';

export default function Account(props: {
  user: {
    name: string;
    photoUrl: string;
  };
  favoriteProducts: Array<{
    id: string;
    name: string;
    imageUrl: string;
    price: number;
  }>;
}) {
  const navigate = useNavigate();

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
                src={props.user.photoUrl}
                alt={props.user.name}
                className="h-24 w-24 rounded-full border-4 border-white -mt-16"
              />
              <h2 className="mt-2 text-xl font-bold text-gray-900">{props.user.name}</h2>
            </div>
            <div className="flex justify-center space-x-4">
              <button
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
              </button>

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

        {/* Favorite Products Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Favorite Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {props.favoriteProducts.map(product => (
                <ProductCard
                  key={product.id}
                  id={Number(product.id)}
                  title={product.name}
                  program={product.name}
                  description={product.name}
                  price={product.price.toString()}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
