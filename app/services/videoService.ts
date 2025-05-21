import type { VideoData, VideoFrame } from '~/types/models';

// Format time in mm:ss
export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// API functions
export const loadVideo = async (url: string): Promise<VideoData> => {
  console.log('Making API call to /api/videos/load with URL:', url);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  // Extract YouTube video ID if possible, otherwise fallback to timestamp
  let videoId = '';
  const ytMatch = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    videoId = ytMatch[1];
    console.log('Extracted YouTube video ID:', videoId);
  } else {
    videoId = `video_${Date.now()}`;
    console.log('Non-YouTube video, generated video ID:', videoId);
  }

  // Return mock video data
  const videoData: VideoData = {
    video_id: videoId,
    video_url: url,
    duration_s: 0 // Will be updated on player ready
  };
  console.log('Returning video data:', videoData);
  return videoData;
};

export const loadSavedFrames = async (videoId: string): Promise<VideoFrame[]> => {
  console.log(`Fetching frames for video_id=${videoId}`);

  try {
    // Import dynamically to avoid circular dependency
    const { getFramesByVideoId } = await import('../lib/firestoreService');

    // Get frames from Firestore
    const frames = await getFramesByVideoId(videoId);

    // Log the result
    if (frames && frames.length > 0) {
      console.log(`Found ${frames.length} frames in database`);
    } else {
      console.log('No frames found in database');
    }

    // Return frames from Firestore (will be empty array if none found)
    return frames;
  } catch (error) {
    console.error('Error loading frames:', error);
    // Return empty array on error
    return [];
  }
};

export const extractFrames = async (
  videoId: string,
  timeRange: [number, number],
  onProgress: (value: number) => void
): Promise<VideoFrame[]> => {
  console.log('Extracting frames for video', videoId, 'time range:', timeRange);

  try {
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      const newProgress = Math.min(90, Math.floor(Math.random() * 20) + 10);
      onProgress(newProgress);
    }, 500);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Import Firestore functions dynamically to avoid circular dependency
    const { addDocument } = await import('../lib/firestore');

    // Generate frames based on the time range
    const [startTime, endTime] = timeRange;
    const framesCount = 8;
    const timeInterval = (endTime - startTime) / (framesCount - 1);

    // Create frame objects
    const frames: VideoFrame[] = [];
    for (let idx = 0; idx < framesCount; idx++) {
      const timestamp = Math.round((startTime + (idx * timeInterval)) * 1000);

      // Create a new frame object (without ID, it will be assigned by Firestore)
      const frame: Omit<VideoFrame, 'frame_id'> = {
        video_id: videoId,
        frame_number: idx + 1,
        timestamp_ms: timestamp,
        frame_path: `https://picsum.photos/800/450?random=${idx + 10}`, // This would be the real image URL in production
        scene_score: Math.random() // In production, this would come from analysis
      };

      // Save the frame to Firestore
      const frameId = await addDocument('video_frames', frame);

      // Add the frame with its new ID to our results
      frames.push({
        ...frame,
        frame_id: frameId
      });

      // Update progress based on saved frames
      onProgress(Math.min(90, Math.floor(30 + (60 * (idx + 1) / framesCount))));
    }

    // Clean up and return the results
    clearInterval(progressInterval);
    onProgress(100);

    // Sort by scene score (descending)
    return [...frames].sort((a, b) =>
      (b.scene_score || 0) - (a.scene_score || 0)
    );
  } catch (error) {
    console.error('Error extracting frames:', error);
    onProgress(0); // Reset progress on error
    return [];
  }
};

export const saveFrame = async (frame: VideoFrame): Promise<boolean> => {
  console.log('Saving frame to Firestore:', frame.frame_id);
  try {
    // Import firestore functions dynamically to avoid circular dependency
    const { addDocument, updateDocument } = await import('../lib/firestore');

    // If the frame has an ID, update it, otherwise add a new document
    if (frame.frame_id && frame.frame_id.indexOf('frame_') !== 0) {
      // It's an existing frame with a real ID (not a temp generated one)
      await updateDocument('video_frames', frame.frame_id, frame);
    } else {
      // It's a new frame or has a temp ID, create a new document
      const newFrameId = await addDocument('video_frames', {
        ...frame,
        // If it's a temp ID, we need to remove it so Firestore can generate a real one
        ...(frame.frame_id && frame.frame_id.indexOf('frame_') === 0 ? { frame_id: undefined } : {})
      });

      // Update the frame with the new ID
      frame.frame_id = newFrameId;
    }

    return true;
  } catch (error) {
    console.error('Error saving frame to Firestore:', error);
    return false;
  }
};

export const deleteFrame = async (frameId: string): Promise<boolean> => {
  console.log(`Deleting frame from Firestore: ${frameId}`);
  try {
    // Import firestore functions dynamically to avoid circular dependency
    const { deleteDocument } = await import('../lib/firestore');

    // Only try to delete from Firestore if it's a real ID (not a temp generated one)
    if (frameId && frameId.indexOf('frame_') !== 0) {
      await deleteDocument('video_frames', frameId);
    } else {
      console.log('Skipping delete for temp frame ID:', frameId);
    }

    return true;
  } catch (error) {
    console.error('Error deleting frame from Firestore:', error);
    return false;
  }
}; 