import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardFooter } from './ui/card';
import BuyItButton from './BuyItButton';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ProductCardProps {
  productId: string;
  title: string;
  programTitle: string;
  description?: string;
  imageUrl?: string;
  affiliateLink?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function ProductCard({
  productId,
  title,
  programTitle,
  description,
  imageUrl,
  affiliateLink,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isAdmin } = useAuth();

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleEdit = useCallback(() => {
    onEdit?.(productId);
  }, [onEdit, productId]);

  const handleDelete = useCallback(() => {
    onDelete?.(productId);
  }, [onDelete, productId]);

  return (
    <Card className="h-full overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md">
      <div className="relative flex-1">
        <div className="relative mx-4 sm:h-64 md:h-80 mb-4 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
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
        <div className="px-4">
          <h3 className="text-base font-semibold line-clamp-2">{title}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <span className="line-clamp-1">{programTitle}</span>
          </div>
        </div>
      </div>
      <CardContent className="px-4 mt-0">
        <p className=" text-gray-500 line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 mt-auto flex justify-between">
        {affiliateLink && (
          <BuyItButton affiliateLink={affiliateLink} productId={productId} productTitle={title} />
        )}
        {isAdmin && (
          <div className="flex space-x-2 ml-2">
            <Button size="sm" variant="outline" onClick={handleEdit} className="cursor-pointer">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default memo(ProductCard);
