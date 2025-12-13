import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === 'production'
    ? "https://dev-match-oqi4.vercel.app"  
    : "http://localhost:4000",              
  withCredentials: true,
});

export default axiosInstance;