
import axiosInstance from './axiosInstance';
import type { Comment } from '../features/comment/type';

export type CreateCommentData = {
  post_id: number;
  content: string;
}

export type CommentsPaginationResponse= {
  data: Comment[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
}


export const createComment = async (commentData: CreateCommentData): Promise<Comment> => {
  const response = await axiosInstance.post('/post-comments', commentData);
  return response.data;
};

export const getCommentsByPost = async (
  postId: number,
  page: number = 1,
  limit: number = 10
): Promise<CommentsPaginationResponse> => {
  const response = await axiosInstance.get(`/post-comments/post/${postId}`, {
    params: { page, limit }
  });

  const {
    data = [],
    totalCount = 0,
    page: current_page = 1,
    totalPages = 1
  } = response.data;

  const has_next = current_page < totalPages;
  const has_prev = current_page > 1;

  return {
    data,
    pagination: {
      current_page,
      total_pages: totalPages,
      total_count: totalCount,
      has_next,
      has_prev
    }
  };
};


export const updateComment = async (commentId: number, content: string): Promise<Comment> => {
  const response = await axiosInstance.put(`/post-comments/${commentId}`, { content });
  return response.data;
};


export const deleteComment = async (commentId: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/post-comments/${commentId}`);
  return response.data;
};
