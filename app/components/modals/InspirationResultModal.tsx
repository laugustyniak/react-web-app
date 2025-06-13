import { Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

interface InspirationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string | null;
}

export default function InspirationResultModal({ isOpen, onClose, imageData }: InspirationResultModalProps) {
  const handleDownload = () => {
    if (!imageData) return;

    const link = document.createElement('a');
    link.download = `buy-it-inspiration-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = imageData;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generated Inspiration</DialogTitle>
        </DialogHeader>

        <div className="overflow-auto max-h-[70vh] mt-4">
          {imageData ? (
            <img
              src={imageData}
              alt="Generated Inspiration"
              className="w-full object-contain rounded-md"
            />
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-800 rounded-md">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload} disabled={!imageData} className="ml-2">
            <Download className="mr-2 h-4 w-4" />
            Download Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
