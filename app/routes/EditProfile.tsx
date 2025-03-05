import ProtectedRoute from '~/components/ProtectedRoute';
import EditProfile from '~/components/EditProfile';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Profile - Insbay' }, { name: 'description', content: 'Edit Profile' }];
}

export default function EditProfileRoute() {
  return (
    <ProtectedRoute>
      <EditProfile />
    </ProtectedRoute>
  );
}
