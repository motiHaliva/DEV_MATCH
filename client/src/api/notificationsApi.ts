import axiosInstance from "./axiosInstance";

/* =========================
   Types
========================= */

export type RequestStatus = "pending" | "matched" | "declined";
export type RequestType = "freelancer_to_client" | "client_to_freelancer";
export type UserRole = "freelancer" | "client" | "admin";

export interface Notification {
  id: number;
  from_user_id: number;
  to_user_id: number;
  project_id: number;
  status: RequestStatus;
  request_type: RequestType;
  created_at: string;

  from_user_firstname: string;
  from_user_lastname: string;
  from_user_email: string;
  from_user_phone?: string | null;      // ✅ להוסיף
  from_user_profile_image?: string | null; // אם אתה מחזיר גם
  from_user_role: UserRole;

  project_title: string;
  project_description: string;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/* =========================
   API Calls
========================= */

export const getMyNotifications = async (
  page = 1,
  limit = 10
): Promise<NotificationsResponse> => {
  const response = await axiosInstance.get<NotificationsResponse>(
    `/requests/my-requests?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getMyCreatedNotifications = async (
  page = 1,
  limit = 10
): Promise<NotificationsResponse> => {
  const response = await axiosInstance.get<NotificationsResponse>(
    `/requests/my-created-requests?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const acceptNotification = async (id: number) => {
  const response = await axiosInstance.put(`/requests/accept/${id}`);
  return response.data;
};

export const rejectNotification = async (id: number) => {
  const response = await axiosInstance.put(`/requests/reject/${id}`);
  return response.data;
};

export const deleteNotification = async (id: number) => {
  const response = await axiosInstance.delete(`/requests/${id}`);
  return response.data;
};