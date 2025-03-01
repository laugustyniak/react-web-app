import { collection, getDocs, doc, getDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Inspiration, Comment } from './dataTypes';

/**
 * Fetches comments for a specific content ID
 */
export const getCommentsByContentId = async (contentId: string): Promise<Comment[]> => {
  try {
    const commentsCollection = collection(db, 'comments');
    const q = query(
      commentsCollection,
      where('contentId', '==', contentId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const comments: Comment[] = [];
    querySnapshot.forEach(doc => {
      comments.push({
        id: doc.id,
        ...(doc.data() as Omit<Comment, 'id'>),
      });
    });

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
    const inspirationsCollection = collection(db, 'inspirations');
    const q = query(inspirationsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    // First get all inspirations
    const inspirationPromises = querySnapshot.docs.map(async doc => {
      const data = doc.data() as Omit<Inspiration, 'id'>;
      const inspirationId = doc.id;

      // Fetch comments for this inspiration
      const comments = await getCommentsByContentId(inspirationId);

      return {
        id: inspirationId,
        ...data,
        comments: {
          count: comments.length,
          items: comments,
        },
      };
    });

    // Wait for all promises to resolve
    const resolvedInspirations = await Promise.all(inspirationPromises);
    return resolvedInspirations;
  } catch (error) {
    console.error('Error fetching inspirations from Firestore:', error);
    throw error;
  }
};

/**
 * Fetches a specific inspiration by ID
 */
export const getInspirationById = async (id: string): Promise<Inspiration | null> => {
  try {
    const docRef = doc(db, 'inspirations', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<Inspiration, 'id'>;

      // Fetch comments for this inspiration
      const comments = await getCommentsByContentId(id);

      return {
        id: docSnap.id,
        ...data,
        comments: {
          count: comments.length,
          items: comments,
        },
      };
    } else {
      console.log('No such inspiration document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching inspiration by ID:', error);
    throw error;
  }
};

/**
 * Fetches a limited number of recent inspirations
 */
export const getRecentInspirations = async (limitCount: number = 10): Promise<Inspiration[]> => {
  try {
    const inspirationsCollection = collection(db, 'inspirations');
    const q = query(inspirationsCollection, orderBy('date', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);

    // First get all inspirations
    const inspirationPromises = querySnapshot.docs.map(async doc => {
      const data = doc.data() as Omit<Inspiration, 'id'>;
      const inspirationId = doc.id;

      // Fetch comments for this inspiration
      const comments = await getCommentsByContentId(inspirationId);

      return {
        id: inspirationId,
        ...data,
        comments: {
          count: comments.length,
          items: comments,
        },
      };
    });

    // Wait for all promises to resolve
    const resolvedInspirations = await Promise.all(inspirationPromises);
    return resolvedInspirations;
  } catch (error) {
    console.error('Error fetching recent inspirations:', error);
    throw error;
  }
};
