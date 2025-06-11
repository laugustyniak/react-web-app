import type { VideoData, VideoFrame } from '../types/models';
import type { Comment, Inspiration, Product, Program } from './dataTypes';

import { DocumentSnapshot, limit, orderBy, where } from 'firebase/firestore';
import {
  addDocument,
  deleteDocument,
  getCollection,
  getDocument,
  queryDocuments,
  updateDocument,
} from './firestore';

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
export const getAllInspirations = async (
  limitCount: number = 50,
  lastDoc?: DocumentSnapshot | null
): Promise<{
  documents: Inspiration[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> => {
  try {
    return await getCollection<Inspiration>('inspirations', {
      queryConstraints: [orderBy('date', 'desc'), limit(limitCount)],
      lastDoc: lastDoc || undefined,
    });
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
export const getAllProducts = async (
  limitCount: number = 50,
  lastDoc?: DocumentSnapshot | null
): Promise<{
  documents: Product[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> => {
  try {
    return await getCollection<Product>('products', {
      queryConstraints: [orderBy('created_at', 'desc'), limit(limitCount)],
      lastDoc: lastDoc || undefined,
    });
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

export const getProductsByProgramId = async (programId: string): Promise<Product[]> => {
  try {
    const { documents } = await getCollection<Product>('products', {
      queryConstraints: [where('program', '==', programId)],
    });
    return documents;
  } catch (error) {
    console.error('Error fetching products by program ID:', error);
    return [];
  }
};

export const getInspirationsByProgramId = async (programId: string): Promise<Inspiration[]> => {
  try {
    const { documents } = await getCollection<Inspiration>('inspirations', {
      queryConstraints: [where('program', '==', programId)],
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
    console.error('Error fetching inspirations by program ID:', error);
    return [];
  }
};

/**
 * Fetches a single product by ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const product = await getDocument<Product>('products', id, { useCache: true });
    if (!product) {
      return null;
    }
    return product;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

/**
 * Fetches all programs from Firestore
 */
export const getAllPrograms = async (
  limitCount: number = 50,
  lastDoc?: DocumentSnapshot | null
): Promise<{
  documents: Program[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> => {
  try {
    return await getCollection<Program>('programs', {
      queryConstraints: [orderBy('created_at', 'desc'), limit(limitCount)],
      lastDoc: lastDoc || undefined,
    });
  } catch (error) {
    console.error('Error fetching programs from Firestore:', error);
    throw error;
  }
};

/**
 * Fetches a single program by ID
 */
export const getProgramById = async (id: string): Promise<Program | null> => {
  try {
    const program = await getDocument<Program>('programs', id, { useCache: true });
    return program;
  } catch (error) {
    console.error('Error fetching program by ID:', error);
    return null;
  }
};

export const insertInspiration = async (inspiration: Omit<Inspiration, 'id'>): Promise<string> => {
  try {
    const docRef = await addDocument('inspirations', {
      ...inspiration,
      date: new Date().toISOString(),
      stars: 0,
      starredBy: [],
      commentIds: [],
      commentCount: 0,
    });
    return docRef;
  } catch (error) {
    console.error('Error inserting inspiration:', error);
    throw error;
  }
};

export const insertProgram = async (program: Omit<Program, 'id'>): Promise<string> => {
  try {
    const docRef = await addDocument('programs', {
      ...program,
      created_at: new Date().toISOString(),
    });
    return docRef;
  } catch (error) {
    console.error('Error inserting program:', error);
    throw error;
  }
};

export const insertProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  try {
    const docId = await addDocument('products', {
      ...product,
      created_at: new Date().toISOString(),
    });
    return docId;
  } catch (error) {
    console.error('Error inserting product:', error);
    throw error;
  }
};

/**
 * Inserts a new video into Firestore
 */
export const insertVideo = async (video: Omit<VideoData, 'video_id'>): Promise<string> => {
  try {
    // Check if video with same URL already exists
    const existingVideos = await queryDocuments<VideoData>(
      'videos',
      [{ field: 'video_url', operator: '==', value: video.video_url }]
    );

    if (existingVideos.length > 0) {
      throw new Error('Video with this URL already exists');
    }

    const docId = await addDocument('videos', {
      ...video,
      created_at: new Date().toISOString(),
      is_processed: video.is_processed || false,
    });
    return docId;
  } catch (error) {
    console.error('Error inserting video:', error);
    throw error;
  }
};

/**
 * Saves a video frame to Firestore
 */
export const saveFrame = async (frame: Omit<VideoFrame, 'frame_id'>): Promise<string> => {
  try {
    // Check for duplicate frames within 500ms tolerance
    const existingFrames = await queryDocuments<VideoFrame>(
      'frames',
      [{ field: 'video_id', operator: '==', value: frame.video_id }]
    );

    const duplicateFrame = existingFrames.find(existingFrame =>
      Math.abs(existingFrame.timestamp_ms - frame.timestamp_ms) <= 10
    );

    if (duplicateFrame) {
      throw new Error('Frame already exists within 10ms tolerance');
    }

    const docId = await addDocument('frames', {
      ...frame,
      created_at: new Date().toISOString(),
    });
    return docId;
  } catch (error) {
    console.error('Error saving frame:', error);
    throw error;
  }
};

/**
 * Updates video data in Firestore
 */
export const updateVideo = async (id: string, data: Partial<VideoData>): Promise<void> => {
  try {
    if (!id) {
      throw new Error('Video ID is required for update');
    }
    await updateDocument('videos', id, data);
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

/**
 * Deletes a video from Firestore
 */
export const deleteVideo = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new Error('Video ID is required for deletion');
    }
    await deleteDocument('videos', id);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

/**
 * Deletes a video frame from Firestore
 */
export const deleteFrame = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new Error('Frame ID is required for deletion');
    }
    await deleteDocument('frames', id);
  } catch (error) {
    console.error('Error deleting frame:', error);
    throw error;
  }
};

export const updateInspiration = async (id: string, data: Partial<Inspiration>): Promise<void> => {
  try {
    await updateDocument('inspirations', id, data);
  } catch (error) {
    console.error('Error updating inspiration:', error);
    throw error;
  }
};

export const updateProgram = async (id: string, data: Partial<Program>): Promise<void> => {
  try {
    await updateDocument('programs', id, data);
  } catch (error) {
    console.error('Error updating program:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<void> => {
  try {
    if (!id) {
      throw new Error('Product ID is required for update');
    }
    await updateDocument('products', id, data);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteInspiration = async (id: string): Promise<void> => {
  try {
    await deleteDocument('inspirations', id);
  } catch (error) {
    console.error('Error deleting inspiration:', error);
    throw error;
  }
};

export const deleteProgram = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new Error('Program ID is required for deletion');
    }
    console.log('Deleting program:', id);
    await deleteDocument('programs', id);
  } catch (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new Error('Product ID is required for deletion');
    }
    await deleteDocument('products', id);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Fetches random inspirations from Firestore using a more efficient approach
 */
export const getRandomInspirations = async (limitCount: number = 12): Promise<Inspiration[]> => {
  try {
    // Fetch documents with a random field
    // First, get the total count
    const collectionRef = await getCollection<Inspiration>('inspirations', {
      queryConstraints: [limit(200)], // Set a reasonable max limit
    });

    const total = collectionRef.documents.length;

    // If we have fewer docs than requested, return them all
    if (total <= limitCount) {
      return collectionRef.documents;
    }

    // Choose random indices without repetition
    const indices = new Set<number>();
    while (indices.size < limitCount) {
      indices.add(Math.floor(Math.random() * total));
    }

    // Get the selected documents
    return Array.from(indices).map(i => collectionRef.documents[i]);
  } catch (error) {
    console.error('Error fetching random inspirations:', error);
    throw error;
  }
};

/**
 * Fetches all frames associated with a specific video ID
 */
export const getFramesByVideoId = async (videoId: string): Promise<VideoFrame[]> => {
  try {
    const { documents } = await getCollection<VideoFrame>('frames', {
      queryConstraints: [where('video_id', '==', videoId), orderBy('created_at', 'desc')],
    });

    return documents;
  } catch (error) {
    console.error('Error fetching frames by video ID:', error);
    return [];
  }
};

/**
 * Fetches all videos from Firestore
 */
export const getAllVideos = async (
  limitCount: number = 50,
  lastDoc?: DocumentSnapshot | null
): Promise<{
  documents: VideoData[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> => {
  try {
    return await getCollection<VideoData>('videos', {
      queryConstraints: [orderBy('created_at', 'desc'), limit(limitCount)],
      lastDoc: lastDoc || undefined,
    });
  } catch (error) {
    console.error('Error fetching videos from Firestore:', error);
    throw error;
  }
};
