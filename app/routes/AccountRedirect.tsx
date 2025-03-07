import { useEffect } from 'react';
import { useNavigate } from 'react-router';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Account - Insbay' }, { name: 'description', content: 'Account' }];
}

export default function AccountRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/account/edit-profile', { replace: true });
  }, [navigate]);

  return null;
}
