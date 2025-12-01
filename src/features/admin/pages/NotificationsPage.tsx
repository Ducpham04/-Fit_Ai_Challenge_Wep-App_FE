import { useEffect, useMemo, useState } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Bell, Plus, Search, AlertCircle, Edit2, Trash2, Send } from "lucide-react";
import { FormField } from "@/components_1/ui/form-field";

interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  recipientGroup: "all" | "admins" | "users" | "specific";
  sentAt: string;
  readCount: number;
  totalRecipients: number;
  status: "draft" | "sent" | "scheduled";
}

interface NotificationPayload {
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  recipientGroup: "all" | "admins" | "users" | "specific";
  scheduledFor?: string;
}

const EMPTY_FORM: NotificationPayload = {
  title: "",
  message: "",
  type: "info",
  recipientGroup: "all",
};

const MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 1,
    title: "New Challenge Available",
    message: "A new push-up challenge is now available for all users!",
    type: "info",
    recipientGroup: "all",
    sentAt: "2024-01-15T10:00:00",
    readCount: 1250,
    totalRecipients: 2000,
    status: "sent",
  },
  {
    id: 2,
    title: "System Maintenance",
    message: "The system will undergo maintenance on Jan 20, 2024 from 2AM-4AM UTC",
    type: "warning",
    recipientGroup: "all",
    sentAt: "2024-01-14T09:00:00",
    readCount: 1800,
    totalRecipients: 2000,
    status: "sent",
  },
  {
    id: 3,
    title: "Reward Claim Reminder",
    message: "Don't forget to claim your weekly rewards!",
    type: "success",
    recipientGroup: "users",
    sentAt: "2024-01-13T08:00:00",
    readCount: 950,
    totalRecipients: 1500,
    status: "sent",
  },
];

type ModalMode = "create" | "edit" | "preview";

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

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: ModalMode;
    notification?: AdminNotification;
  }>({
    open: false,
    mode: "create",
  });
  const [form, setForm] = useState<NotificationPayload>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminNotification | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setModalState({ open: true, mode: "create" });
  };

  const openPreviewModal = (notification: AdminNotification) => {
    setModalState({ open: true, mode: "preview", notification });
  };

  const openDeleteModal = (notification: AdminNotification) => {
    setDeleteTarget(notification);
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(EMPTY_FORM);
    setError(null);
    setDeleteTarget(null);
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setError("Title and message are required");
      return;
    }

    try {
      setSubmitLoading(true);
      console.log("📤 [NotificationsPage] Sending notification...", form);

      const newNotif: AdminNotification = {
        id: Math.max(...notifications.map((n) => n.id), 0) + 1,
        ...form,
        sentAt: new Date().toISOString(),
        readCount: 0,
        totalRecipients: form.recipientGroup === "all" ? 2000 : form.recipientGroup === "users" ? 1500 : 100,
        status: "sent",
      };

      setNotifications([newNotif, ...notifications]);
      console.log("✅ Notification sent successfully");
      closeModal();
    } catch (err: any) {
      console.error("❌ [NotificationsPage] Send error:", err);
      setError(err?.message || "Failed to send notification");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitLoading(true);
      setNotifications(notifications.filter((n) => n.id !== deleteTarget.id));
      console.log("✅ Notification deleted");
      closeModal();
    } catch (err: any) {
      setError(err?.message || "Failed to delete");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchSearch =
        !searchTerm ||
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = !typeFilter || n.type === typeFilter;
      const matchStatus = !statusFilter || n.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [notifications, searchTerm, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = notifications.length;
    const sent = notifications.filter((n) => n.status === "sent").length;
    const draft = notifications.filter((n) => n.status === "draft").length;
    const totalReads = notifications.reduce((sum, n) => sum + n.readCount, 0);

    return { total, sent, draft, totalReads };
  }, [notifications]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="relative">
      <div className={`p-8 transition ${modalState.open || deleteTarget ? "pointer-events-none opacity-40" : ""}`}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-600 mt-1">Send and manage system notifications</p>
            </div>
          </div>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            <Plus size={18} /> New Notification
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Total Sent</p>
            <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Drafts</p>
            <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Total Reads</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReads}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Total Notifs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="sent">Sent</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>

          {(searchTerm || typeFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("");
                setStatusFilter("");
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div key={notif.id} className="bg-white rounded-lg p-4 shadow hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getTypeColor(notif.type)}`}>
                      {notif.type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium capitalize">
                      {notif.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(notif.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{notif.message.substring(0, 100)}...</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>
                      👥 {notif.recipientGroup === "all" ? "All Users" : notif.recipientGroup.charAt(0).toUpperCase() + notif.recipientGroup.slice(1)}
                    </span>
                    <span>📊 {notif.readCount} / {notif.totalRecipients} reads</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openPreviewModal(notif)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openDeleteModal(notif)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notifications found</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modalState.open && modalState.mode === "create" && !deleteTarget && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-6">Send New Notification</h2>

          <div className="space-y-4">
            <FormField
              label="Title"
              value={form.title}
              onChange={(v: string) => setForm({ ...form, title: v })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter notification message"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Send To</label>
                <select
                  value={form.recipientGroup}
                  onChange={(e) => setForm({ ...form, recipientGroup: e.target.value as any })}
                  className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="admins">Admins Only</option>
                  <option value="users">Users Only</option>
                  <option value="specific">Specific Group</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={submitLoading}>
              <Send size={16} className="mr-2" />
              {submitLoading ? "Sending..." : "Send Now"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      {modalState.open && modalState.mode === "preview" && modalState.notification && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4">Notification Preview</h2>

          <div className={`p-4 rounded-lg mb-4 ${getTypeColor(modalState.notification.type)}`}>
            <h3 className="font-bold text-lg mb-2">{modalState.notification.title}</h3>
            <p className="text-sm mb-3">{modalState.notification.message}</p>
            <div className="text-xs opacity-75">
              Sent to: {modalState.notification.recipientGroup} | {modalState.notification.readCount} /{" "}
              {modalState.notification.totalRecipients} reads
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Delete</h2>
          <p>
            Are you sure you want to delete this notification: <strong>{deleteTarget.title}</strong>?
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={submitLoading}>
              {submitLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
}
