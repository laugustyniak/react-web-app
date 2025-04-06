import { useState, useEffect } from 'react';
import { getAllPrograms } from '~/lib/firestoreService';
import type { Program } from '~/lib/dataTypes';

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true);
        const result = await getAllPrograms(100);
        setPrograms(result.documents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch programs'));
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  return { programs, loading, error };
}
