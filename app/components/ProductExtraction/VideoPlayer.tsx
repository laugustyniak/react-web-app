import React from 'react';
import ReactPlayer from 'react-player';
import { Card } from "~/components/ui/card";
import type { VideoData } from '../../types/models';

interface VideoPlayerProps {
  videoData: VideoData;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoData }) => (
  <Card className="p-4 mb-4">
    <h3 className="text-2xl font-semibold mb-4">Video Player</h3>
    <div className="relative aspect-video">
      <ReactPlayer
        url={videoData.video_url}
        width="100%"
        height="100%"
        controls
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  </Card>
);

export default VideoPlayer;
