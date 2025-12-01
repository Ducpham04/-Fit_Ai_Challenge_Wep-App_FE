import { useState, useMemo } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Settings, Users, Shield, AlertCircle, Trash2, Edit2, Plus, Search, Filter, Copy, Eye, EyeOff, Calendar, LogOut } from "lucide-react";
import { FormField } from "@/components_1/ui/form-field";

interface AdminAccount {
  id: number;
  username: string;
  email: string;
  role: "super_admin" | "admin" | "moderator";
  lastLogin: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface GeneralSettings {
  appTitle: string;
  appVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maxUploadSize: number;
  sessionTimeout: number;
}

interface ActivityLog {
  id: number;
  adminId: number;
  adminName: string;
  action: string;
  targetType: "user" | "reward" | "challenge" | "transaction" | "settings";
  targetId: string | number;
  timestamp: string;
  ipAddress: string;
  status: "success" | "failed";
}

const MOCK_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 1,
    username: "admin_super",
    email: "super@fitnit.com",
    role: "super_admin",
    lastLogin: "2024-11-27",
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    username: "admin_main",
    email: "admin@fitnit.com",
    role: "admin",
    lastLogin: "2024-11-26",
    status: "active",
    createdAt: "2024-02-15",
  },
  {
    id: 3,
    username: "moderator_1",
    email: "mod1@fitnit.com",
    role: "moderator",
    lastLogin: "2024-11-25",
    status: "active",
    createdAt: "2024-03-20",
  },
  {
    id: 4,
    username: "moderator_2",
    email: "mod2@fitnit.com",
    role: "moderator",
    lastLogin: "2024-11-20",
    status: "inactive",
    createdAt: "2024-04-10",
  },
];

const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 1,
    adminId: 1,
    adminName: "admin_super",
    action: "Created new reward",
    targetType: "reward",
    targetId: "reward_new_001",
    timestamp: "2024-11-27T10:30:00",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: 2,
    adminId: 2,
    adminName: "admin_main",
    action: "Deleted user",
    targetType: "user",
    targetId: "user_123",
    timestamp: "2024-11-27T09:15:00",
    ipAddress: "192.168.1.101",
    status: "success",
  },
  {
    id: 3,
    adminId: 3,
    adminName: "moderator_1",
    action: "Updated challenge",
    targetType: "challenge",
    targetId: "challenge_456",
    timestamp: "2024-11-27T08:45:00",
    ipAddress: "192.168.1.102",
    status: "success",
  },
  {
    id: 4,
    adminId: 2,
    adminName: "admin_main",
    action: "Failed login attempt",
    targetType: "settings",
    targetId: "admin_2",
    timestamp: "2024-11-27T07:20:00",
    ipAddress: "192.168.1.150",
    status: "failed",
  },
  {
    id: 5,
    adminId: 1,
    adminName: "admin_super",
    action: "Updated system settings",
    targetType: "settings",
    targetId: "settings",
    timestamp: "2024-11-27T06:00:00",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: 6,
    adminId: 3,
    adminName: "moderator_1",
    action: "Created transaction",
    targetType: "transaction",
    targetId: "tx_789",
    timestamp: "2024-11-26T15:30:00",
    ipAddress: "192.168.1.102",
    status: "success",
  },
];

const TAB_IDS = ["accounts", "settings", "logs"] as const;
type TabId = (typeof TAB_IDS)[number];

