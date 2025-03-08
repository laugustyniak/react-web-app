import Home from '~/components/Home';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Insbuy' }, { name: 'description', content: 'Welcome to Insbuy!' }];
}

export default function HomeRoute() {
  return <Home />;
}
