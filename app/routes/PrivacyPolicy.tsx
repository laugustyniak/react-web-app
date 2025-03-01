import StaticPage from '~/components/StaticPage';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Insbay' }, { name: 'description', content: 'Welcome to Insbay!' }];
}

export default function PrivacyPolicyRoute() {
  return <StaticPage title="Privacy Policy" content={<div>Privacy Policy</div>} />;
}
