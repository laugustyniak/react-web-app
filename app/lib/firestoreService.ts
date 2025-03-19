import type { Inspiration, Comment, Product } from './dataTypes';
import { getDocument, queryDocuments, getCollection } from './firestore';
import { orderBy, limit } from 'firebase/firestore';

/**
 * Fetches comments for a specific content ID
 */
export const getCommentsByContentId = async (contentId: string): Promise<Comment[]> => {
  try {
    const comments = await queryDocuments<Comment>(
      'comments',
      [{ field: 'contentId', operator: '==', value: contentId }],
      { orderByField: 'date', orderDirection: 'desc' }
    );

    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

/**
 * Fetches all inspirations from Firestore
 */
export const getAllInspirations = async (): Promise<Inspiration[]> => {
  try {
    const { documents } = await getCollection<Inspiration>('inspirations', {
      queryConstraints: [orderBy('date', 'desc')],
    });

    return documents;
  } catch (error) {
    console.error('Error fetching inspirations from Firestore:', error);
    throw error;
  }
};

/**
 * Fetches a single inspiration by ID
 */
export const getInspirationById = async (id: string): Promise<Inspiration | null> => {
  try {
    const inspiration = await getDocument<Inspiration>('inspirations', id, { useCache: true });

    if (!inspiration) {
      return null;
    }

    // Handle the case where the field might still be called 'likes' in the database
    if (!inspiration.stars && 'likes' in inspiration) {
      inspiration.stars = inspiration.likes as number;
    }

    // Ensure starredBy exists
    if (!inspiration.starredBy) {
      inspiration.starredBy = [];
    }

    return inspiration;
  } catch (error) {
    console.error('Error fetching inspiration by ID:', error);
    return null;
  }
};

/**
 * Fetches a limited number of recent inspirations
 */
export const getRecentInspirations = async (limitCount: number = 10): Promise<Inspiration[]> => {
  try {
    const { documents } = await getCollection<Inspiration>('inspirations', {
      queryConstraints: [orderBy('date', 'desc'), limit(limitCount)],
    });

    // Process each inspiration to ensure proper formatting
    return documents.map(inspiration => {
      // Handle the case where the field might still be called 'likes' in the database
      if (!inspiration.stars && 'likes' in inspiration) {
        inspiration.stars = inspiration.likes as number;
      }

      // Ensure starredBy exists
      if (!inspiration.starredBy) {
        inspiration.starredBy = [];
      }

      return inspiration;
    });
  } catch (error) {
    console.error('Error fetching recent inspirations:', error);
    throw error;
  }
};

/**
 * Fetches all starred inspirations for a user
 */
export const getStarredInspirations = async (userId: string): Promise<Inspiration[]> => {
  if (!userId) return [];

  try {
    // Get the user document to get the array of starred inspiration IDs
    const user = await getDocument('users', userId);

    if (!user) return [];

    const starredInspirationIds = user.starredInspirations || [];

    if (starredInspirationIds.length === 0) return [];

    // Fetch each inspiration by ID
    const inspirationPromises = starredInspirationIds.map(async (inspirationId: string) => {
      const inspiration = await getInspirationById(inspirationId);
      return inspiration;
    });

    // Filter out any null results (in case an inspiration was deleted)
    const inspirations = (await Promise.all(inspirationPromises)).filter(
      (inspiration): inspiration is Inspiration => inspiration !== null
    );

    return inspirations;
  } catch (error) {
    console.error('Error fetching starred inspirations:', error);
    return [];
  }
};

/**
 * Fetches all products from Firestore
 */
export const getAllProducts = async (limitCount: number = 50): Promise<Product[]> => {
  try {
    const { documents } = await getCollection<Product>('products', {
      queryConstraints: [orderBy('created_at', 'desc'), limit(limitCount)],
    });
    return documents;
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    throw error;
  }
};

/**
 * Fetches products by their IDs from Firestore
 */
export const getProductsByIds = async (
  productIds: string[]
): Promise<(Product & { id: string })[]> => {
  try {
    const products = await Promise.all(
      productIds.map(async id => {
        const product = await getDocument<Product>('products', id, { useCache: true });
        return product;
      })
    );
    return products.filter((product): product is Product & { id: string } => product !== null);
  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    return [];
  }
};
