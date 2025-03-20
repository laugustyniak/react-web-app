import Explore from '~/components/Explore';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Explore - Buy It' }, { name: 'description', content: 'Explore' }];
}

export default function ExploreRoute() {
  return <Explore />;
}
