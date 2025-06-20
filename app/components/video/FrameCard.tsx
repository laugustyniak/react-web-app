import React, { useState } from 'react';
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { VideoFrame } from '~/types/models';
import { formatTime } from '~/services/videoService';
import FrameModal from './FrameModal';

// Helper function to format Firestore timestamp with relative time
const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'Unknown';
  
  try {
    let date: Date;
    
    // Handle Firestore Timestamp object
    if (typeof timestamp === 'object' && 'toDate' in timestamp) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'Invalid date';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Show relative time for recent timestamps
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      // Show full date for older timestamps
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (error) {
    return 'Invalid date';
  }
};

interface FrameCardProps {
  frame: VideoFrame;
  index: number;
  onSeek: (time: number) => void;
  actions: Array<{
    label: string;
    variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
    onClick: () => void;
    className?: string;
  }>;
}

const FrameCard: React.FC<FrameCardProps> = ({ 
  frame, 
  index,
  onSeek,
  actions
}) => {
  const [showModal, setShowModal] = useState(false);
  
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };
  
  const handleSeek = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSeek(frame.timestamp_ms / 1000);
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <div className="relative aspect-video">
          <img
            src={frame.storage_url}
            alt={`Frame ${index + 1}`}
            className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
            onClick={handleImageClick}
          />
          <div 
            className="absolute bottom-2 right-2 bg-black/70 text-white p-1 rounded cursor-pointer hover:bg-black/90"
            onClick={handleSeek}
            title="Seek to this timestamp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
        <div className="p-4 flex-grow">
          <h3 className="text-lg font-semibold">Frame {index + 1}</h3>
          <p className="text-sm">
            Timestamp: {formatTime(frame.timestamp_ms / 1000)}
          </p>
          {frame.updated_at && (
            <p className="text-xs text-muted-foreground">
              Updated: {formatTimestamp(frame.updated_at)}
            </p>
          )}
          {frame.scene_score !== undefined && (
            <p className="text-sm">
              Scene Score: {frame.scene_score.toFixed(2)}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            {actions.map((action, idx) => (
              <Button 
                key={idx}
                variant={action.variant} 
                className={`flex-1 ${action.className || ''}`}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>
      <FrameModal 
        frame={showModal ? frame : null} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default FrameCard;