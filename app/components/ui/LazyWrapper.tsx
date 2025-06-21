import React, { Suspense, ComponentType } from 'react';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const DefaultErrorFallback = () => (
  <div className="flex items-center justify-center min-h-[200px] text-center">
    <div className="text-red-600">
      <p>Failed to load component</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 text-sm underline"
      >
        Retry
      </button>
    </div>
  </div>
);

export function LazyWrapper({ 
  children, 
  fallback = <DefaultFallback />, 
  errorFallback = <DefaultErrorFallback /> 
}: LazyWrapperProps) {
  return (
    <LazyErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
}

// Enhanced lazy loading with retry mechanism
export function createLazyComponent<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  displayName?: string
): React.LazyExoticComponent<T> {
  const LazyComponent = React.lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error(`Failed to load ${displayName || 'component'}:`, error);
      
      // Retry logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        return await componentImport();
      } catch (retryError) {
        console.error(`Retry failed for ${displayName || 'component'}:`, retryError);
        throw retryError;
      }
    }
  });

  if (displayName) {
    LazyComponent.displayName = displayName;
  }

  return LazyComponent;
}

export default LazyWrapper;