import { useState, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { toast } from 'sonner';
import type { Program } from '~/lib/dataTypes';
import { uploadFile } from '~/lib/fileUploadService';
import { Loader2 } from 'lucide-react';

interface EditProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: Program;
  onEdit: (id: string, data: Partial<Program>) => Promise<void>;
}

export function EditProgramModal({ open, onOpenChange, program, onEdit }: EditProgramModalProps) {
  const [title, setTitle] = useState<string>(program.title || '');
  const [description, setDescription] = useState<string>(program.description || '');
  const [logoUrl, setLogoUrl] = useState<string>(program.logo_url || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await uploadFile(file);
      if (result.success) {
        setLogoUrl(result.data.file.urls.original);
        toast.success('Logo uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onEdit(program.id, {
        title,
        description,
        logo_url: logoUrl,
      });
      toast.success('Program updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update program');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
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
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex flex-col gap-2 items-center">
              {logoUrl && (
                <div className="w-full flex justify-center mb-2">
                  <img src={logoUrl} alt="Logo" className="h-24 w-auto object-contain" />
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
                  'Upload Logo'
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
