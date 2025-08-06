
import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { likePost, unlikePost, hasUserLikedPost } from '../../api/likesApi';
import { toast } from 'react-toastify';


type likeProps={
    postId:number;
    initialLikesCount:number|undefined;
    className?:string;
}

const LikeButton = ({ postId, initialLikesCount = 0, className = "" }:likeProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Number(initialLikesCount) || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await hasUserLikedPost(postId);
        setIsLiked(response.liked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    if (postId) {
      checkLikeStatus();
    }
  }, [postId]);

  const handleLikeToggle = async () => {
    if (loading) return;

    setLoading(true);
    const wasLiked = isLiked;

    try {
      if (wasLiked) {
     
        await unlikePost(postId);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        toast.success('הלייק בוטל');
      } else {
     
        await likePost(postId);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        toast.success('הפוסט קיבל לייק!');
      }
    } catch (error) {
      // אם יש שגיאה, נחזיר למצב הקודם
      setIsLiked(wasLiked);
      if (wasLiked) {
        setLikesCount(prev => prev + 1);
      } else {
        setLikesCount(prev => Math.max(0, prev - 1));
      }
      
      console.error('Error toggling like:', error);
      toast.error('שגיאה בעדכון הלייק');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      disabled={loading}
      className={`flex items-center gap-1 transition-all duration-200 hover:scale-105 ${
        loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {isLiked ? (
        <FaHeart className="text-red-500 animate-pulse" size={16} />
      ) : (
        <FaRegHeart className="text-gray-500 hover:text-red-400" size={16} />
      )}
      <span className={`text-sm font-medium ${
        isLiked ? 'text-red-500' : 'text-gray-600'
      }`}>
        {likesCount}
      </span>
    </button>
  );
};

export default LikeButton;