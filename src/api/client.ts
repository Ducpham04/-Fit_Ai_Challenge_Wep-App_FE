import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3001", // URL mock API
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor (tự động xử lý trước/sau khi gọi API)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);
    throw error;
  }
);

export default axiosClient;
