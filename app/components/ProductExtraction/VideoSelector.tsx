import React, { useState } from 'react';
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Get unique videos first
  const uniqueVideos = getUniqueVideosByTitle(availableVideos);
  
  // Filter videos based on search query
  const filteredVideos = searchQuery
    ? uniqueVideos.filter(video => {
        const title = (video.title || '').toLowerCase();
        const id = video.video_id.toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || id.includes(query);
      })
    : uniqueVideos;

  return (
    <div className="mb-4 flex flex-col gap-2">
      <h2 className="text-xl font-semibold">Available Videos:</h2>
      
      {/* Search input */}
      <div className="relative mb-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search videos by title or ID..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <Badge
              key={video.video_id}
              variant={videoData?.video_id === video.video_id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onSelect(video)}
            >
              {video.video_id === DEFAULT_VIDEO_ID ? '⭐ ' : ''}{video.title ? video.title : video.video_id}
              {video.title ? ` (${video.video_id})` : ''}
            </Badge>
          ))
        ) : (
          searchQuery ? (
            <p>No videos match your search. Try another query.</p>
          ) : (
            <p>Loading videos...</p>
          )
        )}
        {!searchQuery && hasMoreVideos && (
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
