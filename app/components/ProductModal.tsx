import { Dialog, DialogContent, DialogClose } from './ui/dialog';
import type { Product } from '~/lib/dataTypes';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  programs?: any[]; // Accept programs as optional prop
}

export default function ProductModal({ product, onClose, programs }: ProductModalProps) {
  if (!product) return null;
  // You can use the programs prop here if needed for similarity or display
  return (
    <Dialog open={!!product} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex items-center justify-center p-0 bg-transparent shadow-none max-w-[90vw] max-h-[90vh]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            style={{ display: 'block', maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto' }}
          />
        ) : (
          <div className="w-full h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {product.affiliate_link && (
          <a
            href={product.affiliate_link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition shadow-lg z-10"
          >
            Buy It
          </a>
        )}
        <DialogClose className="absolute top-4 right-4" />
      </DialogContent>
    </Dialog>
  );
}
