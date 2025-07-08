import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/lib/firebase';

export interface DomainConfig {
  logo_dark?: string;
  logo_light?: string;
  title?: string;
  domain: string;
  favicon?: string; // URL for universal PNG favicon
}

const DEFAULT_CONFIG: DomainConfig = {
  domain: '',
  title: 'App',
  logo_dark: undefined,
  logo_light: undefined,
  favicon: undefined,
};

export function useDomainConfig() {
  const [config, setConfig] = useState<DomainConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDomainConfig = async () => {
      if (!db || typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const domain = window.location.hostname;
        const docRef = doc(db, 'domains', domain);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<DomainConfig, 'domain'>;
          setConfig({
            ...DEFAULT_CONFIG,
            ...data,
            domain,
          });
        } else {
          setConfig({
            ...DEFAULT_CONFIG,
            domain,
          });
        }
      } catch (err) {
        console.error('Error fetching domain config:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch domain config'));
        setConfig({
          ...DEFAULT_CONFIG,
          domain: window.location.hostname,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDomainConfig();
  }, []);

  return { config, loading, error };
}