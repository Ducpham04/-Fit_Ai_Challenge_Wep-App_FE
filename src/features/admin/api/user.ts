import client from '../../../api/client';
import { UserRequestDTO, UserResponseDTO } from '../types/user.dto';

export const userApi = {
  // Get all users
  getUsers() {
    console.log("🔍 Fetching users from /admin/users with token...");
    return client.get<UserResponseDTO[]>("/admin/users").catch(err => {
      console.error("❌ /admin/users failed with", err.response?.status, "- trying /admin/user");
      // Fallback to other endpoint
      return client.get<UserResponseDTO[]>("/admin/user");
    });
  },

  // Get single user by ID
  getUserById(id: number) {
    return client.get<UserResponseDTO>(`/auth/users/${id}`);
  },

  // Create new user
  createUser(data: UserRequestDTO) {
    return client.post<UserResponseDTO>("/auth/register", data);
  },

  // Update user
  updateUser(id: number, data: UserRequestDTO) {
    return client.put<UserResponseDTO>(`/auth/users/${id}`, data);
  },

  // Delete user
  deleteUser(id: number) {
    return client.delete(`/auth/users/${id}`);
  },

  // Update user status (optional - if your API supports this)
  updateUserStatus(id: number, status: "active" | "banned" | "pending") {
    return client.patch<UserResponseDTO>(`/admin/user/${id}/status`, { status });
  },

  // Get all roles (optional - if your API supports this)
  getRoles() {
    return client.get<{ id: string; name: string; description: string }[]>("/auth/roles");
  }
};