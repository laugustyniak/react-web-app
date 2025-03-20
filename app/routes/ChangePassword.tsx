import ChangePassword from '~/components/ChangePassword';
import { useAuth } from '~/contexts/AuthContext';
import { Navigate } from 'react-router';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Change Password - Buy It' },
    { name: 'description', content: 'Change your Buy It account password' },
  ];
}

export default function ChangePasswordRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  return <ChangePassword />;
}
