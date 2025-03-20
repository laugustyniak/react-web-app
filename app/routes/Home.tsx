import Home from '~/components/Home';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Buy It' }, { name: 'description', content: 'Welcome to Buy It!' }];
}

export default function HomeRoute() {
  return <Home />;
}
