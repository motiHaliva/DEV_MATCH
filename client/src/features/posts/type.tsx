
export type Post = {
    id: number;
    user_id: number;
    content: string;
    image_url?: string;
    post_type?: string;
    likes_count?: number;
    comments_count?: number;
    deleted_at?: string;
    updated_at?: string;
    created_at: string;
    user_firstname: string;
    user_lastname: string;
    user_email?: string;
    user_avatar?: string;
}

export type PostData = {
    post: Post; 
    comment:Comment[];
    likes:Like[];
}



export type Like = {
    id: number;
    user_id: number;
    post_id: number;
    created_at?: string;
    updated_at?: string;
    firstname?: string;
    lastname?: string;
    profile_image?: string;
}

export type PostCardProps= {
  post: Post;
}
export type UserPostsProps = {
    posts: Post[];
    loading: boolean;
    onDelete?: (postId: number) => Promise<void>;
    onUpdate?: (postId: number, updatedData: Partial<Post>) => Promise<void>;
    isOwnProfile?: boolean|null;
}