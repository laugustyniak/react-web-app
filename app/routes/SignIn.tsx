import SignIn from '~/components/SignIn';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Sign In - Insbuy' },
    { name: 'description', content: 'Sign in to your Insbuy account' },
    { name: 'og:title', content: 'Sign In - Insbuy' },
    { name: 'og:description', content: 'Sign in to your Insbuy account' },
  ];
}

export default function SignInRoute() {
  return <SignIn />;
}
