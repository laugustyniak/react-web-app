import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  onSnapshot,
  limit,
  orderBy,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import type {
  DocumentData,
  WithFieldValue,
  Unsubscribe,
  QueryConstraint,
  CollectionReference,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export type FirestoreDocument = {
  id: string;
  [key: string]: any;
};

// Cache for collection references to avoid recreating them
const collectionRefCache = new Map<string, CollectionReference>();

// Get a cached collection reference
const getCollectionRef = (collectionName: string): CollectionReference => {
  if (!collectionRefCache.has(collectionName)) {
    collectionRefCache.set(collectionName, collection(db, collectionName));
  }
  return collectionRefCache.get(collectionName)!;
};

// Document cache for frequently accessed documents
const documentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache TTL

/**
 * Get a single document from a collection by ID with optional caching
 */
export const getDocument = async <T = DocumentData>(
  collectionName: string,
  documentId: string,
  options?: { useCache?: boolean }
): Promise<(T & { id: string }) | null> => {
  const useCache = options?.useCache ?? false;
  const cacheKey = `${collectionName}/${documentId}`;

  // Check cache if enabled
  if (useCache && documentCache.has(cacheKey)) {
    const cached = documentCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T & { id: string };
    }
    // Cache expired, remove it
    documentCache.delete(cacheKey);
  }

  try {
    const docRef = doc(getCollectionRef(collectionName), documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const result = { id: docSnap.id, ...docSnap.data() } as T & { id: string };

      // Store in cache if caching is enabled
      if (useCache) {
        documentCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }

      return result;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document ${collectionName}/${documentId}:`, error);
    throw error;
  }
};

/**
 * Get all documents from a collection with pagination support
 */
export const getCollection = async <T = DocumentData>(
  collectionName: string,
  options?: {
    queryConstraints?: QueryConstraint[];
    pageSize?: number;
    lastDoc?: DocumentSnapshot;
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
  }
): Promise<{
  documents: (T & { id: string })[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> => {
  try {
    const constraints: QueryConstraint[] = options?.queryConstraints || [];

    // Add pagination if specified
    if (options?.pageSize) {
      constraints.push(limit(options.pageSize));

      // Add ordering if specified or default to 'createdAt'
      const orderByField = options?.orderByField || 'createdAt';
      const orderDirection = options?.orderDirection || 'desc';
      constraints.push(orderBy(orderByField, orderDirection));

      // Add startAfter if we have a last document
      if (options?.lastDoc) {
        constraints.push(startAfter(options.lastDoc));
      }
    }

    const q = query(getCollectionRef(collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (T & { id: string })[];

    const lastDoc =
      querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

    const hasMore = querySnapshot.docs.length === options?.pageSize;

    return {
      documents,
      lastDoc,
      hasMore,
    };
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Add a new document to a collection with auto-generated ID and timestamps
 */
export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: WithFieldValue<T>,
  options?: { addTimestamps?: boolean }
): Promise<string> => {
  try {
    const addTimestamps = options?.addTimestamps ?? true;
    const docData = {
      ...data,
      ...(addTimestamps && {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    };

    const docRef = await addDoc(getCollectionRef(collectionName), docData);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Set a document with a specific ID (creates or overwrites)
 */
export const setDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: WithFieldValue<T>,
  options?: { merge?: boolean; addTimestamps?: boolean }
): Promise<void> => {
  try {
    const merge = options?.merge ?? false;
    const addTimestamps = options?.addTimestamps ?? true;

    const docData = {
      ...data,
      ...(addTimestamps && {
        updatedAt: serverTimestamp(),
        ...(merge ? {} : { createdAt: serverTimestamp() }),
      }),
    };

    const docRef = doc(getCollectionRef(collectionName), documentId);
    await setDoc(docRef, docData, { merge });

    // Invalidate cache if it exists
    const cacheKey = `${collectionName}/${documentId}`;
    if (documentCache.has(cacheKey)) {
      documentCache.delete(cacheKey);
    }
  } catch (error) {
    console.error(`Error setting document ${collectionName}/${documentId}:`, error);
    throw error;
  }
};

/**
 * Update specific fields in a document
 */
export const updateDocument = async (
  collectionName: string,
  documentId: string,
  data: Partial<DocumentData>,
  options?: { addTimestamp?: boolean }
): Promise<void> => {
  try {
    const addTimestamp = options?.addTimestamp ?? true;
    const updateData = {
      ...data,
      ...(addTimestamp && { updatedAt: serverTimestamp() }),
    };

    const docRef = doc(getCollectionRef(collectionName), documentId);
    await updateDoc(docRef, updateData);

    // Invalidate cache if it exists
    const cacheKey = `${collectionName}/${documentId}`;
    if (documentCache.has(cacheKey)) {
      documentCache.delete(cacheKey);
    }
  } catch (error) {
    console.error(`Error updating document ${collectionName}/${documentId}:`, error);
    throw error;
  }
};

/**
 * Delete a document from a collection
 */
export const deleteDocument = async (collectionName: string, documentId: string): Promise<void> => {
  try {
    const docRef = doc(getCollectionRef(collectionName), documentId);
    await deleteDoc(docRef);

    // Invalidate cache if it exists
    const cacheKey = `${collectionName}/${documentId}`;
    if (documentCache.has(cacheKey)) {
      documentCache.delete(cacheKey);
    }
  } catch (error) {
    console.error(`Error deleting document ${collectionName}/${documentId}:`, error);
    throw error;
  }
};

/**
 * Query documents in a collection with enhanced flexibility
 */
export const queryDocuments = async <T = DocumentData>(
  collectionName: string,
  conditions: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    value: any;
  }>,
  options?: {
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
  }
): Promise<(T & { id: string })[]> => {
  try {
    const constraints: QueryConstraint[] = conditions.map(({ field, operator, value }) =>
      where(field, operator, value)
    );

    if (options?.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }

    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    const q = query(getCollectionRef(collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (T & { id: string })[];
  } catch (error) {
    console.error(`Error querying documents in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Batch write multiple operations for better performance and atomicity
 */
export const batchWrite = async (
  operations: Array<{
    type: 'set' | 'update' | 'delete';
    collectionName: string;
    documentId: string;
    data?: any;
    options?: { merge?: boolean; addTimestamps?: boolean };
  }>
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    for (const op of operations) {
      const docRef = doc(getCollectionRef(op.collectionName), op.documentId);
      const cacheKey = `${op.collectionName}/${op.documentId}`;

      switch (op.type) {
        case 'set':
          const addTimestamps = op.options?.addTimestamps ?? true;
          const setData = {
            ...op.data,
            ...(addTimestamps && {
              updatedAt: serverTimestamp(),
              ...(op.options?.merge ? {} : { createdAt: serverTimestamp() }),
            }),
          };
          batch.set(docRef, setData, { merge: op.options?.merge ?? false });
          break;
        case 'update':
          const updateData = {
            ...op.data,
            updatedAt: serverTimestamp(),
          };
          batch.update(docRef, updateData);
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }

      // Invalidate cache
      if (documentCache.has(cacheKey)) {
        documentCache.delete(cacheKey);
      }
    }

    await batch.commit();
  } catch (error) {
    console.error('Error performing batch write:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for a document
 */
export const subscribeToDocument = <T = DocumentData>(
  collectionName: string,
  documentId: string,
  callback: (data: (T & { id: string }) | null) => void
): Unsubscribe => {
  const docRef = doc(getCollectionRef(collectionName), documentId);

  return onSnapshot(
    docRef,
    docSnap => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T & { id: string });
      } else {
        callback(null);
      }
    },
    error => {
      console.error(`Error subscribing to document ${collectionName}/${documentId}:`, error);
    }
  );
};

/**
 * Subscribe to real-time updates for a collection query
 */
export const subscribeToQuery = <T = DocumentData>(
  collectionName: string,
  callback: (data: (T & { id: string })[]) => void,
  ...queryConstraints: QueryConstraint[]
): Unsubscribe => {
  const q = query(getCollectionRef(collectionName), ...queryConstraints);

  return onSnapshot(
    q,
    querySnapshot => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as (T & { id: string })[];

      callback(documents);
    },
    error => {
      console.error(`Error subscribing to query in ${collectionName}:`, error);
    }
  );
};

/**
 * Clear the document cache
 */
export const clearCache = (collectionName?: string, documentId?: string): void => {
  if (collectionName && documentId) {
    // Clear specific document
    const cacheKey = `${collectionName}/${documentId}`;
    documentCache.delete(cacheKey);
  } else if (collectionName) {
    // Clear all documents in a collection
    for (const key of documentCache.keys()) {
      if (key.startsWith(`${collectionName}/`)) {
        documentCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    documentCache.clear();
  }
};
