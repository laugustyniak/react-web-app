import SignUp from '~/components/SignUp';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Sign Up - Insbuy' },
    { name: 'description', content: 'Create your Insbuy account' },
    { name: 'og:title', content: 'Sign Up - Insbuy' },
    { name: 'og:description', content: 'Create your Insbuy account' },
  ];
}

export default function SignUpRoute() {
  return <SignUp />;
}
