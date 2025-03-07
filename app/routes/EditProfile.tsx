import ProtectedRoute from '~/components/ProtectedRoute';
import EditProfile from '~/components/EditProfile';
import Header from '~/components/Header';
import Footer from '~/components/Footer';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Profile - Insbay' }, { name: 'description', content: 'Edit Profile' }];
}

export default function EditProfileRoute() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto flex-grow">
          <EditProfile />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
