// User Response DTO - Được trả về từ backend
export interface UserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  avatar: string;
  role: string;
  createdAt: string;
  status: "active" | "banned" | "pending";
}

// User Request DTO - Gửi lên backend
export interface UserRequestDTO {
  fullName: string;
  email: string;
  role: string;
}

// User Form Input - Cho form submit
export interface UserFormInput extends UserRequestDTO {}
