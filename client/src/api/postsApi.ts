
import axiosInstance from "./axiosInstance";
import type { Post } from "../features/posts/type";

type PostProps = {
  data: Post[];
};
export type PostPayload = {
  content?: string;
  post_type?: string;
  image_url?: string;
};


export const getPosts = (params?: Record<string, string>) =>
  axiosInstance.get<PostProps>("/posts", { params }).then(res => res.data);

export const deletePost = (postId: number) =>
  axiosInstance.delete(`/posts/${postId}`).then(res => res.data);

export const updatePost = (postId: number, updatedData: Partial<Post>) =>
  axiosInstance.put(`/posts/${postId}`, updatedData).then(res => res.data);


export const createPost = async (payload: PostPayload) => {
  const response = await axiosInstance.post('/posts', payload);
  return response.data;
};

