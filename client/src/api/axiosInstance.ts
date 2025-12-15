import axios from "axios";

const axiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' && window. location.hostname === 'localhost'
    ? "http://localhost:3000"
    : "https://dev-match-oqi4.vercel.app",
  withCredentials: true,
});

export default axiosInstance;