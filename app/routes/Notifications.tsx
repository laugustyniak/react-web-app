import StaticPage from '~/components/StaticPage';
import ProtectedRoute from '~/components/ProtectedRoute';
import Header from '~/components/Header';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Notifications - Insbay' }, { name: 'description', content: 'Notifications' }];
}

export default function NotificationsRoute() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-full">
        <Header />
        <main className="container mx-auto py-6 px-4">
          <StaticPage title="Notifications" content="Notifications" />
        </main>
      </div>
    </ProtectedRoute>
  );
}
