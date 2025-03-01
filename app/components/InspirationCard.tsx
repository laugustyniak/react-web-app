import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import type { Inspiration } from '~/lib/dataTypes';

interface InspirationCardProps {
  inspiration: Inspiration;
}

export default function InspirationCard({ inspiration }: InspirationCardProps) {
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(inspiration.likes);
  const [newComment, setNewComment] = useState('');

  const toggleCommentsModal = () => {
    setShowCommentsModal(!showCommentsModal);
  };

  const toggleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the comment to your backend
    // For now, we'll just clear the input
    setNewComment('');
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get the first comment if available
  const firstComment = inspiration.comments.items.length > 0 ? inspiration.comments.items[0] : null;

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden w-full">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <img
              src={inspiration.logoUrl}
              alt="Logo"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <CardTitle className="text-lg">{inspiration.title}</CardTitle>
              <p className="text-xs text-gray-500">{formatDate(inspiration.date)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="relative h-80 mb-4 overflow-hidden rounded-md">
            <img
              src={inspiration.imageUrl}
              alt={inspiration.title}
              className="w-full h-full object-cover"
            />
          </div>
          <CardDescription>{inspiration.description}</CardDescription>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4 mt-auto">
          <button
            onClick={toggleCommentsModal}
            className="flex items-center gap-1 text-sm text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
              />
            </svg>
            <span>{inspiration.comments.count}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 cursor-pointer text-sm ${liked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={liked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span>{likesCount}</span>
            </button>
          </div>
        </CardFooter>

        {/* Display first comment directly on the card */}
        {firstComment && (
          <div className="px-6 mt-[-0.8rem] mb-4">
            <div className="text-sm">
              <div className="flex items-center gap-1">
                <span className="font-medium">{firstComment.author}</span>
                <span className="text-xs text-gray-500">• {formatDate(firstComment.date)}</span>
              </div>
              <p className="text-gray-700">{firstComment.text}</p>
              {inspiration.comments.count > 1 && (
                <button
                  onClick={toggleCommentsModal}
                  className="text-sm text-[#6639e1] cursor-pointer mt-1 hover:underline"
                >
                  View all {inspiration.comments.count} comments
                </button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Comments Modal */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              {inspiration.comments.items.map(comment => (
                <div key={comment.id} className="text-sm border-b pb-3">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-xs text-gray-500">• {formatDate(comment.date)}</span>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmitComment} className="mt-4">
            <div className="flex flex-col gap-2">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full min-h-[80px] p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
