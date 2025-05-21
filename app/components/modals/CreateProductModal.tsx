import { useState, useRef, useEffect } from 'react';
import { generateAffiliateLink } from '~/lib/affiliateLink';
import type { FormEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { insertProduct } from '~/lib/firestoreService';
import { toast } from 'sonner';
import { uploadFile } from '~/lib/fileUploadService';
import { Loader2 } from 'lucide-react';
import { SingleCombobox } from '~/components/ui/combobox';
import { usePrograms } from '~/hooks/usePrograms';

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialTitle?: string;
  initialImageUrl?: string;
  initialAffiliateLink?: string;
  initialDescription?: string;
}

export function CreateProductModal({ open, onOpenChange, onSuccess, initialTitle = '', initialImageUrl = '', initialAffiliateLink = '', initialDescription = '' }: CreateProductModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [program, setProgram] = useState('');
  const [description, setDescription] = useState(initialDescription);
  const [affiliateLink, setAffiliateLink] = useState(initialAffiliateLink);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { programs, loading: loadingPrograms } = usePrograms();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setProgram('');
      setDescription(initialDescription);
      setAffiliateLink(initialAffiliateLink);
      setImageUrl(initialImageUrl);
    }
  }, [open, initialTitle, initialImageUrl, initialAffiliateLink, initialDescription]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Always generate affiliate link with UTM
      const affiliateLinkWithUtm = affiliateLink ? generateAffiliateLink(affiliateLink) : '';
      await insertProduct({
        title,
        program,
        metadata: {
          description_in_english: description,
        },
        affiliate_link: affiliateLinkWithUtm || affiliateLink,
        image_url: imageUrl,
      });
      toast.success('Product created successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create product');
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
          <DialogTitle>Create Product</DialogTitle>
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
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
