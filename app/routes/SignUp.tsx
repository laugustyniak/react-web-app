import SignUp from '~/components/SignUp';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Sign Up - Insbay' }, { name: 'description', content: 'Welcome to Insbay!' }];
}

export default function SignUpRoute() {
  return <SignUp />;
}
