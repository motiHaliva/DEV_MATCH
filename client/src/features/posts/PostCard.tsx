import { useState } from "react";
import { FaComment } from "react-icons/fa";
import { Link } from "react-router-dom";
import type { PostCardProps } from "./type";
import CommentsSection from "../comment/CommentsSection";
import FormComments from "../comment/FormComments";
import { createComment } from "../../api/commentApi";
import Button from "../../ui/Button";
import LikeButton from "../like/LikeButton";
import { getUserInitials } from "../../utils/userInitials";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";

const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [commentsCount, setCommentsCount] = useState(
    Number(post.comments_count) || 0
  );
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { currentUser } = useAuth();

  const handleCommentsToggle = () => {
    setShowComments((prev) => !prev);
  };

  const handleCommentCountChange = (newCount: number) => {
    if (typeof newCount === 'number' && !isNaN(newCount)) {
      setCommentsCount(newCount);
    }
  };

  const handleQuickComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await createComment({
        post_id: post.id,
        content: newComment.trim()
      });

      const newCount = commentsCount + 1;
      setCommentsCount(newCount);
      setNewComment('');

      if (showComments) {
        setRefreshTrigger(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 bg-white rounded-xl shadow-md hover:shadow-sm transition-shadow duration-300 max-w-md lg:max-w-[800px] mx-auto overflow-hidden border border-gray-100">
      <div className="lg:w-2/3 p-6 flex flex-col justify-between relative">
        {/* User Info Header */}
        <div className="flex items-center gap-5 mb-2">
          <Link
            to={
              post.post_type === "freelancer"
                ? `/freelancerProfile/${post.user_id}`
                : `/clientProfile/${post.user_id}`
            }
            className="flex-shrink-0 relative"
          >
            <div className="absolute -top-9 left-1">
              {post.user_avatar ? (
                <img
                  src={post.user_avatar}
                  alt="User avatar"
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg hover:scale-105 transition-transform duration-200 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-gradient-to-r from-brand-blueLight to-brand-blue flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition-transform duration-200">
                  {getUserInitials(post.user_firstname, post.user_lastname)}
                </div>
              )}
            </div>
          </Link>
          <div className="flex flex-col ml-14">
            <h2 className="text-xl font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors duration-200">
              {post.user_firstname} {post.user_lastname}
            </h2>
            <span className="text-sm text-blue-600 font-medium">{post.post_type}</span>
            <span className="text-xs text-gray-400 mt-1">
              {post.created_at?.slice(0, 10)}
            </span>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-6">
          <p className={`text-gray-700 text-sm leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
            {post.content}
          </p>
          {post.content && post.content.length > 80 && (
            <Button
              text={expanded ? "הצג פחות ▲" : "הצג עוד ▼"}
              variant="text"
              onClick={() => setExpanded(!expanded)}
              className="mt-2"
            />
          )}

          {post.image_url && (
            <img
              src={post.image_url}
              alt="post image"
              className="mt-4 w-full h-56 object-cover rounded-lg lg:hidden shadow-md"
            />
          )}
        </div>
        
        <div>
          <div className="flex justify-between items-center text-gray-600 mb-4 text-sm">
            <div className="flex items-center gap-6">

              <LikeButton 
                postId={post.id} 
                initialLikesCount={post.likes_count}
              />
              
              <span className="flex items-center gap-1">
                <FaComment className="text-blue-500" />
                <span>{commentsCount}</span>
              </span>
            </div>
            <Button
              text={showComments ? "הסתר תגובות" : `הצג ${commentsCount} תגובות`}
              variant="text"
              onClick={handleCommentsToggle}
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <FormComments
              currentUser={currentUser}
              newComment={newComment}
              setNewComment={setNewComment}
              submitting={submitting}
              onSubmit={handleQuickComment}
            />
          </div>
          <CommentsSection
            postId={post.id}
            isVisible={showComments}
            onCommentCountChange={handleCommentCountChange}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  );
};

export default PostCard;