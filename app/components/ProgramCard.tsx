import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { useCallback } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface ProgramCardProps {
  programId: string;
  title: string;
  description: string;
  logoText?: string;
  logoUrl?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ProgramCard({
  programId,
  title,
  description,
  logoUrl,
  onEdit,
  onDelete,
}: ProgramCardProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleNavigate = () => {
    navigate(`/programs/${programId}`);
  };

  const handleEdit = useCallback(() => {
    onEdit?.(programId);
  }, [onEdit, programId]);

  const handleDelete = useCallback(() => {
    onDelete?.(programId);
  }, [onDelete, programId]);

  return (
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
  );
}
