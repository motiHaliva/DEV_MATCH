import axiosInstance from "./axiosInstance";

export interface CreateRequestPayload {
  to_user_id: number;
  project_id: number;
}

export const createRequest = async (
  data: CreateRequestPayload
) => {
  const response = await axiosInstance.post("/requests", data);
  return response.data;
};