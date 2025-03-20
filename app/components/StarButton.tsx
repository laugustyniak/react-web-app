import { useState, useCallback, memo, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '~/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { cn } from '~/lib/utils';
import { trackEvent } from '~/lib/analytics';
import { useAnalytics } from '~/contexts/AnalyticsContext';

interface StarButtonProps {
  inspirationId: string;
  starredBy: string[];
  starsCount: number;
  onStarUpdate?: (newStarsCount: number) => void;
}

function StarButton({ inspirationId, starredBy, starsCount, onStarUpdate }: StarButtonProps) {
  const { user } = useAuth();
  const analytics = useAnalytics();
  const userId = user?.uid;
  const [localStarredBy, setLocalStarredBy] = useState<string[]>(starredBy || []);
  const [localStarsCount, setLocalStarsCount] = useState<number>(starsCount);
  const [isLoading, setIsLoading] = useState(false);

  const isStarred = userId ? localStarredBy.includes(userId) : false;

  useEffect(() => {
    setLocalStarredBy(starredBy || []);
    setLocalStarsCount(starsCount);
  }, [starredBy, starsCount]);

  const toggleStar = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user || !userId || isLoading) return;

      try {
        setIsLoading(true);
        const inspirationRef = doc(db, 'inspirations', inspirationId);

        if (isStarred) {
          // Remove star
          await updateDoc(inspirationRef, {
            starredBy: arrayRemove(userId),
            stars: localStarsCount - 1,
          });
          setLocalStarredBy(prev => prev.filter(id => id !== userId));
          setLocalStarsCount(prev => prev - 1);
          if (onStarUpdate) onStarUpdate(localStarsCount - 1);
          if (analytics) {
            trackEvent(analytics, 'unstar_inspiration', {
              inspiration_id: inspirationId,
            });
          }
        } else {
          // Add star
          await updateDoc(inspirationRef, {
            starredBy: arrayUnion(userId),
            stars: localStarsCount + 1,
          });
          setLocalStarredBy(prev => [...prev, userId]);
          setLocalStarsCount(prev => prev + 1);
          if (onStarUpdate) onStarUpdate(localStarsCount + 1);
          if (analytics) {
            trackEvent(analytics, 'star_inspiration', {
              inspiration_id: inspirationId,
            });
          }
        }
      } catch (error) {
        console.error('Error toggling star:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [inspirationId, isStarred, localStarsCount, user, userId, isLoading, onStarUpdate, analytics]
  );

  return (
    <Button
      onClick={toggleStar}
      variant="ghost"
      size="lg"
      className={cn(
        'flex gap-1 items-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors',
        isStarred && 'text-[#e45f56] hover:text-[#e45f56]',
        isLoading && 'opacity-70 cursor-not-allowed'
      )}
      disabled={isLoading || !user}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={cn('w-10 h-10 sm:w-12 sm:h-12', isStarred ? 'fill-[#e45f56]' : 'fill-none')}
        stroke="currentColor"
        strokeWidth={isStarred ? 0 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
      <span>{localStarsCount}</span>
    </Button>
  );
}

export default memo(StarButton);
