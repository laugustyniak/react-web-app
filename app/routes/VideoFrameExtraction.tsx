import { DocumentSnapshot } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { toast } from 'sonner';
import { Link } from 'react-router';
import VideoSelector from '~/components/ProductExtraction/VideoSelector';
import FrameGrid from '~/components/video/FrameGrid';
import TimeRangeSelector from '~/components/video/TimeRangeSelector';
import VideoInput from '~/components/video/VideoInput';
import { Button } from "~/components/ui/button";
import type { VideoPlayerRef } from '~/components/video/VideoPlayer';
import VideoPlayer from '~/components/video/VideoPlayer';
import { getAllVideos, insertVideo } from '~/lib/firestoreService';
import type { VideoData, VideoFrame } from '~/types/models';

import {
  deleteFrame as apiDeleteFrame,
  extractFrames as apiExtractFrames,
  loadSavedFrames as apiLoadSavedFrames,
  loadVideo as apiLoadVideo,
  saveFrame as apiSaveFrame
} from '../services/videoService';

const VideoFrameExtraction = () => {
  // State management
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 0]);
  const [bestFrames, setBestFrames] = useState<VideoFrame[]>([]);
  const [savedFrames, setSavedFrames] = useState<VideoFrame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Video selector state
  const [availableVideos, setAvailableVideos] = useState<VideoData[]>([]);
  const [lastVideoDoc, setLastVideoDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false);
  const [showVideoSelector, setShowVideoSelector] = useState<boolean>(false);

  // References
  const playerRef = useRef<VideoPlayerRef>(null);

  const DEFAULT_VIDEO_ID = '8X_m6E3XEaw';

  // Load videos from Firestore on component mount
  useEffect(() => {
    loadVideosFromFirebase();
  }, []);

  // Load videos from Firestore
  const loadVideosFromFirebase = async () => {
    try {
      setIsLoadingVideos(true);
      const { documents, lastDoc, hasMore } = await getAllVideos(200, lastVideoDoc); // Load up to 200 videos by default
      setAvailableVideos(prev => [...prev, ...documents]);
      setLastVideoDoc(lastDoc);
      setHasMoreVideos(hasMore);
      // Don't auto-select a video - let user choose via VideoInput or VideoSelector
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos from Firebase');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Load more videos from Firebase
  const loadMoreVideos = () => {
    if (hasMoreVideos && !isLoadingVideos) {
      loadVideosFromFirebase();
    }
  };

  // Refresh video list (reset and reload from beginning)
  const refreshVideoList = async () => {
    try {
      setIsLoadingVideos(true);
      setLastVideoDoc(null);
      setHasMoreVideos(true);
      const { documents, lastDoc, hasMore } = await getAllVideos(200, null); // Reset to first page
      setAvailableVideos(documents); // Replace existing videos instead of appending
      setLastVideoDoc(lastDoc);
      setHasMoreVideos(hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh videos');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Load ALL videos from Firebase
  const loadAllVideos = async () => {
    if (isLoadingVideos) return;

    try {
      setIsLoadingVideos(true);
      setError(null);

      let allVideos: VideoData[] = [...availableVideos];
      let currentLastDoc = lastVideoDoc;
      let hasMore = hasMoreVideos;

      // Keep loading batches until we have all videos
      while (hasMore) {
        const { documents, lastDoc, hasMore: moreAvailable } = await getAllVideos(50, currentLastDoc);
        allVideos = [...allVideos, ...documents];
        currentLastDoc = lastDoc;
        hasMore = moreAvailable;
      }

      // Update state with all videos
      setAvailableVideos(allVideos);
      setLastVideoDoc(currentLastDoc);
      setHasMoreVideos(false);

      console.log(`Loaded ${allVideos.length} videos total`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load all videos from Firebase');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Handle loading a video
  const handleLoadVideo = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Basic validation
      if (!ReactPlayer.canPlay(url)) {
        throw new Error('Unsupported video URL');
      }

      // Call API to load video
      const data = await apiLoadVideo(url);
      setVideoData(data);

      // Load saved frames for this video
      const frames = await apiLoadSavedFrames(data.video_id);
      setSavedFrames(frames);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding video to processing queue
  const handleAddVideoToProcessing = async (url: string) => {
    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!ReactPlayer.canPlay(url)) {
        throw new Error('Unsupported video URL');
      }

      // Create video data with queued status
      const videoData: VideoData = {
        video_id: (() => {
          const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          return match && match[1] ? match[1] : '';
        })(),
        video_url: url,
        is_processed: false, // Queued status
        title: `Video from ${url}`,
        description: ''
      };

      // Save to Firebase using insertVideo from firestoreService
      const docId = await insertVideo(videoData as VideoData);

      // Check if docId is not empty and show success toast
      if (docId && docId.trim() !== '') {
        toast.success('Video added successfully!', {
          description: 'Video has been added to the processing queue and will be processed shortly.'
        });

        // Refresh the video table to show the recently added video
        await refreshVideoList();
      } else {
        throw new Error('Failed to get document ID after inserting video');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video to processing queue');
      toast.error('Failed to add video', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle player ready event
  const handlePlayerReady = (player: ReactPlayer) => {
    if (!videoData) return;

    const duration = player.getDuration();
    console.log('handlePlayerReady - before update:', {
      storage_url: videoData.storage_url,
      video_url: videoData.video_url,
      duration
    });
    
    const updatedVideoData = {
      ...videoData,
      duration_s: duration
    };
    
    console.log('handlePlayerReady - after update:', {
      storage_url: updatedVideoData.storage_url,
      video_url: updatedVideoData.video_url,
      duration_s: updatedVideoData.duration_s
    });
    
    setVideoData(updatedVideoData);
    setTimeRange([0, duration]);
  };

  // Handle extracting frames
  const handleExtractFrames = async () => {
    if (!videoData) return;

    setIsLoading(true);
    setBestFrames([]);
    setError(null);
    setExtractionProgress(0);

    try {
      // Call API to extract frames
      const frames = await apiExtractFrames(
        videoData.video_id,
        timeRange,
        setExtractionProgress
      );

      setBestFrames(frames);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract frames');
    } finally {
      setIsLoading(false);
      setExtractionProgress(0);
    }
  };

  // Handle saving a frame
  const handleSaveFrame = async (frame: VideoFrame) => {
    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading('Saving frame...', {
      description: `Saving frame ${frame.frame_id}`
    });

    try {
      // Check if frame is already saved
      if (savedFrames.some(f => f.frame_id === frame.frame_id)) {
        toast.dismiss(loadingToast);
        toast.warning('Frame already saved', {
          description: 'This frame is already in your saved collection.'
        });
        return;
      }

      // Call API to save frame
      const success = await apiSaveFrame(frame);

      if (success) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Show success toast
        toast.success('Frame saved successfully!', {
          description: `Frame ${frame.frame_id} added to collection`
        });

        // Reload saved frames to get the updated list
        if (videoData) {
          const updatedFrames = await apiLoadSavedFrames(videoData.video_id);
          setSavedFrames(updatedFrames);
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to save frame', {
          description: 'Please try again'
        });
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Error saving frame', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
      setError(err instanceof Error ? err.message : 'Failed to save frame');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving a frame captured from video player
  const handleSaveFrameFromVideo = async (frameData: string, timestamp: number) => {
    console.log('handleSaveFrameFromVideo called with:', {
      frameDataLength: frameData.length,
      timestamp,
      videoData: videoData ? 'Present' : 'Missing'
    });

    if (!videoData) {
      console.log('No video data available');
      return;
    }

    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading('Saving frame...', {
      description: `Capturing frame at ${Math.floor(timestamp / 60)}:${Math.floor(timestamp % 60).toString().padStart(2, '0')}`
    });

    try {
      // Create a VideoFrame object for the captured frame
      const frame: VideoFrame = {
        frame_id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        video_id: videoData.video_id,
        frame_number: Math.floor(timestamp * 30), // Assume 30fps for frame number
        timestamp_ms: Math.floor(timestamp * 1000), // Convert seconds to milliseconds
        frame_path: '', // Will be set by backend
        storage_url: frameData, // Use base64 data URL as storage URL for now
        scene_score: 1.0, // Manual captures get max quality score
        image_url: frameData // Use base64 data URL for display
      };

      // Check if a frame at this timestamp is already saved
      const existingFrame = savedFrames.find(f => Math.abs(f.timestamp_ms - timestamp * 1000) < 500);
      if (existingFrame) {
        toast.dismiss(loadingToast);
        toast.warning('Frame already exists', {
          description: 'A frame near this timestamp is already saved.'
        });
        return;
      }

      // Call API to save frame using the videoService
      const success = await apiSaveFrame(frame);

      if (success) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Show success toast
        toast.success('Frame saved successfully!', {
          description: `Frame captured at ${Math.floor(timestamp / 60)}:${Math.floor(timestamp % 60).toString().padStart(2, '0')}`
        });

        // Reload saved frames to get the updated list
        const updatedFrames = await apiLoadSavedFrames(videoData.video_id);
        setSavedFrames(updatedFrames);
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to save frame', {
          description: 'Please try again'
        });
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Error saving frame', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
      setError(err instanceof Error ? err.message : 'Failed to save frame from video');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a frame
  const handleDeleteFrame = async (frameId: string) => {
    if (!confirm('Are you sure you want to delete this frame?')) return;

    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading('Deleting frame...', {
      description: `Removing frame ${frameId}`
    });

    try {
      // Call API to delete frame
      const success = await apiDeleteFrame(frameId);

      if (success) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Show success toast
        toast.success('Frame deleted successfully!', {
          description: `Frame ${frameId} removed from collection`
        });

        // Remove from state
        setSavedFrames(prev => prev.filter(frame => frame.frame_id !== frameId));
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to delete frame', {
          description: 'Please try again'
        });
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Error deleting frame', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
      setError(err instanceof Error ? err.message : 'Failed to delete frame');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing a frame from the list (without deleting)
  const handleRemoveFrame = (frameId: string) => {
    setBestFrames(prev => prev.filter(frame => frame.frame_id !== frameId));
  };

  // Seek to timestamp in player
  const handleSeekToTime = (timeSeconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(timeSeconds);
    }
  };

  // Get actions for extracted frames
  const getExtractedFrameActions = (frame: VideoFrame) => [
    {
      label: 'Save',
      variant: 'default' as const,
      onClick: () => handleSaveFrame(frame)
    },
    {
      label: 'Remove',
      variant: 'outline' as const,
      onClick: () => handleRemoveFrame(frame.frame_id),
      className: 'text-destructive'
    }
  ];

  // Get actions for saved frames
  const getSavedFrameActions = (frame: VideoFrame) => [
    {
      label: 'Delete',
      variant: 'outline' as const,
      onClick: () => handleDeleteFrame(frame.frame_id),
      className: 'text-destructive'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="py-4">
        <h1 className="text-3xl font-bold mb-4">
          🎬 Video Frame Extraction
        </h1>

        <p className="mb-4">
          Extract the best frames from your video content for product analysis. Select a specific time range
          to focus on the most relevant parts of your content.
        </p>

        {/* Quick action to search for products */}
        {videoData && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  🔍 Ready to find products in this video?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Switch to product search and analysis for "{videoData.title || videoData.video_id}"
                </p>
              </div>
              <Link 
                to={`/product-extraction?video_id=${videoData.video_id}&video_url=${encodeURIComponent(videoData.video_url)}`}
                className="flex-shrink-0 ml-4"
              >
                <Button 
                  variant="default" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Search for Products →
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Video Input Component - Primary option */}
        <VideoInput
          onVideoLoad={handleLoadVideo}
          onAddToProcessing={handleAddVideoToProcessing}
          isLoading={isLoading}
          error={error}
        />

        {/* Toggle for Video Selector */}
        <div className="my-6 text-center">
          <button
            onClick={() => setShowVideoSelector(!showVideoSelector)}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            {showVideoSelector ? 'Hide' : 'Show'} existing videos library
          </button>
        </div>

        {/* Video Selector Component - Alternative option */}
        {showVideoSelector && (
          <>
            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="mx-4 text-sm text-gray-500 bg-white px-2">OR</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Choose from Existing Videos</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select from previously uploaded videos in your library
              </p>
              <VideoSelector
                availableVideos={availableVideos}
                videoData={videoData}
                DEFAULT_VIDEO_ID={DEFAULT_VIDEO_ID}
                hasMoreVideos={hasMoreVideos}
                isLoadingVideos={isLoadingVideos}
                onSelect={async (video) => {
                  setVideoData(video);
                  await handleLoadVideo(video.video_url);
                }}
                onLoadMore={loadMoreVideos}
                onLoadAll={loadAllVideos}
              />
            </div>
          </>
        )}

        {videoData && (
          <>
            {/* Video Player Component */}
            <VideoPlayer
              ref={playerRef}
              videoData={videoData}
              onReady={handlePlayerReady}
              onSaveFrame={handleSaveFrameFromVideo}
            />

            {/* Saved Frames Component */}
            <FrameGrid
              title="📁 Saved Frames"
              frames={savedFrames}
              emptyMessage="No saved frames found. Save some frames to see them here!"
              onSeek={handleSeekToTime}
              getFrameActions={getSavedFrameActions}
            />

            {/* Time Range Selector Component */}
            <TimeRangeSelector
              duration={videoData.duration_s || 0}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              onExtractFrames={handleExtractFrames}
              isLoading={isLoading}
              extractionProgress={extractionProgress}
            />

            {/* Extracted Frames Component */}
            {bestFrames.length > 0 && (
              <FrameGrid
                title="🎞️ Extracted Frames"
                frames={bestFrames}
                emptyMessage="No frames extracted yet."
                onSeek={handleSeekToTime}
                getFrameActions={getExtractedFrameActions}
                timeRange={timeRange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoFrameExtraction;
