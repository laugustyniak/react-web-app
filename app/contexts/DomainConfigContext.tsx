import React, { createContext, useContext, type ReactNode } from 'react';
import { useDomainConfig, type DomainConfig } from '~/hooks/useDomainConfig';

interface DomainConfigContextType {
  config: DomainConfig;
  loading: boolean;
  error: Error | null;
}

const DomainConfigContext = createContext<DomainConfigContextType>({
  config: {
    domain: '',
    title: 'Buy It',
    logo_dark: undefined,
    logo_light: undefined,
  },
  loading: true,
  error: null,
});

export function DomainConfigProvider({ children }: { children: ReactNode }) {
  const { config, loading, error } = useDomainConfig();

  return (
    <DomainConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </DomainConfigContext.Provider>
  );
}

export function useDomainConfigContext() {
  const context = useContext(DomainConfigContext);
  if (!context) {
    throw new Error('useDomainConfigContext must be used within a DomainConfigProvider');
  }
  return context;
}