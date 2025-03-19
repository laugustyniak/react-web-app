import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Analytics } from 'firebase/analytics';
import { analytics } from '~/lib/firebase';

const AnalyticsContext = createContext<Analytics | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [analyticsInstance, setAnalyticsInstance] = useState<Analytics | null>(null);

  useEffect(() => {
    analytics.then(setAnalyticsInstance);
  }, []);

  return (
    <AnalyticsContext.Provider value={analyticsInstance}>{children}</AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
