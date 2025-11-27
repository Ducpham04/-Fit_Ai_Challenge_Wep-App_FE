import { useState, useEffect } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Users } from "lucide-react";
import { UserResponseDTO, UserRequestDTO } from "../types/user.dto";
import { UserTable } from "../components/UserTable";
import { validateUserForm, hasErrors, type UserFormErrors } from "@/utils/formValidator";
import { userApi } from "../api/user";

/* REQUEST MODEL MỚI — thêm password + roleId */
const EMPTY_FORM: UserRequestDTO = { 
  fullName: "", 
  email: "", 
  password: "",
  roleId: "" 
};

export const ROLE_OPTIONS = [
  { id: 1, name: "ADMIN" },
  { id: 2, name: "CUSTOMER" },
  { id: 3, name: "MANAGER" }
];


type ModalType = "create" | "edit" | "delete" | null;

/* Modal Overlay */
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div
        className="bg-white p-8 rounded-xl w-[500px] max-w-[90%] shadow-2xl relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function UserPage() {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null);

  const [form, setForm] = useState<UserRequestDTO>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getUsers();
      console.log("Fetched users:", response?.data.data);
      setUsers(response?.data.data || []);
    } catch (err) {
      setUsers([]);
      setError("❌ Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ------- Open Modals ---------
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSelectedUser(null);
    setActiveModal("create");
  };

  const openEdit = (user: UserResponseDTO) => {
    setSelectedUser(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      password: "", // Không bao giờ load password từ BE!
      roleId: user.role, // Giả sử role ở đây là role name 
    });
    setFormErrors({});
    setActiveModal("edit");
  };

  const openDelete = (user: UserResponseDTO) => {
    setSelectedUser(user);
    setActiveModal("delete");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
    setFormErrors({});
  };

  // ------- Submit Create / Edit ---------
  const handleSubmit = async () => {
    const errors = validateUserForm(form);
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    try {
      if (activeModal === "create") {
        const rescreate = await userApi.createUser(form);
        console.log("User created:", form.fullName);
      }

      if (activeModal === "edit" && selectedUser) {
        await userApi.updateUser(selectedUser.id, {
          fullName: form.fullName,
          email: form.email,
          password: form.password , 
          roleId: form.roleId,
        });
      }

      fetchUsers();
      closeModal();
    } catch (err) {
      setError("❌ Không thể lưu dữ liệu người dùng.");
    }
  };

  // ------- Delete User ---------
  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await userApi.deleteUser(selectedUser.id);
      fetchUsers();
      closeModal();
    } catch (err) {
      setError("❌ Xóa người dùng thất bại.");
    }
  };

  return (
    <main className="relative">
      <div className={`p-8 transition ${activeModal ? "pointer-events-none opacity-40" : ""}`}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
              <p className="text-sm text-gray-600 mt-1">Quản lý danh sách người dùng hệ thống</p>
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            Thêm người dùng
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={fetchUsers} className="text-blue-600 underline">
              Thử lại
            </button>
          </div>
        )}

        {loading && <div className="mb-4 text-gray-500">Đang tải danh sách người dùng...</div>}

        <UserTable users={users} onEdit={openEdit} onDelete={openDelete} />
      </div>

      {activeModal && (
        <Modal key={activeModal} onClose={closeModal}>
          {/* CREATE + EDIT FORM */}
          {(activeModal === "create" || activeModal === "edit") && (
            <>
              <h2 className="text-xl font-bold mb-6">
                {activeModal === "create" ? "Thêm người dùng" : "Chỉnh sửa người dùng"}
              </h2>

              <div className="flex flex-col gap-4">
                <input
                  className="border p-3 rounded-lg"
                  placeholder="Tên đầy đủ"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
                {formErrors.fullName && <p className="text-red-500 text-sm">{formErrors.fullName}</p>}

                <input
                  className="border p-3 rounded-lg"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}

                {/* PASSWORD */}
                <input
                  type="password"
                  className="border p-3 rounded-lg"
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
     

                {/* ROLE ID */}
                <select
  className="border p-3 rounded-lg"
  value={form.roleId}
  onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}
>
  {ROLE_OPTIONS.map((r) => (
    <option key={r.id} value={r.id}>
      {r.name}
    </option>
  ))}
</select>

              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={closeModal}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit}>
                  {activeModal === "create" ? "Tạo" : "Cập nhật"}
                </Button>
              </div>
            </>
          )}

          {/* DELETE CONFIRM */}
          {activeModal === "delete" && (
            <>
              <h2 className="text-xl font-bold mb-4 text-red-600">Xác nhận xóa</h2>
              <p>
                Bạn có chắc muốn xóa người dùng <strong>{selectedUser?.fullName}</strong>?
              </p>
              <p className="text-sm text-gray-600 mt-2">Hành động này không thể hoàn tác.</p>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={closeModal}>
                  Hủy
                </Button>

                <Button  onClick={handleDelete}>
                  Xóa
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </main>
  );
}
