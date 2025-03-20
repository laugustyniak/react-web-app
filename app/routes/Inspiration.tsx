import { useParams } from 'react-router';
import Inspiration from '~/components/Inspiration';
import { getInspirationById } from '~/lib/firestoreService';
import { useEffect } from 'react';

namespace Route {
  export type MetaArgs = Record<string, unknown>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Inspiration - Buy It' },
    { name: 'description', content: 'Welcome to Buy It!' },
    { property: 'og:title', content: 'Inspiration - Buy It' },
    { property: 'og:description', content: 'Welcome to Buy It!' },
    { property: 'og:type', content: 'article' },
    { property: 'og:image', content: '' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Inspiration - Buy It' },
    { name: 'twitter:description', content: 'Welcome to Buy It!' },
    { name: 'twitter:image', content: '' },
  ];
}

export default function InspirationRoute() {
  const { id } = useParams();

  useEffect(() => {
    const updateMeta = async () => {
      try {
        const inspiration = id ? await getInspirationById(id) : null;
        const title = inspiration?.title ? `${inspiration.title} - Buy It` : 'Inspiration - Buy It';
        const description = inspiration?.description || 'Welcome to Buy It!';
        const imageUrl = inspiration?.imageUrl || '';

        document.title = title;
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
        document
          .querySelector('meta[property="og:description"]')
          ?.setAttribute('content', description);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl);
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
        document
          .querySelector('meta[name="twitter:description"]')
          ?.setAttribute('content', description);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', imageUrl);
      } catch (error) {
        document.title = 'Inspiration - Buy It';
      }
    };

    updateMeta();
  }, [id]);

  return <Inspiration />;
}
