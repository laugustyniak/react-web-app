import React, { useState } from 'react';
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { LoadingSpinner } from "~/components/ui/loading";

interface VideoInputProps {
  onVideoLoad: (url: string) => Promise<void>;
  onAddToProcessing?: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const VideoInput: React.FC<VideoInputProps> = ({ onVideoLoad, onAddToProcessing, isLoading, error }) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  // Example video URLs
  const exampleVideos = [
    'https://www.youtube.com/watch?v=J6ivwIndleQ',
    'https://www.youtube.com/watch?v=XtC0IsVsmeI',
    'https://www.youtube.com/watch?v=znm0D7xRLPA',
    'https://www.youtube.com/watch?v=ESVeF5Jc9ks',
    'https://www.youtube.com/watch?v=rzyicwrySSs',
    'https://www.youtube.com/watch?v=o0Ssqd_9KI0',
    'https://www.youtube.com/watch?v=H5Q0xSZzPWo'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create a URL for the local file
      const fileUrl = URL.createObjectURL(selectedFile);
      setVideoUrl(fileUrl);
    }
  };

  const handleLoadVideo = async () => {
    if (videoUrl) {
      await onVideoLoad(videoUrl);
      // Don't clear the URL as it's useful to see what was loaded
    }
  };

  const handleAddToProcessing = async () => {
    if (videoUrl && onAddToProcessing) {
      await onAddToProcessing(videoUrl);
      // Clear the URL after adding to processing
      setVideoUrl('');
      setFile(null);
    }
  };

  return (
    <div className="mb-4">
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

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Upload Video File:</h2>
        <Input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="mb-2"
        />
        {file && (
          <p className="text-sm">Selected file: {file.name} ({Math.round(file.size / 1024 / 1024 * 10) / 10} MB)</p>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Or Enter YouTube URL:</h2>
        <div className="flex flex-col gap-3">
          <Input
            className="w-full"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="default"
              onClick={handleLoadVideo}
              disabled={!videoUrl || isLoading}
              className="flex-1 min-w-[120px]"
            >
              {isLoading ? <LoadingSpinner /> : 'Load Video for Extraction'}
            </Button>
            {onAddToProcessing && (
              <Button
                variant="outline"
                onClick={handleAddToProcessing}
                disabled={!videoUrl || isLoading}
                className="flex-1 min-w-[120px]"
              >
                {isLoading ? <LoadingSpinner /> : 'Add Video to Processing'}
              </Button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            <p><strong>Load Video for Extraction:</strong> Immediately load and extract frames from this video</p>
            {onAddToProcessing && (
              <p><strong>Add Video to Processing:</strong> Queue this video for later processing</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VideoInput;
