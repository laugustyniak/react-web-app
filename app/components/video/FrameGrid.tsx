import React from 'react';
import type { VideoFrame } from '~/types/models';
import FrameCard from './FrameCard';
import { formatTime } from '~/services/videoService';

interface FrameGridProps {
  title: string;
  description?: string;
  frames: VideoFrame[];
  emptyMessage: string;
  onSeek: (time: number) => void;
  getFrameActions: (frame: VideoFrame, index: number) => Array<{
    label: string;
    variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
    onClick: () => void;
    className?: string;
  }>;
  timeRange?: [number, number];
}

const FrameGrid: React.FC<FrameGridProps> = ({
  title,
  description,
  frames,
  emptyMessage,
  onSeek,
  getFrameActions,
  timeRange
}) => {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold mb-4">
        {title}
      </h2>
      
      {description && (
        <p className="mb-4">{description}</p>
      )}
      
      {timeRange && (
        <p className="mb-4">
          Frames extracted from time range: {formatTime(timeRange[0])} to {formatTime(timeRange[1])}
        </p>
      )}
      
      {frames.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {frames.map((frame, idx) => (
            <FrameCard
              key={frame.frame_id}
              frame={frame}
              index={idx}
              onSeek={onSeek}
              actions={getFrameActions(frame, idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FrameGrid; 