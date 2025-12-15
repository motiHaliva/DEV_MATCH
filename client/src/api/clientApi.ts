import axiosInstance from "./axiosInstance";
import type { CurrentUser } from "./typs";



export const updateMyClientProfile = async (profileData: Partial<CurrentUser>) => {
  const response = await axiosInstance.put('/projects/profile', profileData);
  return response.data.user;
};