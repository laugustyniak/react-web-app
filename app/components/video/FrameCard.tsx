import React, { useState } from 'react';
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { VideoFrame } from '~/services/videoService';
import { formatTime } from '~/services/videoService';
import FrameModal from './FrameModal';

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