
import { useState, useEffect } from "react";
import { getPosts, deletePost, updatePost} from '../../../api/postsApi'
import type { Post } from "../../posts/type";
import type { UseUserPostsParams } from "../type";


export const useUserPosts = ({ currentUser, userId, isOwnProfile }: UseUserPostsParams) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const loadUserPosts = async () => {
    if (!currentUser && !userId) return;
    setLoadingPosts(true);
    try {
      const response = await getPosts({ 
        user_id: (userId ?? currentUser?.id?.toString())! 
      });
      setPosts(response.data || []);
    } catch (err) {
      console.error("Error loading posts:", err);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!isOwnProfile) return;
    try {
      await deletePost(postId);
      await loadUserPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleUpdatePost = async (postId: number, updatedData: Partial<Post>) => {
    if (!isOwnProfile) return;
    try {
      await updatePost(postId, updatedData);
      await loadUserPosts();
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUserPosts();
    }
  }, [currentUser, userId]);

  return {
    posts,
    loadingPosts,
    handleDeletePost: isOwnProfile ? handleDeletePost : undefined,
    handleUpdatePost: isOwnProfile ? handleUpdatePost : undefined,
    loadUserPosts
  };
};