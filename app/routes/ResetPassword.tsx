import ResetPassword from '~/components/ResetPassword';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Reset Password - Buy It' },
    { name: 'description', content: 'Reset your Buy It account password' },
    { name: 'og:title', content: 'Reset Password - Buy It' },
    { name: 'og:description', content: 'Reset your Buy It account password' },
  ];
}

export default function ResetPasswordRoute() {
  return <ResetPassword />;
}
