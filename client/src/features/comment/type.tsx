import type { CurrentUser } from "../../api/typs";

export type Comment = {
    id: number;
    post_id: number;
    user_id: number;
    content: string;
    deleted_at?: string; 
    updated_at?: string;
    created_at?: string;
    user_firstname: string;   
user_lastname: string;
    profile_image?: string;
}
export type CommentProps = {
    comment: Comment;
    onCommentUpdated: (updatedComment: Comment) => void;
    onCommentDeleted: (commentId: number) => void;
}

export type CommentsSectionProps= {
    postId: number;
    isVisible: boolean;
    onCommentCountChange?: (newCount: number) => void;
    refreshTrigger?: number;
}

export type FormCommentsProps = {
    currentUser?: CurrentUser;
    newComment: string;
    setNewComment: (value: string) => void;
    submitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
}