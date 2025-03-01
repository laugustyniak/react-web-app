import SignIn from '~/components/SignIn';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Sign In - Insbay' }, { name: 'description', content: 'Welcome to Insbay!' }];
}

export default function SignInRoute() {
  return <SignIn />;
}
