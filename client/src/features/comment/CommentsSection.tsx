import { useState, useEffect } from 'react';
import Comments from './Comments'
import type { Comment, CommentsSectionProps } from './type';
import { getCommentsByPost } from './../../api/commentApi'
import Button from '../../ui/Button';

const CommentsSection = ({ postId, isVisible, onCommentCountChange, refreshTrigger }: CommentsSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        has_next: false,
        has_prev: false,
        total_count: 0
    });

    useEffect(() => {
        if (isVisible) {
            fetchComments();
        }
    }, [isVisible, postId, refreshTrigger]);

    const fetchComments = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await getCommentsByPost(postId, page, 10);

            if (page === 1) {
                setComments(response.data);
            } else {
                setComments(prev => [...prev, ...response.data]);
            }

            setPagination(response.pagination);

            if (onCommentCountChange) {
                onCommentCountChange(response.pagination.total_count);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentUpdated = (updatedComment: Comment) => {
        setComments(prev =>
            prev.map(comment =>
                comment.id === updatedComment.id ? updatedComment : comment
            )
        );
    };

    const handleCommentDeleted = (commentId: number) => {
        setComments(prev => prev.filter(comment => comment.id !== commentId));

        const newTotalCount = Math.max(0, pagination.total_count - 1);
        setPagination(prev => ({
            ...prev,
            total_count: newTotalCount
        }));

        if (onCommentCountChange) {
            onCommentCountChange(newTotalCount);
        }
    };

    const loadMoreComments = () => {
        if (pagination.has_next && !loading) {
            fetchComments(pagination.current_page + 1);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="space-y-1">
                {loading && comments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</div>
                ) : (
                    <>
                        {comments.map((comment) => (
                            <Comments
                                key={comment.id}
                                comment={comment}
                                onCommentUpdated={handleCommentUpdated}
                                onCommentDeleted={handleCommentDeleted}
                            />
                        ))}

                        {pagination.has_next && (
                            <div className="text-center pt-4">
                                <Button
                                    text={loading ? 'Loading...' : 'Load more comments'}
                                    onClick={loadMoreComments}
                                    variant="blue"
                                    className="text-sm w-auto px-4 py-2"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentsSection;