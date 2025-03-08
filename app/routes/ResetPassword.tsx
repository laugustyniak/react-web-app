import ResetPassword from '~/components/ResetPassword';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Reset Password - Insbuy' },
    { name: 'description', content: 'Reset your Insbuy account password' },
    { name: 'og:title', content: 'Reset Password - Insbuy' },
    { name: 'og:description', content: 'Reset your Insbuy account password' },
  ];
}

export default function ResetPasswordRoute() {
  return <ResetPassword />;
}
