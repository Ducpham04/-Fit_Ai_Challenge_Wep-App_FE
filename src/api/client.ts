// src/api/client.ts
import axios from "axios";
import { tokenService } from "./token.service";
import { API_BASE_URL } from "../config/api";

// Thêm /api vào baseURL vì tất cả routes backend đều có prefix /api
const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// ✅ Interceptor request: luôn lấy token mới nhất từ localStorage
client.interceptors.request.use((config) => {
  const token = tokenService.getLocalAccessToken();
  console.log("🔍 Request to:", config.method?.toUpperCase(), config.url);
  console.log("📦 Token value:", token ? `${token}...` : "NO TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Authorization header set");
  }
  return config;
});

// ✅ Interceptor response: xử lý 401 + log chi tiết
client.interceptors.response.use(
  (response) => {
    console.log("✅ Response OK:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", {
      status: error.response?.status,
      url: error.response?.config?.url,
      method: error.response?.config?.method,
      headers: error.response?.config?.headers,
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
    });
    
    // Chỉ clear token nếu từ /auth/me, không clear từ /auth/user (để thử endpoint khác)
    if (error.response?.status === 401 && error.response?.config?.url?.includes("/auth/me")) {
      console.warn("🔐 401 from /auth/me - Clearing tokens");
      tokenService.clearTokens();
    }
    return Promise.reject(error);
  }
);

export default client;
