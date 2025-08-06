
import React from "react";
import UserPosts from "../../../posts/UserPosts";
import { useUserPosts } from "../../hooks/useUserPosts";
import type { PostsSectionProps } from "../../type";

const PostsSection: React.FC<PostsSectionProps> = ({ currentUser, userId, isOwnProfile }) => {
  const {
    posts,
    loadingPosts,
    handleDeletePost,
    handleUpdatePost
  } = useUserPosts({
    currentUser,
    userId,
    isOwnProfile
  });

  return (
    <UserPosts
      posts={posts}
      loading={loadingPosts}
      onDelete={handleDeletePost}
      onUpdate={handleUpdatePost}
      isOwnProfile={isOwnProfile}
    />
  );
};

export default PostsSection;