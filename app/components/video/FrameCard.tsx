import React from 'react';
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { VideoFrame } from '~/services/videoService';
import { formatTime } from '~/services/videoService';

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
  return (
    <Card className="h-full flex flex-col">
      <div className="relative aspect-video">
        <img
          src={frame.frame_path}
          alt={`Frame ${index + 1}`}
          className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
          onClick={() => onSeek(frame.timestamp_ms / 1000)}
        />
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
  );
};

export default FrameCard; 