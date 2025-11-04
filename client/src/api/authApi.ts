
import axiosInstance from "./axiosInstance";
import type { CurrentUser, SignUpProps } from "./typs";


export const signUpUser = (data: SignUpProps) =>
  axiosInstance.post("/auth/signup", data, { withCredentials: true });

export const getCurrentUser = () =>
  axiosInstance.get<{ user: CurrentUser }>("/auth/me").then(res => res.data.user);


export const loginUser = (data: { email: string; password: string }) =>
  axiosInstance.post("/auth/login", data, { withCredentials: true });



export const logoutUser = () =>
  axiosInstance.post("/auth/logout", {}, { withCredentials: true });
