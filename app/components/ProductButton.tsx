import { useAnalytics } from '~/contexts/AnalyticsContext';
import { trackEvent } from '../lib/analytics';
import { Button } from './ui/button';

interface ProductButtonProps {
  affiliateLink: string;
  productId: string;
  productTitle: string;
}

export default function ProductButton({ affiliateLink, productTitle, productId }: ProductButtonProps) {
  const analytics = useAnalytics();

  const handleClick = () => {
    if (analytics) {
      trackEvent(analytics, 'product_click', {
        product_id: productId,
        product_title: productTitle,
        affiliate_link: affiliateLink,
      });
    }
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button onClick={handleClick} className="w-full cursor-pointer">
      Check Price
    </Button>
  );
}
