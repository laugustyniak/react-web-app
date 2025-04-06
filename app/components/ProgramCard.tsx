import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { useCallback, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { EditProgramModal, DeleteConfirmationModal } from './modals';
import { updateProgram, deleteProgram } from '~/lib/firestoreService';
import type { Program } from '~/lib/dataTypes';

interface ProgramCardProps {
  id: string;
  title: string;
  description: string;
  logoText?: string;
  logoUrl?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ProgramCard({
  id,
  title,
  description,
  logoUrl,
  onEdit,
  onDelete,
}: ProgramCardProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleNavigate = () => {
    navigate(`/programs/${id}`);
  };

  const handleEdit = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (id: string, data: Partial<Program>) => {
      await updateProgram(id, data);
      onEdit?.(id);
    },
    [onEdit]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!id) {
      console.error('Cannot delete program: id is undefined');
      return;
    }
    await deleteProgram(id);
    onDelete?.(id);
  }, [id, onDelete]);

  return (
    <>
      <Card className="h-full flex flex-col w-full">
        <CardHeader className="flex-1">
          <div className="flex justify-center">
            <div className="h-48 w-48 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-8 mt-4 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xl font-semibold">{title}</span>
              )}
            </div>
          </div>
          <CardTitle className="text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto pt-2">
          <Button variant="outline" className="w-full" onClick={handleNavigate}>
            Discover
          </Button>
          {isAdmin && (
            <div className="flex space-x-2 ml-2">
              <Button size="sm" variant="outline" onClick={handleEdit} className="cursor-pointer">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProgramModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          program={{ id, title, description, logo_url: logoUrl }}
          onEdit={handleEditSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          title={title}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}
