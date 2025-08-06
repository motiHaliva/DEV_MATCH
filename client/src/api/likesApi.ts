
import axiosInstance from "./axiosInstance";


export const likePost = async (postId:number) => {
  try {
    const response = await axiosInstance.post(`/post-likes/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};


export const unlikePost = async (postId:number) => {
  try {
    const response = await axiosInstance.delete(`/post-likes/${postId}/unlike`);
    return response.data;
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};


export const hasUserLikedPost = async (postId:number) => {
  try {
    const response = await axiosInstance.get(`/post-likes/${postId}/liked`);
    return response.data;
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    throw error;
  }
};


export const getLikesForPost = async (postId:number) => {
  try {
    const response = await axiosInstance.get(`/post-likes/${postId}/likes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching likes:', error);
    throw error;
  }
};