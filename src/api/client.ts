import axios from "axios";
import { tokenService } from "./token.service";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = tokenService.getLocalAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      tokenService.clearTokens();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;
