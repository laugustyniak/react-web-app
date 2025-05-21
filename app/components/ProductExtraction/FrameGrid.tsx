import React from 'react';
import { Card } from "~/components/ui/card";
import type { VideoFrame } from '../../types/models';

interface FrameGridProps {
  frames: VideoFrame[];
  selectedFrameIndex: number | null;
  onSelect: (idx: number) => void;
  highlightedFrameIndex?: number | null;
}

const FrameGrid: React.FC<FrameGridProps> = ({ frames, selectedFrameIndex, onSelect, highlightedFrameIndex }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-2">All Available Frames</h2>
    <p className="mb-2">📊 Showing all {frames.length} available frames. Select any frame to analyze products.</p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
      {frames.map((frame, idx) => {
        const isSelected = selectedFrameIndex === idx;
        const isHighlighted = highlightedFrameIndex === idx;
        return (
          <Card
            key={frame.frame_id}
            className={`cursor-pointer border-2 transition-transform hover:scale-102 ${isSelected ? 'border-blue-500 ring-2 ring-blue-400' : isHighlighted ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-none'}`}
            onClick={() => onSelect(idx)}
          >
            <div className="relative aspect-video">
              <img
                src={frame.image_url || frame.storage_url || frame.frame_path || `https://picsum.photos/800/450?random=${idx}`}
                alt={`Frame ${idx + 1}`}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-2 text-center">
              <p className="text-sm">Frame {idx + 1}</p>
            </div>
          </Card>
        );
      })}
    </div>
  </div>
);

export default FrameGrid;
