import axiosInstance from "./axiosInstance";

export const getStats = () =>
  axiosInstance.get("/stats").then(res => res.data);