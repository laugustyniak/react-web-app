import { getInspirationById } from '~/lib/firestoreService';
import InspirationCard from './InspirationCard';
import { useEffect } from 'react';
import { useState } from 'react';
import type { Inspiration } from '~/lib/dataTypes';
export default function InspirationDetails(props: { inspirationId: string }) {
  const { inspirationId } = props;

  const [inspiration, setInspiration] = useState<Inspiration | null>(null);

  useEffect(() => {
    const fetchInspiration = async () => {
      const fetchedInspiration = await getInspirationById(inspirationId);
      setInspiration(fetchedInspiration);
    };
    fetchInspiration();
  }, [inspirationId]);

  return inspiration && <InspirationCard inspiration={inspiration} />;
}
