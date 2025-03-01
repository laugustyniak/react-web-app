import StaticPage from '~/components/StaticPage';
import ProtectedRoute from '~/components/ProtectedRoute';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Notifications - Insbay' }, { name: 'description', content: 'Notifications' }];
}

export default function NotificationsRoute() {
  return (
    <ProtectedRoute>
      <StaticPage title="Notifications" content="Notifications" />
    </ProtectedRoute>
  );
}
