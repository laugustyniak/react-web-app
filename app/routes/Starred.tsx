import Starred from '~/components/Starred';
import ProtectedRoute from '~/components/ProtectedRoute';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Starred - Insbay' },
    { name: 'description', content: 'Your starred inspirations' },
  ];
}

export default function StarredRoute() {
  return (
    <ProtectedRoute>
      <Starred />
    </ProtectedRoute>
  );
}
