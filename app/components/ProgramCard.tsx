import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

interface ProgramCardProps {
  programId: string;
  title: string;
  description: string;
  logoText?: string;
  logoUrl?: string;
}

export default function ProgramCard({
  programId,
  title,
  description,
  logoText,
  logoUrl,
}: ProgramCardProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/programs/${programId}`);
  };

  return (
    <Card className="h-full flex flex-col w-full">
      <CardHeader className="flex-1">
        <div className="flex justify-center">
          <div className="h-48 w-48 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-8 mt-4 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-xl font-semibold">
                {logoText || `Logo ${programId}`}
              </span>
            )}
          </div>
        </div>
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      {/* <CardContent className="pb-2">
        <p className="text-sm text-gray-500 text-center">
          This program offers unique content and features for our users.
        </p>
      </CardContent> */}
      <CardFooter className="mt-auto pt-2">
        <Button variant="outline" className="w-full" onClick={handleNavigate}>
          Discover
        </Button>
      </CardFooter>
    </Card>
  );
}
