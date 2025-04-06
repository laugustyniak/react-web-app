import { useParams, useNavigate } from 'react-router';
import type { Product } from '~/lib/dataTypes';
import { PageLayout } from './ui/layout';
import { getProductById } from '~/lib/firestoreService';
import { useEffect } from 'react';
import { useState } from 'react';
import ProductCard from './ProductCard';

export default function Product() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async (id: string) => {
      const product = await getProductById(id);
      setProduct(product);
    };
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  return (
    <PageLayout fullHeight={false}>
      {product && (
        <div className="flex flex-col gap-4 max-w-xl mx-auto">
          <ProductCard
            id={product.id}
            title={product.title}
            description={product.metadata?.description_in_english}
            programTitle={product.program}
            imageUrl={product.image_url}
            affiliateLink={product.affiliate_link}
          />
        </div>
      )}
    </PageLayout>
  );
}
