import { useState, useEffect, useCallback, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import type { Comment } from '~/lib/dataTypes';
import { useAuth } from '~/contexts/AuthContext';
import { arrayUnion, arrayRemove, where, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router';
import {
  getDocument,
  updateDocument,
  getCollection,
  deleteDocument,
  setDocument,
} from '~/lib/firestore';

interface CommentsProps {
  contentId: string;
  contentType: 'inspiration' | 'product' | 'program';
  commentIds: string[];
  commentCount: number;
  showCommentsModal: boolean;
  setShowCommentsModal: (show: boolean) => void;
  onCommentCountChange?: (newCount: number) => void;
}

function Comments({
  contentId,
  contentType,
  commentIds,
  commentCount,
  showCommentsModal,
  setShowCommentsModal,
  onCommentCountChange,
}: CommentsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);
  const [firstComment, setFirstComment] = useState<Comment | null>(null);

  const loadComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      // Query comments collection for comments related to this content
      const { documents } = await getCollection<Comment>('comments', {
        queryConstraints: [
          where('contentId', '==', contentId),
          where('contentType', '==', contentType),
          orderBy('date', 'desc'),
        ],
      });

      setComments(documents);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [contentId, contentType]);

  const loadFirstComment = useCallback(async () => {
    if (!commentIds || commentIds.length === 0) return;

    try {
      const firstCommentId = commentIds[0];
      const comment = await getDocument<Comment>('comments', firstCommentId);
      if (comment) {
        setFirstComment(comment);
      }
    } catch (error) {
      console.error('Error loading first comment:', error);
    }
  }, [commentIds]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      try {
        navigate('/sign-in');
      } catch (error) {
        console.error('Failed to redirect to sign in');
      }
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      // Get the current content to update its comments
      const currentContent = await getDocument(contentType + 's', contentId);
      if (!currentContent) {
        console.error('Content not found');
        return;
      }

      // Generate a unique ID for the comment (using a timestamp + random string)
      const commentId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

      // Create a new comment object with the generated ID
      const newCommentObj: Comment = {
        id: commentId,
        author: user.displayName || 'Anonymous',
        authorId: user.uid,
        text: newComment.trim(),
        date: new Date().toISOString(),
        contentId: contentId,
        contentType: contentType,
      };

      // Add the comment to the comments collection using setDocument with the generated ID
      await setDocument('comments', commentId, newCommentObj);

      // Ensure commentIds and commentCount are initialized in the currentContent
      const newCommentCount = (currentContent.commentCount || 0) + 1;

      if (!currentContent.commentIds) {
        await updateDocument(contentType + 's', contentId, {
          commentIds: [commentId],
          commentCount: 1,
        });
      } else {
        // Update the content document with the new comment ID
        await updateDocument(contentType + 's', contentId, {
          commentIds: arrayUnion(commentId),
          commentCount: newCommentCount,
        });
      }

      // Update the parent component with the new comment count
      if (onCommentCountChange) {
        onCommentCountChange(newCommentCount);
      }

      // Clear the input
      setNewComment('');

      // Reload comments from the database to ensure we have the latest data
      await loadComments();

      // If this was the first comment, update firstComment
      if (!firstComment) {
        setFirstComment(newCommentObj);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      // Get the current content to update its comments
      const currentContent = await getDocument(contentType + 's', contentId);
      if (!currentContent) {
        console.error('Content not found');
        return;
      }

      // Get the comment to verify it belongs to this content
      const comment = await getDocument<Comment>('comments', commentId);
      if (!comment || comment.contentId !== contentId) {
        console.error('Comment not found or does not belong to this content');
        return;
      }

      // Delete the comment from the comments collection
      await deleteDocument('comments', commentId);

      // Update the content document to remove the comment ID
      const newCommentCount = Math.max((currentContent.commentCount || 0) - 1, 0);
      await updateDocument(contentType + 's', contentId, {
        commentIds: arrayRemove(commentId),
        commentCount: newCommentCount,
      });

      // Update the parent component with the new comment count
      if (onCommentCountChange) {
        onCommentCountChange(newCommentCount);
      }

      // Reload comments from the database to ensure we have the latest data
      await loadComments();

      // If the deleted comment was the first comment, update firstComment
      if (firstComment && firstComment.id === commentId) {
        // If there are no more comments, set firstComment to null
        if (comments.length <= 1) {
          setFirstComment(null);
        } else {
          // Otherwise, find the new first comment from the updated comments list
          const newFirstComment = comments.find(c => c.id !== commentId) || null;
          setFirstComment(newFirstComment);
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = useCallback((dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  // Load comments when modal is opened
  useEffect(() => {
    if (showCommentsModal) {
      loadComments();
    }
  }, [showCommentsModal, loadComments]);

  // Load first comment on initial render or when commentIds change
  useEffect(() => {
    if (!firstComment && commentIds && commentIds.length > 0) {
      loadFirstComment();
    }
  }, [commentIds, firstComment, loadFirstComment]);

  return (
    <>
      {/* Display first comment */}
      {firstComment && (
        <div className="px-6 mt-[-0.8rem] mb-4">
          <div className="text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="font-medium">{firstComment.author}</span>
                <span className="text-xs text-gray-500">• {formatDate(firstComment.date)}</span>
              </div>
              {user && firstComment.authorId === user.uid && (
                <button
                  onClick={() => handleDeleteComment(firstComment.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                  aria-label="Delete comment"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-gray-700">{firstComment.text}</p>
            {commentCount > 1 && (
              <button
                onClick={() => setShowCommentsModal(true)}
                className="text-sm text-[#6639e1] cursor-pointer mt-1 hover:underline"
              >
                View all {commentCount} comments
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comments Modal */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {isLoadingComments ? (
              <div className="text-center py-4">Loading comments...</div>
            ) : (
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div
                      key={comment.id}
                      className={`text-sm ${index < comments.length - 1 ? 'border-b pb-3' : 'pb-3'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            • {formatDate(comment.date)}
                          </span>
                        </div>
                        {user && comment.authorId === user.uid && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                            aria-label="Delete comment"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">No comments yet</div>
                )}
              </div>
            )}
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

// Memoize the component to prevent unnecessary re-renders
export default memo(Comments);
