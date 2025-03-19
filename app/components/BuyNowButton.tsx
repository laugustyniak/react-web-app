import { Button } from './ui/button';
import { trackEvent } from '../lib/analytics';
import { useAnalytics } from '~/contexts/AnalyticsContext';

interface BuyNowButtonProps {
  affiliateLink: string;
  productId: string;
  productTitle: string;
}

export default function BuyNowButton({
  affiliateLink,
  productTitle,
  productId,
}: BuyNowButtonProps) {
  const analytics = useAnalytics();

  const handleClick = () => {
    if (analytics) {
      trackEvent(analytics, 'buy_now', {
        product_id: productId,
        product_title: productTitle,
        affiliate_link: affiliateLink,
      });
    }
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button onClick={handleClick} className="w-full cursor-pointer">
      Buy now
    </Button>
  );
}
