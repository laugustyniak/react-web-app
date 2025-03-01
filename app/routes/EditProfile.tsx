import StaticPage from '~/components/StaticPage';
import ProtectedRoute from '~/components/ProtectedRoute';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Profile - Insbay' }, { name: 'description', content: 'Edit Profile' }];
}

export default function EditProfileRoute() {
  return (
    <ProtectedRoute>
      <StaticPage title="Edit Profile" content="Edit Profile" />
    </ProtectedRoute>
  );
}
