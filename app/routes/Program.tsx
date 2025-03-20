import Program from '~/components/Program';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Program - Buy It' },
    { name: 'description', content: 'View program details on Buy It' },
  ];
}

export default function ProgramRoute() {
  return <Program />;
}
