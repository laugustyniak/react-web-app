import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Suspense, lazy, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { ContentCard, PageLayout } from '~/components/ui/layout';
import { useAuth } from '~/contexts/AuthContext';

// Lazy load Canvas component with error boundary
const Canvas = lazy(() => import('~/components/Canvas/index').catch(() => ({
  default: () => (
    <div className="text-center p-8">
      <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Canvas Failed to Load</h3>
      <p className="text-gray-600 mb-4">There was an issue loading the canvas component.</p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  )
})));

export function meta() {
  return [
    { title: 'Generate Inspiration - Buy It' },
    { name: 'description', content: 'Internal tool for generating inspirations on Buy It' },
  ];
}

export default function GenerateInspirationRoute() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/sign-in', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <ContentCard className="max-w-lg text-center py-12">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Admin Access Only</h2>
          <p className="mb-4">This is an internal tool restricted to administrator users only.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </ContentCard>
      </PageLayout>
    );
  }

  return (
    <Suspense fallback={
      <PageLayout>
        <ContentCard className="max-w-4xl">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading Canvas...</p>
          </div>
        </ContentCard>
      </PageLayout>
    }>
      <Canvas />
    </Suspense>
  );
}
