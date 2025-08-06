// ClientPostsSection.tsx
import React from "react";
import UserPosts from "../../../posts/UserPosts";
import { useUserPosts } from "../../hooks/useUserPosts";
import type { ClientPostsSectionProps } from "../../type";

const ClientPostsSection: React.FC<ClientPostsSectionProps> = ({
  currentUser,
  clientId,
  isOwnProfile
}) => {
  const {
    posts,
    loadingPosts,
    handleDeletePost,
    handleUpdatePost
  } = useUserPosts({
    currentUser,
    userId: clientId, // clientId הוא למעשה userId
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

export default ClientPostsSection;