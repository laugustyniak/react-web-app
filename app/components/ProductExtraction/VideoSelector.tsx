import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import React, { useState } from 'react';
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { VideoData } from '../../types/models';

interface VideoSelectorProps {
  availableVideos: VideoData[];
  videoData: VideoData | null;
  DEFAULT_VIDEO_ID: string;
  hasMoreVideos: boolean;
  isLoadingVideos: boolean;
  onSelect: (video: VideoData) => void;
  onLoadMore: () => void;
  onLoadAll: () => void;
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

// Helper to format duration from seconds to MM:SS
function formatDuration(video: VideoData): string {
  // Use duration_ms if available, otherwise fallback to duration_s converted to ms, or default to 0
  const durationMs = video.duration_ms || (video.duration_s ? video.duration_s * 1000 : 0);
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper to format processing status with emojis
function formatProcessingStatus(video: VideoData): string {
  if (video.is_processed === true) {
    return '✅ Processed';
  } else if (video.is_processed === false) {
    return '⏳ Processing';
  } else {
    return '❓ Unknown';
  }
}

// Helper to format created_at date
function formatCreatedDate(video: VideoData): string {
  if (!video.created_at) return 'N/A';

  try {
    // Handle format: Firestore Timestamp object
    const { seconds, nanoseconds } = video.created_at;

    const date = new Date(seconds * 1000 + nanoseconds / 1000000);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

const VideoSelector: React.FC<VideoSelectorProps> = ({
  availableVideos,
  videoData,
  DEFAULT_VIDEO_ID,
  hasMoreVideos,
  isLoadingVideos,
  onSelect,
  onLoadMore,
  onLoadAll,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const videosPerPage = 10;

  // Get unique videos first
  const uniqueVideos = getUniqueVideosByTitle(availableVideos);

  // Filter videos based on search query
  const filteredVideos = searchQuery
    ? uniqueVideos.filter(video => {
        const title = (video.title || '').toLowerCase();
        const id = video.video_id.toLowerCase();
        const status = formatProcessingStatus(video).toLowerCase();
        const createdDate = formatCreatedDate(video).toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || id.includes(query) || status.includes(query) || createdDate.includes(query);
      })
    : uniqueVideos;

  // Calculate pagination
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  const currentVideos = filteredVideos.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="mb-4 flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Available Videos</h2>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search videos by title, ID, or program..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Video Table */}
      {filteredVideos.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Title</th>
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Duration</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Created</th>
                <th className="text-left p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentVideos.map((video, index) => (
                <tr
                  key={video.video_id}
                  className={`border-t hover:bg-muted/30 transition-colors ${
                    videoData?.video_id === video.video_id ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {video.video_id === DEFAULT_VIDEO_ID && (
                        <span className="text-yellow-500">⭐</span>
                      )}
                      <span className="font-medium">
                        {video.title || 'Untitled'}
                      </span>
                      {videoData?.video_id === video.video_id && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground font-mono">
                    {video.video_id}
                  </td>
                  <td className="p-3 text-sm">
                    {formatDuration(video)}
                  </td>
                  <td className="p-3 text-sm">
                    {formatProcessingStatus(video)}
                  </td>
                  <td className="p-3 text-sm">
                    {formatCreatedDate(video)}
                  </td>
                  <td className="p-3">
                    <Button
                      variant={videoData?.video_id === video.video_id ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSelect(video)}
                      disabled={videoData?.video_id === video.video_id}
                    >
                      {videoData?.video_id === video.video_id ? 'Selected' : 'Load'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? (
            <p>No videos match your search. Try another query.</p>
          ) : (
            <p>Loading videos...</p>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredVideos.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredVideos.length)} of {filteredVideos.length} videos
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Load More Videos Button */}
      {!searchQuery && hasMoreVideos && (
        <div className="text-center flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingVideos}
          >
            {isLoadingVideos ? 'Loading...' : 'Load More Videos'}
          </Button>
          <Button
            variant="default"
            onClick={onLoadAll}
            disabled={isLoadingVideos}
          >
            {isLoadingVideos ? 'Loading...' : 'Load All Videos'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoSelector;
