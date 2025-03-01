import Home from '~/components/Home';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Insbay' }, { name: 'description', content: 'Welcome to Insbay!' }];
}

export default function HomeRoute() {
  return <Home />;
}
