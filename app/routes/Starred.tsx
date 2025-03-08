import Starred from '~/components/Starred';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Starred - Insbuy' },
    { name: 'description', content: 'Your starred inspirations on Insbuy' },
  ];
}

export default function StarredRoute() {
  return <Starred />;
}
