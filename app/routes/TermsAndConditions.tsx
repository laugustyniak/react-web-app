import StaticPage from '~/components/StaticPage';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Insbay' }, { name: 'description', content: 'Welcome to Insbay!' }];
}

export default function TermsRoute() {
  return <StaticPage title="Terms & Conditions" content={<div>Terms & Conditions</div>} />;
}
