import { useState, useRef, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { insertInspiration, getProgramById } from '~/lib/firestoreService';
import { toast } from 'sonner';
import { uploadFile, uploadBase64Image } from '~/lib/fileUploadService';
import { Loader2 } from 'lucide-react';
import { MultiCombobox, SingleCombobox } from '~/components/ui/combobox';
import { useProducts } from '~/hooks/useProducts';
import { usePrograms } from '~/hooks/usePrograms';

interface CreateInspirationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialImageUrl?: string | null;
}

export function CreateInspirationModal({
  open,
  onOpenChange,
  onSuccess,
  initialImageUrl
}: CreateInspirationModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [programTitle, setProgramTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { programs, loading: loadingPrograms } = usePrograms();
  const { products, loading } = useProducts();

  // Reset form when modal opens and set the initial image URL if provided
  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setLogoUrl('');
      setProgramTitle('');
      setImageUrl(initialImageUrl || '');
      setSelectedProgram('');
      setSelectedProducts([]);
    }
  }, [open, initialImageUrl]);

  // Fetch program logo when program is selected
  useEffect(() => {
    async function fetchProgramLogo() {
      if (selectedProgram) {
        try {
          const program = await getProgramById(selectedProgram);
          if (program) {
            if (program.logo_url) {
              setLogoUrl(program.logo_url);
            }
            if (program.title) {
              setProgramTitle(program.title);
            }
          }
        } catch (error) {
          console.error('Error fetching program logo:', error);
        }
      }
    }

    fetchProgramLogo();
  }, [selectedProgram]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      let finalImageUrl = imageUrl;
      
      // If we're using a base64 image (from generated inspirations), upload it first
      if (imageUrl && imageUrl.startsWith('data:image')) {
        setIsUploading(true);
        const uploadResult = await uploadBase64Image(imageUrl);
        if (uploadResult.success) {
          finalImageUrl = uploadResult.data.file.urls.original;
        }
        setIsUploading(false);
      }
      
      await insertInspiration({
        title,
        description,
        imageUrl: finalImageUrl,
        logoUrl,
        program: selectedProgram,
        programTitle,
        products: selectedProducts,
        stars: 0,
        starredBy: [],
        commentIds: [],
        commentCount: 0,
        date: new Date().toISOString(),
      });
      
      toast.success('Inspiration created successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating inspiration:', error);
      toast.error('Failed to create inspiration');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await uploadFile(file, 'inspirations');
      if (result.success) {
        setImageUrl(result.data.file.urls.original);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const productOptions = products.map(product => ({
    value: product.id,
    label: product.title || product.id,
  }));

  const programOptions = programs.map(program => ({
    value: program.id,
    label: program.title || program.id,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Inspiration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <SingleCombobox
              options={programOptions}
              value={selectedProgram}
              onChange={setSelectedProgram}
              placeholder={loadingPrograms ? 'Loading programs...' : 'Select or enter a program...'}
              disabled={loadingPrograms}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="products">Products</Label>
            <MultiCombobox
              options={productOptions}
              value={selectedProducts}
              onChange={setSelectedProducts}
              placeholder={loading ? 'Loading products...' : 'Select or enter product IDs...'}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex flex-col gap-2 items-center">
              {imageUrl && (
                <div className="w-full flex justify-center mb-2">
                  <img src={imageUrl} alt="Inspiration" className="h-24 w-auto object-contain" />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadClick}
                disabled={isUploading || (!!initialImageUrl && !!imageUrl)}
                className="w-full cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : imageUrl ? (
                  'Change Image'
                ) : (
                  'Upload Image'
                )}
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full cursor-pointer"
            disabled={isUploading}
          >
            {isUploading ? 'Processing...' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
