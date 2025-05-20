import Canvas from '~/components/Canvas/index';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Generate Inspiration - Buy It' },
    { name: 'description', content: 'Internal tool for generating inspirations on Buy It' },
  ];
}

export default function GenerateInspirationRoute() {
  return <Canvas />;
} 