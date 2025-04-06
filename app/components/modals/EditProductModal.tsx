import { useState, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { toast } from 'sonner';
import type { Product } from '~/lib/dataTypes';
import { uploadFile } from '~/lib/fileUploadService';
import { Loader2 } from 'lucide-react';
import { SingleCombobox } from '~/components/ui/combobox';
import { usePrograms } from '~/hooks/usePrograms';

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onEdit: (id: string, data: Partial<Product>) => Promise<void>;
}

export function EditProductModal({ open, onOpenChange, product, onEdit }: EditProductModalProps) {
  const [title, setTitle] = useState<string>(product.title || '');
  const [program, setProgram] = useState<string>(product.program || '');
  const [description, setDescription] = useState<string>(
    product.metadata?.description_in_english || ''
  );
  const [affiliateLink, setAffiliateLink] = useState<string>(product.affiliate_link || '');
  const [imageUrl, setImageUrl] = useState<string>(product.image_url || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { programs, loading: loadingPrograms } = usePrograms();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onEdit(product.id, {
        title,
        program,
        metadata: {
          description_in_english: description,
        },
        affiliate_link: affiliateLink,
        image_url: imageUrl,
      });
      toast.success('Product updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update product');
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
      const result = await uploadFile(file, 'products');
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

  const programOptions = programs.map(program => ({
    value: program.id,
    label: program.title || program.id,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
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
            <Label htmlFor="affiliateLink">Affiliate Link</Label>
            <Input
              id="affiliateLink"
              value={affiliateLink}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAffiliateLink(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <SingleCombobox
              options={programOptions}
              value={program}
              onChange={setProgram}
              placeholder={loadingPrograms ? 'Loading programs...' : 'Select or enter a program...'}
              disabled={loadingPrograms}
            />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex flex-col gap-2 items-center">
              {imageUrl && (
                <div className="w-full flex justify-center mb-2">
                  <img src={imageUrl} alt="Product" className="h-24 w-auto object-contain" />
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
