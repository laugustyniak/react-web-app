import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Download, Plus, ImageOff } from 'lucide-react';
import { CreateInspirationModal } from '~/components/modals/CreateInspirationModal';
import { toast } from 'sonner';

type GeneratedImage = {
  id: string;
  data: string;
  timestamp: Date;
};

interface GeneratedInspirationsProps {
  images: GeneratedImage[];
}

export default function GeneratedInspirations({ images }: GeneratedInspirationsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  // Validate image data format
  const validImages = images.filter(img => {
    // Check if the data is a proper data URL or base64 string
    return img.data && (
      img.data.startsWith('data:image') || 
      img.data.startsWith('http') || 
      img.data.match(/^[A-Za-z0-9+/=]+$/) // Simple base64 check
    );
  });

  if (validImages.length === 0) {
    return (
      <div className="mt-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
        <p className="text-gray-500">No valid generated inspirations available.</p>
      </div>
    );
  }

  const handleDownload = (imageData: string, id: string) => {
    const link = document.createElement('a');
    link.download = `insbuy-inspiration-${id}.png`;
    link.href = imageData;
    link.click();
  };

//   const handleOpenModal = (imageData: string) => {
//     setSelectedImageData(imageData);
//     setIsModalOpen(true);
//   };

  const handleImageError = (id: string) => {
    console.error(`Failed to load image with ID: ${id}`);
    setImageLoadErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="mt-8 w-full">
      <h2 className="text-xl font-semibold mb-4">Generated Inspirations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {validImages.map((image) => (
          <div 
            key={image.id}
            className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md"
          >
            {imageLoadErrors[image.id] ? (
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <ImageOff className="h-12 w-12 text-gray-400" />
              </div>
            ) : (
              <img 
                src={image.data} 
                alt={`Generated Inspiration ${image.id}`}
                className="w-full object-contain"
                onError={() => handleImageError(image.id)}
                onLoad={() => console.log(`Image ${image.id} loaded successfully`)}
              />
            )}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {image.timestamp.toLocaleString()}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(image.data, image.id)}
                  className="flex items-center gap-2"
                  disabled={imageLoadErrors[image.id]}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
              {/* <Button
                variant="default"
                size="sm"
                onClick={() => handleOpenModal(image.data)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                disabled={imageLoadErrors[image.id]}
              >
                <Plus className="h-4 w-4" />
                Add to Inspirations
              </Button> */}
            </div>
          </div>
        ))}
      </div>

      {/* CreateInspirationModal with pre-populated image */}
      <CreateInspirationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          toast.success('Inspiration added to database successfully');
        }}
        initialImageUrl={selectedImageData}
      />
    </div>
  );
}
