import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import BuyNowButton from './BuyNowButton';

interface ProductCardProps {
  productId: string;
  title: string;
  program: string;
  description?: string;
  affiliateLink?: string;
  imageUrl?: string;
}

export default function ProductCard({
  productId,
  title,
  program,
  description,
  affiliateLink,
  imageUrl,
}: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col w-full gap-4">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
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
      {affiliateLink && (
        <CardFooter>
          <div className="flex justify-between w-full">
            <BuyNowButton
              affiliateLink={affiliateLink}
              productTitle={title}
              productId={productId}
            />
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
