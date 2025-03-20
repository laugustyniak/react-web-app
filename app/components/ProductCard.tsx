import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardFooter } from './ui/card';
import BuyItButton from './BuyItButton';
import type { Product } from '~/lib/dataTypes';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <Card className="h-full overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md">
      <div className="relative flex-1">
        <div className="relative mx-4 sm:h-64 md:h-80 mb-4 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-base font-semibold line-clamp-2 mb-1">{product.title}</h3>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <span className="line-clamp-1">{product.program}</span>
          </div>
        </div>
      </div>
      <CardFooter className="p-3 pt-0 mt-auto">
        {product.affiliate_link && (
          <BuyItButton
            affiliateLink={product.affiliate_link}
            productId={product.product_id}
            productTitle={product.title}
          />
        )}
      </CardFooter>
    </Card>
  );
}

export default memo(ProductCard);
