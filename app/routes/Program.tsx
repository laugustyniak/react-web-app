import Program from '~/components/Program';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Program - Insbuy' },
    { name: 'description', content: 'View program details on Insbuy' },
  ];
}

export default function ProgramRoute() {
  return <Program />;
}
