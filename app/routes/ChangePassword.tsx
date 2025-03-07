import ChangePassword from '~/components/ChangePassword';
import ProtectedRoute from '~/components/ProtectedRoute';
import Header from '~/components/Header';
import Footer from '~/components/Footer';

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
      <div className="flex flex-col min-h-screen h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto flex-grow">
          <ChangePassword />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
