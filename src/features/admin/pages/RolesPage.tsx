import { useEffect, useMemo, useState } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Lock, Plus, Search, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { SimpleModal } from "@/components_1/ui/simple-modal";
import { FormField } from "@/components_1/ui/form-field";

interface AdminRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RolePayload {
  name: string;
  description: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
  "dashboard:view",
  "users:view",
  "users:create",
  "users:edit",
  "users:delete",
  "challenges:view",
  "challenges:create",
  "challenges:edit",
  "challenges:delete",
  "rewards:view",
  "rewards:create",
  "rewards:edit",
  "rewards:delete",
  "training_plans:view",
  "training_plans:create",
  "training_plans:edit",
  "training_plans:delete",
  "meals:view",
  "meals:create",
  "meals:edit",
  "meals:delete",
  "goals:view",
  "goals:create",
  "goals:edit",
  "goals:delete",
  "transactions:view",
  "transactions:create",
  "transactions:delete",
  "reports:view",
  "settings:manage",
  "roles:view",
  "roles:create",
  "roles:edit",
  "roles:delete",
];

const EMPTY_FORM: RolePayload = {
  name: "",
  description: "",
  permissions: [],
};

// Mock roles data
const MOCK_ROLES: AdminRole[] = [
  {
    id: 1,
    name: "ADMIN",
    description: "Full system access",
    permissions: AVAILABLE_PERMISSIONS,
    usersCount: 2,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "MANAGER",
    description: "Can manage users and challenges",
    permissions: [
      "dashboard:view",
      "users:view",
      "users:create",
      "users:edit",
      "challenges:view",
      "challenges:create",
      "challenges:edit",
      "reports:view",
    ],
    usersCount: 5,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-10",
  },
  {
    id: 3,
    name: "CUSTOMER",
    description: "Regular user access",
    permissions: [
      "dashboard:view",
      "challenges:view",
      "rewards:view",
      "goals:view",
    ],
    usersCount: 150,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-12",
  },
];

type ModalMode = "create" | "edit";

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div
        className="bg-white p-8 rounded-xl w-[600px] max-w-[90%] shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function RolesPage() {
  const [roles, setRoles] = useState<AdminRole[]>(MOCK_ROLES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: ModalMode;
    role?: AdminRole;
  }>({
    open: false,
    mode: "create",
  });
  const [form, setForm] = useState<RolePayload>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminRole | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    // Mock load - replace with API call
    console.log("📤 [RolesPage] Loading roles...");
    setLoading(false);
  }, []);

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setModalState({ open: true, mode: "create" });
  };

  const openEditModal = (role: AdminRole) => {
    setForm({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setError(null);
    setModalState({ open: true, mode: "edit", role });
  };

  const openDeleteModal = (role: AdminRole) => {
    setDeleteTarget(role);
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(EMPTY_FORM);
    setError(null);
    setDeleteTarget(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Role name is required");
      return;
    }

    try {
      setSubmitLoading(true);
      console.log("📤 [RolesPage] Submitting role...", form);

      if (modalState.mode === "create") {
        console.log("➕ Creating new role");
        const newRole: AdminRole = {
          id: Math.max(...roles.map(r => r.id)) + 1,
          name: form.name,
          description: form.description,
          permissions: form.permissions,
          usersCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setRoles([...roles, newRole]);
      } else if (modalState.role) {
        console.log("✏️ Updating role:", modalState.role.id);
        setRoles(
          roles.map((r) =>
            r.id === modalState.role!.id
              ? {
                  ...r,
                  name: form.name,
                  description: form.description,
                  permissions: form.permissions,
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        );
      }

      console.log("✅ Role saved successfully");
      closeModal();
    } catch (err: any) {
      console.error("❌ [RolesPage] Submit error:", err);
      setError(err?.message || "Failed to save role");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitLoading(true);
      console.log("📤 [RolesPage] Deleting role...", deleteTarget.id);
      setRoles(roles.filter((r) => r.id !== deleteTarget.id));
      console.log("✅ Role deleted successfully");
      closeModal();
    } catch (err: any) {
      console.error("❌ [RolesPage] Delete error:", err);
      setError(err?.message || "Failed to delete role");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) =>
        !searchTerm ||
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  return (
    <main className="relative">
      <div className={`p-8 transition ${modalState.open || deleteTarget ? "pointer-events-none opacity-40" : ""}`}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage system roles and permissions</p>
            </div>
          </div>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            <Plus size={18} /> Add Role
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                  {role.usersCount} users
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Permissions ({role.permissions.length})</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 5).map((perm) => (
                    <span
                      key={perm}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {perm.replace(":", "-")}
                    </span>
                  ))}
                  {role.permissions.length > 5 && (
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      +{role.permissions.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => openEditModal(role)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => openDeleteModal(role)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No roles found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalState.open && !deleteTarget && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-6">
            {modalState.mode === "create" ? "Create New Role" : "Edit Role"}
          </h2>

          <div className="space-y-4">
            <FormField 
              label="Role Name" 
              value={form.name}
              onChange={(v: string) => setForm({ ...form, name: v })}
              required 
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Brief description of this role"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({
                            ...form,
                            permissions: [...form.permissions, perm],
                          });
                        } else {
                          setForm({
                            ...form,
                            permissions: form.permissions.filter((p) => p !== perm),
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{perm.replace(":", " - ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading ? "Saving..." : "Save Role"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Delete</h2>
          <p>
            Are you sure you want to delete the role <strong>{deleteTarget.name}</strong>?
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {deleteTarget.usersCount} users currently have this role.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={submitLoading}>
              {submitLoading ? "Deleting..." : "Delete Role"}
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
}
