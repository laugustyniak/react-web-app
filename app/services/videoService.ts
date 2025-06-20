import type { VideoData, VideoFrame } from '~/types/models';

// Format time in mm:ss
export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// API functions
export const loadVideo = async (url: string): Promise<VideoData> => {
  console.log('Loading video with URL:', url);
  
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

  try {
    // First, try to load existing video data from Firestore
    console.log('Checking Firestore for existing video with ID:', videoId);
    const { getVideoById } = await import('../lib/firestoreService');
    const existingVideo = await getVideoById(videoId);
    
    if (existingVideo) {
      console.log('Found existing video in Firestore:', {
        video_id: existingVideo.video_id,
        has_storage_url: !!existingVideo.storage_url,
        storage_url: existingVideo.storage_url?.substring(0, 50) + '...'
      });
      
      // Return the existing video data with storage_url if available
      return {
        ...existingVideo,
        video_url: url, // Update with current URL in case it changed
        duration_s: existingVideo.duration_s || 0
      };
    }
  } catch (error) {
    console.error('Error loading video from Firestore:', error);
  }

  // Fallback: create new video data if not found in Firestore
  console.log('Video not found in Firestore, creating new video data');
  const videoData: VideoData = {
    video_id: videoId,
    video_url: url,
    duration_s: 0 // Will be updated on player ready
  };
  console.log('Returning new video data:', videoData);
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
      console.log('Frames sorted by updated_at, then created_at (newest first):', frames.map(f => ({
        id: f.frame_id,
        updated_at: f.updated_at,
        created_at: f.created_at,
        timestamp_ms: f.timestamp_ms
      })));
    } else {
      console.log('No frames found in database');
    }

    // Sort frames by updated_at descending, then created_at descending (newest first) as fallback
    const sortedFrames = frames.sort((a, b) => {
      // Primary sort: updated_at (descending)
      const aUpdated = typeof a.updated_at === 'object' && 'toMillis' in a.updated_at ? 
                       a.updated_at.toMillis() : 0;
      const bUpdated = typeof b.updated_at === 'object' && 'toMillis' in b.updated_at ? 
                       b.updated_at.toMillis() : 0;
      
      const updatedDiff = bUpdated - aUpdated;
      if (updatedDiff !== 0) return updatedDiff;
      
      // Secondary sort: created_at (descending) when updated_at is equal
      const aCreated = typeof a.created_at === 'object' && 'toMillis' in a.created_at ? 
                       a.created_at.toMillis() : 0;
      const bCreated = typeof b.created_at === 'object' && 'toMillis' in b.created_at ? 
                       b.created_at.toMillis() : 0;
      
      return bCreated - aCreated; // Descending order (newest first)
    });

    // Return sorted frames from Firestore (will be empty array if none found)
    return sortedFrames;
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
    const { serverTimestamp } = await import('firebase/firestore');

    // Generate frames based on the time range
    const [startTime, endTime] = timeRange;
    const framesCount = 8;
    const timeInterval = (endTime - startTime) / (framesCount - 1);

    const now = serverTimestamp();

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
        storage_url: `https://picsum.photos/800/450?random=${idx + 10}`, // This would be the real storage URL in production
        scene_score: Math.random(), // In production, this would come from analysis
        created_at: now,
        updated_at: now
      };

      // Save the frame to Firestore
      const frameId = await addDocument('frames', frame);

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
    const { serverTimestamp } = await import('firebase/firestore');

    // Check if this is a temporary ID that needs to create a new document
    const isTempId = !frame.frame_id || 
                     frame.frame_id.startsWith('frame_') || 
                     frame.frame_id.startsWith('manual_');

    const now = serverTimestamp();

    if (isTempId) {
      // It's a new frame or has a temp ID, create a new document
      console.log('Creating new frame document for temp ID:', frame.frame_id);
      
      // Create a copy without the frame_id field and add timestamps
      const { frame_id, ...frameWithoutId } = frame;
      const frameData = {
        ...frameWithoutId,
        created_at: now,
        updated_at: now
      };
      
      const newFrameId = await addDocument('frames', frameData);

      // Update the frame with the new ID and timestamps
      frame.frame_id = newFrameId;
      frame.created_at = now as any; // Cast to avoid type issues
      frame.updated_at = now as any;
      console.log('Frame created with new Firestore ID:', newFrameId);
    } else {
      // It's an existing frame with a real Firestore ID, update it
      console.log('Updating existing frame document:', frame.frame_id);
      const frameData = {
        ...frame,
        updated_at: now
      };
      await updateDocument('frames', frame.frame_id, frameData);
      frame.updated_at = now as any;
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

    // Check if this is a temporary ID that shouldn't be deleted from Firestore
    const isTempId = !frameId || 
                     frameId.startsWith('frame_') || 
                     frameId.startsWith('manual_');

    if (!isTempId) {
      // It's a real Firestore document ID, delete it
      console.log('Deleting frame document from Firestore:', frameId);
      await deleteDocument('frames', frameId);
    } else {
      console.log('Skipping delete for temp frame ID:', frameId);
    }

    return true;
  } catch (error) {
    console.error('Error deleting frame from Firestore:', error);
    return false;
  }
};
