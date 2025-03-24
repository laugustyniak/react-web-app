import Product from '~/components/Product';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Product - Buy It' },
    { name: 'description', content: 'View product details on Buy It' },
  ];
}

export default function ProductRoute() {
  return <Product />;
}
