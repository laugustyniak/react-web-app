import SignUp from '~/components/SignUp';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Sign Up - Buy It' },
    { name: 'description', content: 'Create your Buy It account' },
    { name: 'og:title', content: 'Sign Up - Buy It' },
    { name: 'og:description', content: 'Create your Buy It account' },
  ];
}

export default function SignUpRoute() {
  return <SignUp />;
}
