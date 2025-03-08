import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ProductCardProps {
  id: number;
  title: string;
  program: string;
  description: string;
  price: string;
  imageUrl?: string;
}

export default function ProductCard({
  id,
  title,
  program,
  description,
  price,
  imageUrl = 'https://placehold.co/30x30?text=P',
}: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col w-full">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3">
          <img src={imageUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{program}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-md mb-2"></div>
        <p className="text-sm">{description}</p>
      </CardContent>
      <CardFooter className="mt-auto pt-2">
        <div className="flex justify-between w-full">
          <span className="font-bold">{price}</span>
          <Button>Buy now</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
