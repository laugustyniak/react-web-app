// Canvas/components/SessionInspirations.tsx
import { useState } from 'react';
import { ContentCard } from '~/components/ui/layout';
import { Button } from '~/components/ui/button';
import { Download, Trash2, Eye, ChevronDown, ChevronUp} from 'lucide-react';
import { cn } from '~/lib/utils';

export interface SessionInspiration {
  id: string;
  imageData: string; // base64 data URL
  timestamp: Date;
  prompt: string;
  negativePrompt: string;
  canvasSnapshot?: string; // original canvas before generation
}

interface SessionInspirationsProps {
  inspirations: SessionInspiration[];
  onDeleteInspiration: (id: string) => void;
  onDownloadInspiration: (inspiration: SessionInspiration) => void;
  onClearAllInspirations: () => void;
}

export default function SessionInspirations({
  inspirations,
  onDeleteInspiration,
  onDownloadInspiration,
  onClearAllInspirations
}: SessionInspirationsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedInspiration, setSelectedInspiration] = useState<string | null>(null);

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleDownload = (inspiration: SessionInspiration) => {
    const link = document.createElement('a');
    link.href = inspiration.imageData.startsWith('data:') 
      ? inspiration.imageData 
      : `data:image/png;base64,${inspiration.imageData}`;
    link.download = `session-inspiration-${inspiration.timestamp.getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownloadInspiration(inspiration);
  };

  const truncatePrompt = (prompt: string, maxLength: number = 50) => {
    if (prompt.length <= maxLength) return prompt;
    return prompt.substring(0, maxLength) + '...';
  };

  if (inspirations.length === 0) {
    return null;
  }

  return (
    <ContentCard className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Session Inspirations</h3>
          <span className="text-sm text-gray-500">({inspirations.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAllInspirations}
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
            AI-generated inspirations from your current session. These are your creative results.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inspirations.map((inspiration) => (
              <div
                key={inspiration.id}
                className={cn(
                  "relative group border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow",
                  selectedInspiration === inspiration.id && "ring-2 ring-purple-500"
                )}
              >
                {/* Inspiration Image */}
                <div 
                  className="aspect-video bg-gray-100 dark:bg-gray-700 cursor-pointer relative"
                  onClick={() => setSelectedInspiration(
                    selectedInspiration === inspiration.id ? null : inspiration.id
                  )}
                >
                  <img
                    src={inspiration.imageData.startsWith('data:') 
                      ? inspiration.imageData 
                      : `data:image/png;base64,${inspiration.imageData}`}
                    alt={`Generated inspiration from ${formatTimestamp(inspiration.timestamp)}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* AI Generation Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      AI Generated
                    </span>
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye size={24} className="text-white" />
                  </div>
                </div>

                {/* Inspiration Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {truncatePrompt(inspiration.prompt)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {formatTimestamp(inspiration.timestamp)}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(inspiration)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Download size={12} className="mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteInspiration(inspiration.id)}
                      className="h-8 px-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Inspiration Modal */}
          {selectedInspiration && (
            <div 
              className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedInspiration(null)}
            >
              <div className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">
                      Generated Inspiration
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedInspiration(null)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                  <div className="space-y-4">
                    {/* Generated Image */}
                    <div>
                      <img
                        src={inspirations.find(i => i.id === selectedInspiration)?.imageData.startsWith('data:') 
                          ? inspirations.find(i => i.id === selectedInspiration)?.imageData
                          : `data:image/png;base64,${inspirations.find(i => i.id === selectedInspiration)?.imageData}`}
                        alt="Generated inspiration preview"
                        className="max-w-full max-h-[50vh] object-contain mx-auto rounded-lg"
                      />
                    </div>
                    
                    {/* Prompt Details */}
                    {(() => {
                      const inspiration = inspirations.find(i => i.id === selectedInspiration);
                      if (!inspiration) return null;
                      
                      return (
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Prompt:
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              {inspiration.prompt}
                            </p>
                          </div>
                          
                          {inspiration.negativePrompt && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Negative Prompt:
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                {inspiration.negativePrompt}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Generated:
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatTimestamp(inspiration.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ContentCard>
  );
}