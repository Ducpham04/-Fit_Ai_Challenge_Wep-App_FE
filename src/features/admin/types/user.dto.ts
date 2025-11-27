// User được trả về từ BE
export interface UserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  avatar: string;
  role: string;  // ADMIN | CUSTOMER | MANAGER
  createdAt: string;
  status: "active" | "banned" | "pending";
}

// Request gửi lên BE
export interface UserRequestDTO {
  fullName: string;
  password: string;
  email: string;
  roleId: number;     // ❗ phải là number
}

export interface RoleGet {
  id: number;         // BE chắc chắn trả về number
  name: string;       // ADMIN
  description: string;
}

export interface UserFormInput extends UserRequestDTO {}
