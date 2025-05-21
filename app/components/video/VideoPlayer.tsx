import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Card } from "~/components/ui/card";
import type { VideoData } from '~/types/models';


export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  getDuration: () => number;
}

interface VideoPlayerProps {
  videoData: VideoData;
  onReady: (player: ReactPlayer) => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ videoData, onReady }, ref) => {
  const playerRef = useRef<ReactPlayer>(null);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time, 'seconds');
      }
    },
    getDuration: () => {
      return playerRef.current ? playerRef.current.getDuration() : 0;
    }
  }));
  
  return (
    <div className="mb-4">
      <Card className="p-4">
        <h3 className="text-2xl font-semibold mb-4">Video Player</h3>
        <div className="relative aspect-video">
          <ReactPlayer
            ref={playerRef}
            url={videoData.video_url}
            width="100%"
            height="100%"
            controls
            onReady={onReady}
            style={{ position: 'absolute', top: 0, left: 0 }}
            config={{
              youtube: {
                playerVars: { origin: window.location.origin }
              },
              file: {
                attributes: {
                  controlsList: 'nodownload'
                }
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer; 