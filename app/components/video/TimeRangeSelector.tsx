import React from 'react';
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import { LoadingSpinner } from "~/components/ui/loading";
import { formatTime } from '~/services/videoService';

interface TimeRangeSelectorProps {
  duration: number;
  timeRange: [number, number];
  onTimeRangeChange: (range: [number, number]) => void;
  onExtractFrames: () => void;
  isLoading: boolean;
  extractionProgress: number;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  duration,
  timeRange,
  onTimeRangeChange,
  onExtractFrames,
  isLoading,
  extractionProgress
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2">Select Time Range</h3>
      <p className="mb-2">
        Video duration: {formatTime(duration)}
      </p>
      
      <div className="px-2 py-4">
        <Slider
          defaultValue={timeRange}
          value={timeRange}
          min={0}
          max={duration}
          step={1}
          onValueChange={(newValue) => onTimeRangeChange(newValue as [number, number])}
        />
        <div className="flex justify-between mt-2">
          <span>{formatTime(timeRange[0])}</span>
          <span>{formatTime(timeRange[1])}</span>
        </div>
      </div>
      
      <Button 
        variant="default" 
        onClick={onExtractFrames}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center">
            <LoadingSpinner className="mr-2" />
            {extractionProgress > 0 ? `${extractionProgress}%` : 'Extracting...'}
          </div>
        ) : 'Extract Best Frames'}
      </Button>
    </div>
  );
};

export default TimeRangeSelector; 