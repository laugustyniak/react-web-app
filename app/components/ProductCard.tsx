import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ProductCardProps {
  id: number;
  title: string;
  program: string;
  description?: string;
  price: number;
  promoPrice?: number;
  imageUrl?: string;
}

export default function ProductCard({
  id,
  title,
  program,
  description,
  price = 0,
  promoPrice,
  imageUrl,
}: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col w-full">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{program}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-md mb-2">
          {imageUrl && <img src={imageUrl} alt="Logo" className="w-full h-full object-cover" />}
        </div>
        <p className="text-sm">{description}</p>
      </CardContent>
      {!!price && (
        <CardFooter className="mt-auto pt-2">
          <div className="flex justify-between w-full">
            <span className="font-bold">{price}</span>
            <Button>Buy now</Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
