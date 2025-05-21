import React from 'react';
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { VideoData } from '../../types/models';

interface VideoSelectorProps {
  availableVideos: VideoData[];
  videoData: VideoData | null;
  DEFAULT_VIDEO_ID: string;
  hasMoreVideos: boolean;
  isLoadingVideos: boolean;
  onSelect: (video: VideoData) => void;
  onLoadMore: () => void;
}

// Helper to filter out videos with duplicate titles (keep first occurrence)
function getUniqueVideosByTitle(videos: VideoData[]): VideoData[] {
  const seen = new Set<string>();
  return videos.filter(video => {
    const title = video.title || video.video_id;
    if (seen.has(title)) return false;
    seen.add(title);
    return true;
  });
}

const VideoSelector: React.FC<VideoSelectorProps> = ({
  availableVideos,
  videoData,
  DEFAULT_VIDEO_ID,
  hasMoreVideos,
  isLoadingVideos,
  onSelect,
  onLoadMore,
}) => {
  const uniqueVideos = getUniqueVideosByTitle(availableVideos);

  return (
    <div className="mb-4 flex flex-col gap-2">
      <h2 className="text-xl font-semibold">Available Videos:</h2>
      <div className="flex flex-wrap gap-2">
        {uniqueVideos.length > 0 ? (
          uniqueVideos.map((video) => (
            <Badge
              key={video.video_id}
              variant={videoData?.video_id === video.video_id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onSelect(video)}
            >
              {video.video_id === DEFAULT_VIDEO_ID ? '⭐ ' : ''}{video.title ? video.title : video.video_id}
            </Badge>
          ))
        ) : (
          <p>Loading videos...</p>
        )}
        {hasMoreVideos && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingVideos}
          >
            {isLoadingVideos ? 'Loading...' : 'Load More Videos'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoSelector;
