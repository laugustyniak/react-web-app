import { useState, useCallback, memo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import type { Inspiration, Product } from '~/lib/dataTypes';
import Comments from './Comments';
import StarButton from './StarButton';
import { Link } from 'react-router';
import { getProductsByIds, updateInspiration, deleteInspiration } from '~/lib/firestoreService';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';
import { EditInspirationModal, DeleteConfirmationModal } from './modals';
import { usePrograms } from '../hooks/usePrograms';
import { programIdToTitle } from '~/lib/programUtils';

interface InspirationCardProps {
  inspiration: Inspiration;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onImageClick?: () => void; // Add this prop
}

function InspirationCard({ inspiration, onEdit, onDelete, onImageClick }: InspirationCardProps) {
  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false);
  const [localCommentCount, setLocalCommentCount] = useState<number>(inspiration.commentCount || 0);
  const [products, setProducts] = useState<(Product & { id: string })[]>([]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { isAdmin } = useAuth();
  const { programs } = usePrograms();

  useEffect(() => {
    const fetchProducts = async () => {
      if (inspiration.products?.length) {
        try {
          const fetchedProducts = await getProductsByIds(inspiration.products);
          setProducts(fetchedProducts);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }
    };
    fetchProducts();
  }, [inspiration.products]);

  const toggleCommentsModal = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowCommentsModal(!showCommentsModal);
    },
    [showCommentsModal]
  );

  const formatDate = useCallback((dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  const handleCommentCountChange = useCallback((newCount: number) => {
    setLocalCommentCount(newCount);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const handleEdit = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (id: string, data: Partial<Inspiration>) => {
      await updateInspiration(id, data);
      onEdit?.(id);
    },
    [onEdit]
  );

  const handleDeleteConfirm = useCallback(async () => {
    await deleteInspiration(inspiration.id);
    onDelete?.(inspiration.id);
  }, [inspiration.id, onDelete]);

  // Memoized product item to prevent unnecessary rerenders
  const ProductItem = memo(({ product }: { product: Product & { id: string } }) => (
    <Link
      to={`/products/${product.id}`}
      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ml-[-8px]"
    >
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.title}
          className="w-14 h-14 rounded-md object-cover border border-gray-200 dark:border-gray-700"
          loading="lazy"
          width={56}
          height={56}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1">{product.title}</p>
        <p className="text-xs text-gray-500 line-clamp-1">
          {programIdToTitle(programs, product.program)}
        </p>
      </div>
    </Link>
  ));

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden w-full pb-4.5 transition-all duration-300 hover:shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center gap-2">
          {(inspiration.logoUrl || inspiration.imageUrl) && (
            <img
              src={inspiration.logoUrl || inspiration.imageUrl}
              alt=""
              className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              width={36}
              height={36}
              loading="lazy"
            />
          )}
          <div className="flex-1 min-w-0">
            <Link to={`/inspirations/${inspiration.id}`} className="hover:underline">
              <CardTitle className="text-base sm:text-lg line-clamp-1">
                {inspiration.title}
              </CardTitle>
            </Link>
            <p className="text-xs text-gray-500">
              {inspiration.programTitle || (inspiration.program ? programIdToTitle(programs, inspiration.program) : null)}
            </p>
            {/* <p className="text-xs text-gray-500">
              {inspiration.date ? formatDate(inspiration.date) : ''}
            </p> */}
          </div>
        </CardHeader>
        <CardContent className="px-6 py-0 flex-1 mt-[-10px]">
          <div className="relative h-52 sm:h-64 md:h-80 mb-4 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={inspiration.imageUrl}
              alt={inspiration.title}
              className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              width={400}
              height={300}
              onClick={onImageClick} // Attach click handler
              style={{ cursor: onImageClick ? 'pointer' : undefined }}
            />
          </div>
          <CardDescription
            className="text-sm text-gray-700 dark:text-gray-300"
            title={inspiration.description}
          >
            {inspiration.description}
          </CardDescription>
          {products.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Products</h4>
              <div
                className={`grid ${products.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}
              >
                {products.map(product => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4 px-5 mt-0">
          <Button
            variant="ghost"
            size="default"
            onClick={toggleCommentsModal}
            className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Comments"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="w-5 h-5"
              width={20}
              height={20}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
              />
            </svg>
            <span>{localCommentCount}</span>
          </Button>

          <div className="flex items-center">
            <StarButton
              inspirationId={inspiration.id}
              starredBy={inspiration.starredBy || []}
              starsCount={inspiration.stars || 0}
            />

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
          </div>
        </CardFooter>
      </Card>

      {/* Comments component - only render when needed */}
      {showCommentsModal && (
        <Comments
          contentId={inspiration.id}
          contentType="inspiration"
          commentIds={inspiration.commentIds || []}
          commentCount={localCommentCount}
          showCommentsModal={showCommentsModal}
          setShowCommentsModal={setShowCommentsModal}
          onCommentCountChange={handleCommentCountChange}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditInspirationModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          inspiration={inspiration}
          onEdit={handleEditSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          title={inspiration.title}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(InspirationCard);
