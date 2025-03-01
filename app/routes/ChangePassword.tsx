import ChangePassword from '~/components/ChangePassword';
import ProtectedRoute from '~/components/ProtectedRoute';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Change Password - Insbay' },
    { name: 'description', content: 'Update your account password' },
  ];
}

export default function ChangePasswordRoute() {
  return (
    <ProtectedRoute>
      <ChangePassword />
    </ProtectedRoute>
  );
}
