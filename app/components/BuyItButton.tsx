import { useAnalytics } from '~/contexts/AnalyticsContext';
import { trackEvent } from '../lib/analytics';
import { Button } from './ui/button';

interface BuyItButtonProps {
  affiliateLink: string;
  productId: string;
  productTitle: string;
}

export default function BuyItButton({ affiliateLink, productTitle, productId }: BuyItButtonProps) {
  const analytics = useAnalytics();

  const handleClick = () => {
    if (analytics) {
      trackEvent(analytics, 'buy_it', {
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
