import EditProfile from '~/components/EditProfile';
import { useAuth } from '~/contexts/AuthContext';
import { Navigate } from 'react-router';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Edit Profile - Insbuy' },
    { name: 'description', content: 'Edit your Insbuy profile' },
  ];
}

export default function EditProfileRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  return <EditProfile />;
}
