import SignIn from '~/components/SignIn';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Sign In - Buy It' },
    { name: 'description', content: 'Sign in to your Buy It account' },
    { name: 'og:title', content: 'Sign In - Buy It' },
    { name: 'og:description', content: 'Sign in to your Buy It account' },
  ];
}

export default function SignInRoute() {
  return <SignIn />;
}
