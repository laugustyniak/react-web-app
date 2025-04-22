import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Slider } from "~/components/ui/slider";
import { Alert, AlertDescription } from "~/components/ui/alert";

// Mock types for the API
interface VideoData {
  video_id: string;
  video_url: string;
  duration_ms: number;
}

interface VideoFrame {
  frame_id: string;
  video_id: string;
  frame_number: number;
  timestamp_ms: number;
  frame_path: string;
  scene_score?: number;
}

const VideoFrameExtraction = () => {
  // State management
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 0]);
  const [bestFrames, setBestFrames] = useState<VideoFrame[]>([]);
  const [savedFrames, setSavedFrames] = useState<VideoFrame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  const playerRef = useRef<ReactPlayer>(null);

  // Example video URLs
  const exampleVideos = [
    'https://www.youtube.com/watch?v=LCmYC2qeqM0',
    'https://www.youtube.com/watch?v=8X_m6E3XEaw'
  ];

  // Mock API calls
  const loadVideo = async (url: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be a fetch to your API
      const response = await fetch('/api/videos/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: url })
      });
      
      if (!response.ok) throw new Error('Failed to load video');
      
      // Mock response
      const data: VideoData = {
        video_id: 'video_' + Date.now(),
        video_url: url,
        duration_ms: 180000 // Mock 3 minutes duration
      };
      
      setVideoData(data);
      setTimeRange([0, data.duration_ms / 1000]); // Set full range by default
      
      // Load saved frames for this video
      loadSavedFrames(data.video_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedFrames = async (videoId: string) => {
    try {
      // Mock API call
      const response = await fetch(`/api/frames/list?video_id=${videoId}`);
      if (!response.ok) throw new Error('Failed to load saved frames');
      
      // Mock data
      const mockSavedFrames: VideoFrame[] = Array(3).fill(null).map((_, idx) => ({
        frame_id: `frame_${idx}_${Date.now()}`,
        video_id: videoId,
        frame_number: idx + 1,
        timestamp_ms: (idx + 1) * 10000,
        frame_path: `https://picsum.photos/800/450?random=${idx}`, // Mock image URL
        scene_score: Math.random()
      }));
      
      setSavedFrames(mockSavedFrames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved frames');
    }
  };

  const extractFrames = async () => {
    if (!videoData) return;
    
    setIsLoading(true);
    try {
      // Mock API call
      const response = await fetch('/api/frames/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoData.video_id,
          start_time: timeRange[0],
          end_time: timeRange[1]
        })
      });
      
      if (!response.ok) throw new Error('Failed to extract frames');
      
      // Mock response - generate 6 frames
      const mockFrames: VideoFrame[] = Array(6).fill(null).map((_, idx) => ({
        frame_id: `extracted_${idx}_${Date.now()}`,
        video_id: videoData.video_id,
        frame_number: idx + 1,
        timestamp_ms: Math.floor(timeRange[0] * 1000 + (idx * ((timeRange[1] - timeRange[0]) * 1000) / 5)),
        frame_path: `https://picsum.photos/800/450?random=${idx + 10}`, // Different mock images
        scene_score: Math.random()
      }));
      
      setBestFrames(mockFrames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract frames');
    } finally {
      setIsLoading(false);
    }
  };

  const saveFrame = async (frame: VideoFrame) => {
    setIsLoading(true);
    try {
      // Mock API call
      const response = await fetch('/api/frames/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(frame)
      });
      
      if (!response.ok) throw new Error('Failed to save frame');
      
      // Update saved frames list
      setSavedFrames(prev => [...prev, frame]);
      
      // Show success message
      alert(`Frame saved successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save frame');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFrame = async (frameId: string) => {
    if (!confirm('Are you sure you want to delete this frame?')) return;
    
    setIsLoading(true);
    try {
      // Mock API call
      const response = await fetch(`/api/frames/delete?frame_id=${frameId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete frame');
      
      // Update state
      setSavedFrames(prev => prev.filter(frame => frame.frame_id !== frameId));
      
      // Show success message
      alert('Frame deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete frame');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFrame = (frameId: string) => {
    setBestFrames(prev => prev.filter(frame => frame.frame_id !== frameId));
  };

  // Format time in mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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
        
        <div className="mb-4 flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Example Video Links:</h2>
          <div className="flex flex-wrap gap-2">
            {exampleVideos.map((url, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="cursor-pointer"
                onClick={() => setVideoUrl(url)} 
              >
                {url}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <Input
            className="w-full"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)}
          />
          <Button 
            variant="default" 
            onClick={() => loadVideo(videoUrl)}
            disabled={!videoUrl || isLoading}
            className="min-w-[120px]"
          >
            Load Video
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {videoData && (
          <>
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
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  />
                </div>
              </Card>
            </div>
            
            {/* Saved Frames Section */}
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-4">
                📁 Saved Frames
              </h2>
              
              {savedFrames.length === 0 ? (
                <p>No saved frames found. Save some frames to see them here!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {savedFrames.map((frame, idx) => (
                    <Card key={frame.frame_id} className="h-full flex flex-col">
                      <div className="relative aspect-video">
                        <img
                          src={frame.frame_path}
                          alt={`Saved Frame ${idx + 1}`}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-grow">
                        <h3 className="text-lg font-semibold">Saved Frame {idx + 1}</h3>
                        <p className="text-sm">
                          Timestamp: {formatTime(frame.timestamp_ms / 1000)}
                        </p>
                        {frame.scene_score !== undefined && (
                          <p className="text-sm">
                            Scene Score: {frame.scene_score.toFixed(2)}
                          </p>
                        )}
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            className="w-full text-destructive"
                            onClick={() => deleteFrame(frame.frame_id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Time Range Selector */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Select Time Range</h3>
              <p className="mb-2">
                Video duration: {formatTime(videoData.duration_ms / 1000)}
              </p>
              
              <div className="px-2 py-4">
                <Slider
                  defaultValue={timeRange}
                  min={0}
                  max={videoData.duration_ms / 1000}
                  step={1}
                  onValueChange={(newValue) => setTimeRange(newValue as [number, number])}
                />
                <div className="flex justify-between mt-2">
                  <span>{formatTime(timeRange[0])}</span>
                  <span>{formatTime(timeRange[1])}</span>
                </div>
              </div>
              
              <Button 
                variant="default" 
                onClick={extractFrames}
                disabled={isLoading}
              >
                Extract Best Frames
              </Button>
            </div>
            
            {/* Extracted Frames */}
            {bestFrames.length > 0 && (
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-4">
                  🎞️ Extracted Frames
                </h2>
                
                <p className="mb-4">
                  Frames extracted from time range: {formatTime(timeRange[0])} to {formatTime(timeRange[1])}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {bestFrames.map((frame, idx) => (
                    <Card key={frame.frame_id} className="h-full flex flex-col">
                      <div className="relative aspect-video">
                        <img
                          src={frame.frame_path}
                          alt={`Frame ${idx + 1}`}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-grow">
                        <h3 className="text-lg font-semibold">Frame {idx + 1}</h3>
                        <p className="text-sm">
                          Timestamp: {formatTime(frame.timestamp_ms / 1000)}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <Button 
                            variant="default" 
                            className="flex-1"
                            onClick={() => saveFrame(frame)}
                          >
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 text-destructive"
                            onClick={() => removeFrame(frame.frame_id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoFrameExtraction;