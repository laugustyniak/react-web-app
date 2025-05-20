// Types for video processing
export interface VideoData {
  video_id: string;
  video_url: string;
  duration_s: number;
}

export interface VideoFrame {
  frame_id: string;
  video_id: string;
  frame_number: number;
  timestamp_ms: number;
  frame_path: string;  // URL to image
  scene_score?: number;
}

// Format time in mm:ss
export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// API functions
export const loadVideo = async (url: string): Promise<VideoData> => {
  console.log('Making API call to /api/videos/load');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  // Create unique ID for video
  const videoId = `video_${Date.now()}`;
  
  // Return mock video data
  return {
    video_id: videoId,
    video_url: url,
    duration_s: 0 // Will be updated on player ready
  };
};

export const loadSavedFrames = async (videoId: string): Promise<VideoFrame[]> => {
  console.log(`Making API call to /api/frames/list?video_id=${videoId}`);
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  // Mock data
  const mockSavedFrames: VideoFrame[] = Array(3).fill(null).map((_, idx) => ({
    frame_id: `frame_${idx}_${Date.now()}`,
    video_id: videoId,
    frame_number: idx + 1,
    timestamp_ms: (idx + 1) * 10000,
    frame_path: `https://picsum.photos/800/450?random=${idx}`, // Mock image URL
    scene_score: Math.random()
  }));
  
  return mockSavedFrames;
};

export const extractFrames = async (
  videoId: string, 
  timeRange: [number, number], 
  onProgress: (value: number) => void
): Promise<VideoFrame[]> => {
  console.log('Making API call to /api/frames/extract');
  
  // Simulate progress updates
  const progressInterval = setInterval(() => {
    const newProgress = Math.min(90, Math.floor(Math.random() * 20) + 10);
    onProgress(newProgress);
  }, 500);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  clearInterval(progressInterval);
  onProgress(100);
  
  // Generate mock frames
  const [startTime, endTime] = timeRange;
  const framesCount = 8;
  const timeInterval = (endTime - startTime) / (framesCount - 1);
  
  const mockFrames: VideoFrame[] = Array(framesCount).fill(null).map((_, idx) => {
    const timestamp = Math.round((startTime + (idx * timeInterval)) * 1000);
    return {
      frame_id: `frame_${Date.now()}_${idx}`,
      video_id: videoId,
      frame_number: idx + 1,
      timestamp_ms: timestamp,
      frame_path: `https://picsum.photos/800/450?random=${idx + 10}`, // Different mock images
      scene_score: Math.random() // Random scene score between 0-1
    };
  });
  
  // Sort by scene score (descending)
  return [...mockFrames].sort((a, b) => 
    (b.scene_score || 0) - (a.scene_score || 0)
  );
};

export const saveFrame = async (frame: VideoFrame): Promise<boolean> => {
  console.log('Making API call to /api/frames/save');
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  return true;
};

export const deleteFrame = async (frameId: string): Promise<boolean> => {
  console.log(`Making API call to /api/frames/delete?frame_id=${frameId}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return true;
}; 