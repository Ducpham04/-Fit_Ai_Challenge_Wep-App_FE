export interface UserFormErrors {
  fullName?: string;
  email?: string;
  role?: string;
}

export function validateUserForm(data: {
  fullName: string;
  email: string;
  roleId: string;
  password: string;
}): UserFormErrors {
  const errors: UserFormErrors = {};

  if (!data.fullName?.trim()) {
    errors.fullName = "Tên đầy đủ không được để trống";
  }

  if (!data.email?.trim()) {
    errors.email = "Email không được để trống";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Email không hợp lệ";
  }

  if (!data.roleId) {
    errors.role = "Vui lòng chọn role";
  }

  return errors;
}

export function hasErrors(errors: UserFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
