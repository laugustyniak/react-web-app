import StaticPage from '~/components/StaticPage';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'About Us - Insbay' }, { name: 'description', content: 'About Us' }];
}

export default function AboutUsRoute() {
  return <StaticPage title="About Us" content={<div>About Us</div>} />;
}
