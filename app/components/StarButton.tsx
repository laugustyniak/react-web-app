import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { getDocument, setDocument, batchWrite } from '~/lib/firestore';
import { arrayUnion, arrayRemove } from 'firebase/firestore';
import { trackEvent } from '~/lib/analytics';
import { useAnalytics } from '~/contexts/AnalyticsContext';

interface StarButtonProps {
  inspirationId: string;
  starredBy: string[];
  starsCount: number;
  onStarUpdate?: (newStarsCount: number) => void;
}

export default function StarButton({
  inspirationId,
  starredBy,
  starsCount: initialStarsCount,
  onStarUpdate,
}: StarButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const [starred, setStarred] = useState<boolean>(false);
  const [starsCount, setStarsCount] = useState<number>(initialStarsCount || 0);

  useEffect(() => {
    if (!user) return;
    const isStarred = starredBy?.includes(user.uid) || false;
    setStarred(isStarred);
  }, [user, starredBy]);

  useEffect(() => {
    setStarsCount(initialStarsCount || 0);
  }, [initialStarsCount]);

  const toggleStar = async () => {
    if (!user) {
      try {
        navigate('/sign-in');
      } catch (error) {
        console.error('Failed to redirect to sign in');
      }
      return;
    }

    try {
      // Check if user document exists, if not create it
      const userDoc = await getDocument('users', user.uid);
      if (!userDoc) {
        await setDocument('users', user.uid, {
          starredInspirations: [],
        });
      }

      if (starred) {
        // Use batchWrite for atomic operations
        await batchWrite([
          {
            type: 'update',
            collectionName: 'inspirations',
            documentId: inspirationId,
            data: {
              starredBy: arrayRemove(user.uid),
              stars: starsCount - 1,
            },
          },
          {
            type: 'update',
            collectionName: 'users',
            documentId: user.uid,
            data: {
              starredInspirations: arrayRemove(inspirationId),
            },
          },
        ]);

        setStarsCount(starsCount - 1);
        if (onStarUpdate) onStarUpdate(starsCount - 1);
        if (analytics) {
          trackEvent(analytics, 'unstar_inspiration', {
            inspiration_id: inspirationId,
          });
        }
      } else {
        // Use batchWrite for atomic operations
        await batchWrite([
          {
            type: 'update',
            collectionName: 'inspirations',
            documentId: inspirationId,
            data: {
              starredBy: arrayUnion(user.uid),
              stars: starsCount + 1,
            },
          },
          {
            type: 'update',
            collectionName: 'users',
            documentId: user.uid,
            data: {
              starredInspirations: arrayUnion(inspirationId),
            },
          },
        ]);

        setStarsCount(starsCount + 1);
        if (onStarUpdate) onStarUpdate(starsCount + 1);
        if (analytics) {
          trackEvent(analytics, 'star_inspiration', {
            inspiration_id: inspirationId,
          });
        }
      }

      setStarred(!starred);
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  return (
    <button
      onClick={toggleStar}
      className={`flex items-center gap-1 cursor-pointer text-sm ${starred ? 'text-[#e45f56]' : 'text-gray-500'}`}
    >
      <Star className="w-5 h-5" fill={starred ? 'currentColor' : 'none'} />
      <span>{starsCount}</span>
    </button>
  );
}
