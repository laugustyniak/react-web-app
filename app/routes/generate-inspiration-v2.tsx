import KonvaImageEditor from '~/components/Canvas/KonvaImageEditor';
import { useAuth } from '~/contexts/AuthContext';
import { Navigate } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { PageLayout, ContentCard } from '~/components/ui/layout';
import { Button } from '~/components/ui/button';

export function meta() {
  return [
    { title: 'Generate Inspiration V2 - Buy It' },
    { name: 'description', content: 'Advanced Konva-based image manipulation tool for generating inspirations' },
  ];
}

export default function GenerateInspirationV2Route() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/sign-in" />;
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

  return <KonvaImageEditor />;
}
