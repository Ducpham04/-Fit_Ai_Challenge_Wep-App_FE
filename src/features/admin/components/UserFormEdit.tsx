import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components_1/ui/dialog";
import { Button } from "@/components_1/ui/button";
import { Input } from "@/components_1/ui/input";
import { Label } from "@/components_1/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components_1/ui/select";
import { UserResponseDTO, UserRequestDTO } from "../types/user.dto";

interface UserFormEditProps {
  isOpen: boolean;
  user: UserResponseDTO | null;
  onClose: () => void;
  onSubmit: (id: number, data: UserRequestDTO) => void;
}

export function UserFormEdit({
  isOpen,
  user,
  onClose,
  onSubmit,
}: UserFormEditProps) {
  const [formData, setFormData] = useState<UserRequestDTO>({
    fullName: "",
    email: "",
    role: "User",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data khi user thay đổi
  useEffect(() => {
    console.log("UserFormEdit - isOpen:", isOpen, "user:", user);
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      });
      setErrors({});
    }
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Tên đầy đủ không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.role) {
      newErrors.role = "Vui lòng chọn role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm() && user) {
      onSubmit(user.id, formData);
      setErrors({});
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    console.log("Dialog open state changed to:", open);
    if (!open) {
      setFormData({ fullName: "", email: "", role: "User" });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết cho người dùng này.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Full Name */}
          <div className="grid gap-2">
            <Label htmlFor="edit-fullName" className="text-sm font-medium">
              Tên đầy đủ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-fullName"
              placeholder="Nhập tên đầy đủ"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="edit-email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="nhập@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div className="grid gap-2">
            <Label htmlFor="edit-role" className="text-sm font-medium">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: string) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
