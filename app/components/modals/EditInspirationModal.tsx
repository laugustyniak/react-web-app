import { useState, useRef, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { toast } from 'sonner';
import type { Inspiration } from '~/lib/dataTypes';
import { uploadFile } from '~/lib/fileUploadService';
import { Loader2 } from 'lucide-react';
import { MultiCombobox, SingleCombobox } from '~/components/ui/combobox';
import { useProducts } from '~/hooks/useProducts';
import { usePrograms } from '~/hooks/usePrograms';
import { getProgramById } from '~/lib/firestoreService';

interface EditInspirationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspiration: Inspiration;
  onEdit: (id: string, data: Partial<Inspiration>) => Promise<void>;
}

export function EditInspirationModal({
  open,
  onOpenChange,
  inspiration,
  onEdit,
}: EditInspirationModalProps) {
  const [title, setTitle] = useState(inspiration.title);
  const [description, setDescription] = useState(inspiration.description || '');
  const [imageUrl, setImageUrl] = useState(inspiration.imageUrl);
  const [logoUrl, setLogoUrl] = useState(inspiration.logoUrl || '');
  const [programTitle, setProgramTitle] = useState(inspiration.programTitle || '');
  const [selectedProgram, setSelectedProgram] = useState(inspiration.program || '');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(inspiration.products || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { programs, loading: loadingPrograms } = usePrograms();
  const { products, loading } = useProducts();

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
      await onEdit(inspiration.id, {
        title,
        description,
        imageUrl,
        logoUrl,
        programTitle,
        program: selectedProgram,
        products: selectedProducts,
      });
      toast.success('Inspiration updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update inspiration');
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
          <DialogTitle>Edit Inspiration</DialogTitle>
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
            <textarea
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
                disabled={isUploading}
                className="w-full cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Image'
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full cursor-pointer">
            Update
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
