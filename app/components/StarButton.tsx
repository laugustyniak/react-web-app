import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { getDocument, setDocument, batchWrite } from '~/lib/firestore';
import { arrayUnion, arrayRemove } from 'firebase/firestore';

interface StarButtonProps {
  contentId: string;
  starredBy: string[];
  starsCount: number;
  onStarUpdate?: (newStarsCount: number) => void;
}

export default function StarButton({
  contentId,
  starredBy,
  starsCount: initialStarsCount,
  onStarUpdate,
}: StarButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
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
            documentId: contentId,
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
              starredInspirations: arrayRemove(contentId),
            },
          },
        ]);

        setStarsCount(starsCount - 1);
        if (onStarUpdate) onStarUpdate(starsCount - 1);
      } else {
        // Use batchWrite for atomic operations
        await batchWrite([
          {
            type: 'update',
            collectionName: 'inspirations',
            documentId: contentId,
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
              starredInspirations: arrayUnion(contentId),
            },
          },
        ]);

        setStarsCount(starsCount + 1);
        if (onStarUpdate) onStarUpdate(starsCount + 1);
      }

      setStarred(!starred);
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  return (
    <button
      onClick={toggleStar}
      className={`flex items-center gap-1 cursor-pointer text-sm ${starred ? 'text-yellow-500' : 'text-gray-500'}`}
    >
      <Star className="w-5 h-5" fill={starred ? 'currentColor' : 'none'} />
      <span>{starsCount}</span>
    </button>
  );
}