export function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("accounts");
  const [accounts, setAccounts] = useState<AdminAccount[]>(MOCK_ADMIN_ACCOUNTS);
  const [logs, setLogs] = useState<ActivityLog[]>(MOCK_ACTIVITY_LOGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [logDateStart, setLogDateStart] = useState("");
  const [logDateEnd, setLogDateEnd] = useState("");
  const [logActionFilter, setLogActionFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ username: "", email: "", role: "moderator" });
  const [showPasswordGenerate, setShowPasswordGenerate] = useState<number | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [settings, setSettings] = useState<GeneralSettings>({
    appTitle: "FitNit Challenge",
    appVersion: "1.2.0",
    maintenanceMode: false,
    maintenanceMessage: "System is under maintenance. Please try again later.",
    maxUploadSize: 50, // MB
    sessionTimeout: 30, // minutes
  });

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch =
        account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || account.role === roleFilter;
      const matchesStatus = !statusFilter || account.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, searchTerm, roleFilter, statusFilter]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction = !logActionFilter || log.action.toLowerCase().includes(logActionFilter.toLowerCase());
      const logDate = new Date(log.timestamp);
      const matchesDateStart = !logDateStart || logDate >= new Date(logDateStart);
      const matchesDateEnd = !logDateEnd || logDate <= new Date(logDateEnd);
      return matchesAction && matchesDateStart && matchesDateEnd;
    });
  }, [logs, logActionFilter, logDateStart, logDateEnd]);

  const accountStats = useMemo(() => {
    return {
      total: accounts.length,
      active: accounts.filter((a) => a.status === "active").length,
      superAdmins: accounts.filter((a) => a.role === "super_admin").length,
      admins: accounts.filter((a) => a.role === "admin").length,
      moderators: accounts.filter((a) => a.role === "moderator").length,
    };
  }, [accounts]);

  const logStats = useMemo(() => {
    return {
      total: filteredLogs.length,
      success: filteredLogs.filter((l) => l.status === "success").length,
      failed: filteredLogs.filter((l) => l.status === "failed").length,
    };
  }, [filteredLogs]);

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(pwd);
  };

  const handleAddAccount = () => {
    if (!newAccount.username.trim() || !newAccount.email.trim()) {
      setError("Username and email are required");
      return;
    }
    const account: AdminAccount = {
      id: Math.max(...accounts.map((a) => a.id), 0) + 1,
      username: newAccount.username,
      email: newAccount.email,
      role: newAccount.role as AdminAccount["role"],
      lastLogin: new Date().toISOString().split("T")[0],
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAccounts([...accounts, account]);
    setNewAccount({ username: "", email: "", role: "moderator" });
    setShowNewAccountForm(false);
    console.log("✅ [SystemSettingsPage] Admin account created:", account);
  };

  const handleDeleteAccount = (id: number) => {
    setAccounts(accounts.filter((a) => a.id !== id));
    console.log("✅ [SystemSettingsPage] Admin account deleted:", id);
  };

  const handleUpdateSettings = () => {
    console.log("✅ [SystemSettingsPage] Settings updated:", settings);
    setError(null);
  };

  const roleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: "👑 Super Admin",
      admin: "🔐 Admin",
      moderator: "🛡️ Moderator",
    };
    return labels[role] || role;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Manage admin accounts, general settings, and activity logs</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: "accounts" as TabId, label: "Admin Accounts", icon: "👥" },
            { id: "settings" as TabId, label: "General Settings", icon: "⚙️" },
            { id: "logs" as TabId, label: "Activity Logs", icon: "📋" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-xs text-gray-600 uppercase">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{accountStats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-xs text-gray-600 uppercase">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{accountStats.active}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-xs text-gray-600 uppercase">Super Admins</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{accountStats.superAdmins}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-xs text-gray-600 uppercase">Admins</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{accountStats.admins}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-xs text-gray-600 uppercase">Moderators</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{accountStats.moderators}</p>
            </div>
          </div>

          {/* Filters & Add Button */}
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <Button onClick={() => setShowNewAccountForm(!showNewAccountForm)} className="bg-blue-600">
                <Plus size={16} /> Add Admin
              </Button>
            </div>

            {showNewAccountForm && (
              <div className="border-t pt-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Username"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newAccount.email}
                    onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newAccount.role}
                    onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddAccount} className="bg-green-600">
                    Create Account
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewAccountForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Accounts Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Login</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{account.username}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{account.email}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {roleLabel(account.role)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{account.lastLogin}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          account.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-2 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* General Settings Tab */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Application Settings</h3>
            <FormField
              label="App Title"
              value={settings.appTitle}
              onChange={(v: string) => setSettings({ ...settings, appTitle: v })}
            />
            <FormField
              label="App Version"
              value={settings.appVersion}
              onChange={(v: string) => setSettings({ ...settings, appVersion: v })}
            />
            <FormField
              label="Max Upload Size (MB)"
              value={settings.maxUploadSize.toString()}
              onChange={(v: string) => setSettings({ ...settings, maxUploadSize: Number(v) || 0 })}
              type="number"
            />
            <FormField
              label="Session Timeout (minutes)"
              value={settings.sessionTimeout.toString()}
              onChange={(v: string) => setSettings({ ...settings, sessionTimeout: Number(v) || 0 })}
              type="number"
            />
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Maintenance Mode</h3>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <label className="text-gray-700">Enable Maintenance Mode</label>
            </div>
            {settings.maintenanceMode && (
              <textarea
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                placeholder="Enter maintenance message..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpdateSettings} className="bg-blue-600">
              Save Settings
            </Button>
            <Button variant="outline" onClick={() => setError(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-xs text-gray-600 uppercase">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{logStats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-xs text-gray-600 uppercase">Success</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{logStats.success}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-xs text-gray-600 uppercase">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{logStats.failed}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Filter by action..."
                value={logActionFilter}
                onChange={(e) => setLogActionFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={logDateStart}
                onChange={(e) => setLogDateStart(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={logDateEnd}
                onChange={(e) => setLogDateEnd(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {(logActionFilter || logDateStart || logDateEnd) && (
                <button
                  onClick={() => {
                    setLogActionFilter("");
                    setLogDateStart("");
                    setLogDateEnd("");
                  }}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Admin</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Target</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">IP Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{log.adminName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{log.action}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {log.targetType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{log.timestamp}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{log.ipAddress}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No activity logs found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
