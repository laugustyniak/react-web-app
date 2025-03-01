import Account from '~/components/Account';
import ProtectedRoute from '~/components/ProtectedRoute';
import { useAuth } from '~/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '~/lib/firebase';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Account - Insbay' }, { name: 'description', content: 'Account' }];
}

// Define the type for favorite product documents from Firestore
interface FavoriteProduct {
  id: string;
  productId?: string;
  productName?: string;
  name?: string;
  productImageUrl?: string;
  imageUrl?: string;
  productPrice?: number;
  price?: number;
  [key: string]: any; // For any other fields that might be in the document
}

export default function AccountRoute() {
  const { user } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState<
    Array<{
      id: string;
      name: string;
      imageUrl: string;
      price: number;
    }>
  >([]);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (user?.uid) {
        try {
          // Access the subcollection at /users/{uid}/favorites
          const favoritesRef = collection(db, 'users', user.uid, 'favorites');
          const favoritesSnapshot = await getDocs(favoritesRef);

          const favorites: FavoriteProduct[] = favoritesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setFavoriteProducts(
            favorites.map(fav => ({
              id: fav.productId || fav.id,
              name: fav.productName || fav.name || '',
              imageUrl: fav.productImageUrl || fav.imageUrl || '',
              price: fav.productPrice || fav.price || 0,
            }))
          );
        } catch (error) {
          console.error('Error fetching favorite products:', error);
        }
      }
    };

    fetchFavoriteProducts();
  }, [user]);

  return (
    <ProtectedRoute>
      <Account
        favoriteProducts={favoriteProducts}
        user={{
          name: user?.displayName || 'User',
          photoUrl: user?.photoURL || 'https://via.placeholder.com/150',
        }}
      />
    </ProtectedRoute>
  );
}
