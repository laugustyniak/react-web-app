import Starred from '~/components/Starred';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Starred - Buy It' },
    { name: 'description', content: 'Your starred inspirations on Buy It' },
  ];
}

export default function StarredRoute() {
  return <Starred />;
}
