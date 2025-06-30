import ChangePassword from '~/components/ChangePassword';
import { useAuth } from '~/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

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
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/sign-in', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return <ChangePassword />;
}
