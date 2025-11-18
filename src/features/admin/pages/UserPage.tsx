import { useState, useEffect } from "react";
import { Button } from "@/components_1/ui/button";
import { Plus, Users } from "lucide-react";
import { UserResponseDTO, UserRequestDTO } from "../types/user.dto";
import { mockUsers } from "../data/user.mock";
import { UserTable } from "../components/UserTable";
import { UserFormCreate } from "../components/UserFormCreate";
import { UserFormEdit } from "../components/UserFormEdit";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";

export function UserPage() {
  const [users, setUsers] = useState<UserResponseDTO[]>(mockUsers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
  });

  // Handle Create
  const handleCreateUser = (data: UserRequestDTO) => {
    const newUser: UserResponseDTO = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      ...data,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.fullName.replace(/\s/g, "")}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setUsers([...users, newUser]);
  };

  // Handle Edit
  const handleEditUser = (id: number, data: UserRequestDTO) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? {
              ...u,
              ...data,
            }
          : u
      )
    );
  };

  // Handle Delete
  const handleDeleteClick = (user: UserResponseDTO) => {
    console.log("handleDeleteClick triggered with user:", user);
    setDeleteConfirm({
      isOpen: true,
      userId: user.id,
      userName: user.fullName,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.userId !== null) {
      setUsers(users.filter((u) => u.id !== deleteConfirm.userId));
      setDeleteConfirm({ isOpen: false, userId: null, userName: "" });
    }
  };

  const handleEditClick = (user: UserResponseDTO) => {
    console.log("handleEditClick triggered with user:", user);
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  useEffect(() => {
    console.log("[UserPage] isCreateOpen:", isCreateOpen);
  }, [isCreateOpen]);

  const handleCreateButtonClick = () => {
    console.log("[UserPage] Create button clicked");
    setIsCreateOpen(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý người dùng
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý danh sách người dùng hệ thống
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateButtonClick}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <UserTable
          users={users}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Modals */}
      <UserFormCreate
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateUser}
      />

      <UserFormEdit
        isOpen={isEditOpen}
        user={selectedUser}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        userName={deleteConfirm.userName}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirm({ isOpen: false, userId: null, userName: "" })
        }
      />
    </div>
  );
}
