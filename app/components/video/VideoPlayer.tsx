import ReactPlayer from 'react-player';
import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { VideoData } from '~/types/models';

export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  captureFrame: () => string | null;
}

interface VideoPlayerProps {
  videoData: VideoData;
  onReady: (player: ReactPlayer) => void;
  onSaveFrame?: (frameData: string, timestamp: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ videoData, onReady, onSaveFrame }, ref) => {
  const playerRef = useRef<ReactPlayer>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Force use of storage_url when available for reliable frame extraction
  const videoUrl = videoData.storage_url || videoData.video_url;
  const isUsingStorageUrl = !!videoData.storage_url;
  
  // Debug logging (can be removed in production)
  console.log('VideoPlayer URL selection:', {
    storage_url: videoData.storage_url ? 'Available' : 'Missing',
    using_storage_url: isUsingStorageUrl,
    final_url_type: isUsingStorageUrl ? 'Server copy' : 'Original source'
  });
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time, 'seconds');
      }
    },
    getDuration: () => {
      return playerRef.current ? playerRef.current.getDuration() : 0;
    },
    getCurrentTime: () => {
      return currentTime;
    },
    captureFrame: () => {
      return captureCurrentFrame();
    }
  }));

  // Capture current frame from video
  const captureCurrentFrame = (): string | null => {
    console.log('Starting frame capture...');
    try {
      const player = playerRef.current;
      console.log('Player ref:', player);
      if (!player) {
        console.log('No player reference');
        return null;
      }

      // Get the internal player (video element)
      const internalPlayer = player.getInternalPlayer() as HTMLVideoElement;
      console.log('Internal player:', internalPlayer);
      console.log('Video dimensions:', internalPlayer?.videoWidth, 'x', internalPlayer?.videoHeight);
      
      if (!internalPlayer || !internalPlayer.videoWidth) {
        console.log('No internal player or video not loaded');
        return null;
      }

      // Create canvas and capture frame
      const canvas = canvasRef.current;
      console.log('Canvas ref:', canvas);
      if (!canvas) {
        console.log('No canvas reference');
        return null;
      }

      const ctx = canvas.getContext('2d');
      console.log('Canvas context:', ctx);
      if (!ctx) {
        console.log('No canvas context');
        return null;
      }

      // Set canvas dimensions to match video
      canvas.width = internalPlayer.videoWidth;
      canvas.height = internalPlayer.videoHeight;
      console.log('Canvas dimensions set to:', canvas.width, 'x', canvas.height);

      // Draw current video frame to canvas
      ctx.drawImage(internalPlayer, 0, 0, canvas.width, canvas.height);
      console.log('Frame drawn to canvas');

      // Convert to base64 data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Data URL generated, length:', dataUrl.length);
      return dataUrl;
    } catch (error) {
      console.error('Error capturing frame:', error);
      return null;
    }
  };

  // Handle save frame button click
  const handleSaveFrame = () => {
    console.log('Save frame button clicked');
    console.log('onSaveFrame prop:', onSaveFrame);
    console.log('Current time:', currentTime);
    
    const frameData = captureCurrentFrame();
    console.log('Frame data captured:', frameData ? 'Success' : 'Failed');
    
    if (frameData && onSaveFrame) {
      console.log('Calling onSaveFrame with:', { frameData: frameData.substring(0, 50) + '...', currentTime });
      onSaveFrame(frameData, currentTime);
    } else {
      console.log('Cannot save frame - missing frameData or onSaveFrame callback');
    }
  };

  // Handle progress updates
  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };

  return (
    <div className="mb-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-semibold">Video Player</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isUsingStorageUrl ? 
                `🟢 Using server copy: ${videoData.storage_url?.substring(0, 80)}...` : 
                `🟡 Using original source: ${videoData.video_url.substring(0, 80)}...`
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Frame extraction: {isUsingStorageUrl ? "✅ Enabled" : "⚠️ Limited (CORS restrictions)"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
            </span>
            <Button
              onClick={handleSaveFrame}
              disabled={!videoData}
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              📸 Save Frame from Video
            </Button>
          </div>
        </div>
        <div className="relative aspect-video">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="100%"
            controls
            onReady={onReady}
            onProgress={handleProgress}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            style={{ position: 'absolute', top: 0, left: 0 }}
            config={{
              youtube: {
                playerVars: { origin: window.location.origin }
              },
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  crossOrigin: 'anonymous'
                }
              }
            }}
          />
          {/* Hidden canvas for frame capture */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
        </div>
        {!isPlaying && (
          <div className="mt-2 text-center">
            <p className="text-sm text-muted-foreground">
              Video is paused - click "Save Frame from Video" to capture the current frame
            </p>
          </div>
        )}
      </Card>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;