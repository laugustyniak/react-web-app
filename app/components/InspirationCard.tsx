import { useState, useCallback, memo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import type { Inspiration, Product } from '~/lib/dataTypes';
import Comments from './Comments';
import StarButton from './StarButton';
import { Link } from 'react-router';
import { getProductsByIds } from '~/lib/firestoreService';

interface InspirationCardProps {
  inspiration: Inspiration;
}

function InspirationCard({ inspiration }: InspirationCardProps) {
  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false);
  const [localCommentCount, setLocalCommentCount] = useState<number>(inspiration.commentCount || 0);
  const [products, setProducts] = useState<(Product & { id: string })[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (inspiration.products?.length) {
        const fetchedProducts = await getProductsByIds(inspiration.products);
        setProducts(fetchedProducts);
      }
    };
    fetchProducts();
  }, [inspiration.products]);

  const toggleCommentsModal = useCallback(() => {
    setShowCommentsModal(!showCommentsModal);
  }, [showCommentsModal]);

  const formatDate = useCallback((dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  const handleCommentCountChange = useCallback((newCount: number) => {
    setLocalCommentCount(newCount);
  }, []);

  return (
    <>
      <Link to={`/inspirations/${inspiration.id}`} className="block h-full">
        <Card className="h-full flex flex-col overflow-hidden w-full transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-0 p-3 sm:p-6 sm:pb-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src={inspiration.logoUrl}
                alt="Logo"
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              />
              <div>
                <CardTitle className="text-base sm:text-lg line-clamp-1">
                  {inspiration.title}
                </CardTitle>
                <p className="text-xs text-gray-500">{formatDate(inspiration.date)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-3 sm:p-6 pt-3">
            <div className="relative h-48 sm:h-64 md:h-80 mb-3 sm:mb-4 overflow-hidden rounded-md">
              <img
                src={inspiration.imageUrl}
                alt={inspiration.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
            <CardDescription className="line-clamp-3 sm:line-clamp-none">
              {inspiration.description}
            </CardDescription>
            {products.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Products</h4>
                <div
                  className={`grid ${products.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}
                >
                  {products.map(product => (
                    <div key={product.id} className="flex items-center gap-2">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{product.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{product.program}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-3 sm:pt-4 px-3 sm:px-6 mt-auto mb-1">
            <button
              onClick={toggleCommentsModal}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                />
              </svg>
              <span>{localCommentCount}</span>
            </button>

            <div className="flex items-center gap-2">
              <StarButton
                inspirationId={inspiration.id}
                starredBy={inspiration.starredBy || []}
                starsCount={inspiration.stars || 0}
              />
            </div>
          </CardFooter>

          {/* Comments component */}
          <Comments
            contentId={inspiration.id}
            contentType="inspiration"
            commentIds={inspiration.commentIds || []}
            commentCount={localCommentCount}
            showCommentsModal={showCommentsModal}
            setShowCommentsModal={setShowCommentsModal}
            onCommentCountChange={handleCommentCountChange}
          />
        </Card>
      </Link>
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(InspirationCard);
