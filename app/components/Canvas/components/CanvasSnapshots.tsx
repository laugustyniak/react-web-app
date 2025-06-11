// Canvas/components/CanvasSnapshots.tsx
import { useState } from 'react';
import { ContentCard } from '~/components/ui/layout';
import { Button } from '~/components/ui/button';
import { Download, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '~/lib/utils';

export interface CanvasSnapshot {
  id: string;
  imageData: string; // base64 data URL
  timestamp: Date;
  description: string;
}

interface CanvasSnapshotsProps {
  snapshots: CanvasSnapshot[];
  onDeleteSnapshot: (id: string) => void;
  onDownloadSnapshot: (snapshot: CanvasSnapshot) => void;
  onClearAllSnapshots: () => void;
}

export default function CanvasSnapshots({
  snapshots,
  onDeleteSnapshot,
  onDownloadSnapshot,
  onClearAllSnapshots
}: CanvasSnapshotsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleDownload = (snapshot: CanvasSnapshot) => {
    const link = document.createElement('a');
    link.href = snapshot.imageData;
    link.download = `canvas-snapshot-${snapshot.timestamp.getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownloadSnapshot(snapshot);
  };

  if (snapshots.length === 0) {
    return null;
  }

  return (
    <ContentCard className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Canvas Snapshots</h3>
          <span className="text-sm text-gray-500">({snapshots.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAllSnapshots}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 size={16} />
            Clear All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automatic snapshots of your canvas changes. These are read-only previews.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className={cn(
                  "relative group border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow",
                  selectedSnapshot === snapshot.id && "ring-2 ring-blue-500"
                )}
              >
                {/* Snapshot Image */}
                <div 
                  className="aspect-video bg-gray-100 dark:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedSnapshot(
                    selectedSnapshot === snapshot.id ? null : snapshot.id
                  )}
                >
                  <img
                    src={snapshot.imageData}
                    alt={`Canvas snapshot from ${formatTimestamp(snapshot.timestamp)}`}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye size={24} className="text-white" />
                  </div>
                </div>

                {/* Snapshot Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {snapshot.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {formatTimestamp(snapshot.timestamp)}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(snapshot)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Download size={12} className="mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteSnapshot(snapshot.id)}
                      className="h-8 px-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Snapshot Modal */}
          {selectedSnapshot && (
            <div 
              className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedSnapshot(null)}
            >
              <div className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">
                      {snapshots.find(s => s.id === selectedSnapshot)?.description}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSnapshot(null)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <img
                    src={snapshots.find(s => s.id === selectedSnapshot)?.imageData}
                    alt="Canvas snapshot preview"
                    className="max-w-full max-h-[70vh] object-contain mx-auto"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ContentCard>
  );
}
