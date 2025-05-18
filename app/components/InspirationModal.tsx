import { Dialog, DialogContent, DialogClose } from './ui/dialog';
import type { Inspiration } from '~/lib/dataTypes';

interface InspirationModalProps {
  inspiration: Inspiration | null;
  onClose: () => void;
  programs?: any[]; // Accept programs as optional prop
}

export default function InspirationModal({ inspiration, onClose, programs }: InspirationModalProps) {
  if (!inspiration) return null;
  // You can use the programs prop here if needed for similarity or display
  return (
    <Dialog open={!!inspiration} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex items-center justify-center p-0 bg-transparent shadow-none">
        {inspiration.imageUrl ? (
          <img
            src={inspiration.imageUrl}
            alt={inspiration.title}
            style={{ display: 'block', maxWidth: 'none', maxHeight: 'none', width: 'auto', height: 'auto' }}
          />
        ) : (
          <div className="w-full h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <DialogClose className="absolute top-4 right-4" />
      </DialogContent>
    </Dialog>
  );
}
