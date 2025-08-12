import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true,
});

export default axiosInstance;
// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true,
// });

// export default axiosInstance;
