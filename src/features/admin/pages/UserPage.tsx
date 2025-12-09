import { useState, useEffect, useMemo } from "react";
import { SimpleButton as Button } from "@/components/ui/simple-button";
import { Users, AlertCircle, Search } from "lucide-react";
import { AdminUser } from "../types/admin-entities";
import { UserTable } from "../components/UserTable";
import { validateUserForm, hasErrors, type UserFormErrors } from "@/utils/formValidator";
import { userApi } from "../api/user";
import { UserDetailPage } from "./UserDetailPage";
import { userAPI } from "../api/adminAPI";
import { extractDataFromResponse } from "../utils/responseHelper";

/* REQUEST MODEL MỚI — thêm password + roleId */
const EMPTY_FORM = { 
  fullName: "", 
  email: "", 
  password: "",
  roleId: 2 ,
  status: "active",
};

export const ROLE_OPTIONS = [
  { id: 1, name: "ADMIN" },
  { id: 2, name: "CUSTOMER" },
  { id: 3, name: "MANAGER" }
];

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "banned", label: "Banned" }
];

type ModalType = "create" | "edit" | "delete" | null;

/* Modal Overlay */
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div
        className="relative z-[100000] bg-white p-8 rounded-xl w-[500px] max-w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function UserPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 [UserPage] Fetching users...");
      
      // Use AdminAPI which returns Page<UserDTO> format
      const response = await userAPI.getAll();
      console.log("✅ [UserPage] Full response:", response);
      
      // Extract data using helper function
      const userData = extractDataFromResponse<AdminUser>(response);
      console.log("📋 [UserPage] Extracted users:", userData);
      setUsers(userData);
    } catch (err: any) {
      console.error("❌ [UserPage] Error:", err);
      setError(err?.response?.data?.message || err?.message || "Error loading users");
      setUsers([]);
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

  const openEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      password: "",
      roleId: user.roleId || 2,
      status: user.status || "active",
    });
    setFormErrors({});
    setActiveModal("edit");
  };

  const openDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setActiveModal("delete");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
    setFormErrors({});
  };

  const openDetail = (user: AdminUser) => {
    setDetailUser(user);
  };

  const closeDetail = () => {
    setDetailUser(null);
  };

  // ------- Submit Create / Edit ---------
  const handleSubmit = async () => {
    console.log("Formuprequest :", form)
    const errors = validateUserForm(form);
    console.log("Validation errors:", errors);
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    try {
      setSubmitLoading(true);
      console.log("📤 [UserPage] Submitting user form...", form);

      if (activeModal === "create") {
        console.log("📤 [UserPage] Creating new user...");
        await userAPI.create({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          roleId: form.roleId,
          status : form.status,
        });
        console.log("✅ [UserPage] User created successfully");
      }

      if (activeModal === "edit" && selectedUser) {
        console.log("📤 [UserPage] Updating user...");
        await userAPI.update(selectedUser.id, {
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          roleId: form.roleId,
          status : form.status
        });
        console.log("✅ [UserPage] User updated successfully");
      }

      await fetchUsers();
      closeModal();
    } catch (err: any) {
      console.error("❌ [UserPage] Submit error:", err);
      setError(err?.message || "❌ Không thể lưu dữ liệu người dùng.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ------- Delete User ---------
  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setSubmitLoading(true);
      console.log("📤 [UserPage] Deleting user...", selectedUser.id);
      await userApi.deleteUser(selectedUser.id);
      console.log("✅ [UserPage] User deleted successfully");
      await fetchUsers();
      closeModal();
    } catch (err: any) {
      console.error("❌ [UserPage] Delete error:", err);
      setError(err?.message || "❌ Xóa người dùng thất bại.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ------- Filtered Users ---------
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        !searchTerm ||
        (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = !roleFilter || (user.role || "").toLowerCase() === roleFilter.toLowerCase();
      const matchStatus = !statusFilter || user.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  return (
    <main className="relative">
      {detailUser ? (
        <UserDetailPage user={detailUser} onBack={closeDetail} />
      ) : (
        <div className={`p-8 transition ${activeModal ? "pointer-events-none opacity-40" : ""}`}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
              <p className="text-sm text-gray-600 mt-1">Tổng cộng: {filteredUsers.length} người dùng</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchUsers}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
            <Button
              onClick={openCreate}
              variant="primary"
              className="flex items-center gap-2"
            >
              + Thêm người dùng
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role.id} value={role.name.toLowerCase()}>
                {role.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {(searchTerm || roleFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("");
                setStatusFilter("");
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            Đang tải danh sách người dùng...
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
            Không tìm thấy người dùng phù hợp.
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={user.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-3 text-sm text-gray-900">{user.fullName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "inactive"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openDetail(user)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                      >
                        Detail
                      </Button>
                      <Button
                        onClick={() => openEdit(user)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => openDelete(user)}
                        variant="danger"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {activeModal && (
        <Modal key={activeModal} onClose={closeModal}>
          {/* CREATE + EDIT FORM */}
          {(activeModal === "create" || activeModal === "edit") && (
            <>
              <h2 className="text-xl font-bold mb-6">
                {activeModal === "create" ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}
              </h2>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên đầy đủ</label>
                  <input
                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên đầy đủ"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                  {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={activeModal === "edit" ? "Leave blank to keep current password" : "Mật khẩu"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  {activeModal === "edit" && <p className="text-xs text-gray-500 mt-1">Để trống để giữ mật khẩu hiện tại</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.roleId}
                    onChange={(e) => setForm({ ...form, roleId:  Number(e.target.value) })}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
                  Hủy
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={submitLoading}>
                  {submitLoading ? "Loading..." : activeModal === "create" ? "Tạo" : "Cập nhật"}
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
                <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
                  Hủy
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={submitLoading}>
                  {submitLoading ? "Loading..." : "Xóa"}
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </main>
  );
}
