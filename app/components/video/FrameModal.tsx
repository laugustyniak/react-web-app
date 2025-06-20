import { Dialog, DialogContent, DialogClose } from '~/components/ui/dialog';
import type { VideoFrame } from '~/types/models';
import { formatTime } from '~/services/videoService';

// Helper function to format Firestore timestamp
const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'Unknown';
  
  try {
    // Handle Firestore Timestamp object
    if (typeof timestamp === 'object' && 'toDate' in timestamp) {
      return timestamp.toDate().toLocaleString();
    }
    // Handle regular Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    // Handle timestamp number (milliseconds)
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleString();
    }
    return 'Invalid date';
  } catch (error) {
    return 'Invalid date';
  }
};

interface FrameModalProps {
  frame: VideoFrame | null;
  onClose: () => void;
}

export default function FrameModal({ frame, onClose }: FrameModalProps) {
  if (!frame) return null;
  
  return (
    <Dialog open={!!frame} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex flex-col items-center justify-center p-0 bg-transparent shadow-none" style={{ 
        maxWidth: '90vw', 
        maxHeight: '90vh',
        width: 'auto',
        height: 'auto'
      }}>
        {frame.storage_url ? (
          <div className="relative">
            <img
              src={frame.storage_url}
              alt={`Frame at ${formatTime(frame.timestamp_ms / 1000)}`}
              style={{ 
                display: 'block', 
                maxWidth: '90vw', 
                maxHeight: '90vh', 
                width: 'auto', 
                height: 'auto'
              }}
              className="rounded-lg"
            />
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
              <div>Video: {formatTime(frame.timestamp_ms / 1000)}</div>
              {frame.updated_at && (
                <div className="text-xs opacity-80">
                  Updated: {formatTimestamp(frame.updated_at)}
                </div>
              )}
            </div>
          </div>
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
