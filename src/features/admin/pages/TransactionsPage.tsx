import { useMemo, useState, useEffect } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Plus, CreditCard, Search, FileDown, AlertCircle, Download, Calendar, Filter } from "lucide-react";
import { SimpleInput as Input } from "@/components_1/ui/simple-input";
import { SimpleModal } from "@/components_1/ui/simple-modal";
import { SimpleSelect } from "@/components_1/ui/simple-select";
import { FormField } from "@/components_1/ui/form-field";
import { SimpleTextarea as Textarea } from "@/components_1/ui/simple-textarea";
import { transactionAPI } from "../api/adminAPI";
import {
  AdminTransaction,
  TransactionPayload,
} from "../types/admin-entities";

const EMPTY_TRANSACTION: TransactionPayload = {
  userId: "",
  userName: "",
  amount: 0,
  type: "deposit",
  date: new Date().toISOString().slice(0, 10),
  status: "completed",
  note: "",
};

type ModalMode = "create" | "edit";

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: ModalMode;
    transaction?: AdminTransaction;
  }>({
    open: false,
    mode: "create",
  });
  const [form, setForm] = useState<TransactionPayload>(EMPTY_TRANSACTION);
  const [deleteTarget, setDeleteTarget] = useState<AdminTransaction | null>(
    null
  );
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 [TransactionsPage] Fetching transactions...");
      const response = await transactionAPI.getAll();
      console.log("✅ [TransactionsPage] Full response:", response);
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      }
      console.log("📋 [TransactionsPage] Extracted data:", data);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("❌ [TransactionsPage] Error fetching transactions:", error);
      setError(error?.message || "Không thể tải danh sách transactions");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm(EMPTY_TRANSACTION);
    setError(null);
    setModalState({ open: true, mode: "create" });
  };

  const openEditModal = (transaction: AdminTransaction) => {
    const { id, ...rest } = transaction;
    setForm(rest);
    setError(null);
    setModalState({ open: true, mode: "edit", transaction });
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(EMPTY_TRANSACTION);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError(null);
      console.log("📤 [TransactionsPage] Submitting transaction...", "Mode:", modalState.mode, "Data:", form);
      
      if (modalState.mode === "create") {
        console.log("➕ Creating new transaction");
        await transactionAPI.create(form);
      } else if (modalState.transaction) {
        console.log("✏️ Updating transaction ID:", modalState.transaction.id);
        await transactionAPI.update(modalState.transaction.id, form);
      }
      
      console.log("✅ Transaction saved successfully");
      await fetchTransactions();
      closeModal();
    } catch (error: any) {
      console.error("❌ [TransactionsPage] Error saving transaction:", error);
      setError(error?.message || "Có lỗi xảy ra khi lưu transaction");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      console.log("🗑️ [TransactionsPage] Deleting transaction ID:", id);
      await transactionAPI.delete(id);
      console.log("✅ Transaction deleted successfully");
      await fetchTransactions();
      setDeleteTarget(null);
    } catch (error: any) {
      console.error("❌ [TransactionsPage] Error deleting transaction:", error);
      setError(error?.message || "Không thể xóa transaction");
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "User", "Amount", "Type", "Date", "Status", "Note"];
    const rows = filtered.map((tx) => [
      tx.id,
      tx.userName,
      tx.amount,
      tx.type,
      tx.date,
      tx.status,
      tx.note || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions-${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    console.log("✅ [TransactionsPage] CSV exported successfully");
  };

  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        (transaction.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.userId || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        typeFilter === "all" ? true : transaction.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" ? true : transaction.status === statusFilter;
      
      // Date range filtering
      const transactionDate = new Date(transaction.date);
      const matchesDateStart = !dateRangeStart || transactionDate >= new Date(dateRangeStart);
      const matchesDateEnd = !dateRangeEnd || transactionDate <= new Date(dateRangeEnd);
      
      return matchesSearch && matchesType && matchesStatus && matchesDateStart && matchesDateEnd;
    });
  }, [transactions, searchTerm, typeFilter, statusFilter, dateRangeStart, dateRangeEnd]);

  const aggregates = useMemo(() => {
    const completed = transactions.filter((t) => t.status === "completed");
    const totalVolume = completed.reduce((sum, t) => sum + t.amount, 0);
    const pending = transactions.filter((t) => t.status === "pending").length;
    return {
      totalVolume,
      pending,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  return (
    <div className="p-8 space-y-8">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">
            Finance
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý giao dịch
          </h1>
          <p className="text-gray-600 mt-2">
            Theo dõi nạp/rút, phần thưởng và mua gói của người dùng
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportCSV}
          >
            <Download size={16} />
            Xuất CSV
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Bộ lọc
          </Button>
          <Button
            className="flex items-center gap-2 px-4 py-2"
            onClick={openCreateModal}
          >
            <Plus size={16} />
            Giao dịch mới
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
              <input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
              <input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Transaction Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="reward">Reward</option>
                <option value="purchase">Purchase</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          {(dateRangeStart || dateRangeEnd || typeFilter !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setDateRangeStart("");
                setDateRangeEnd("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
              className="w-full px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-medium text-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TransactionStat
          label="Tổng giao dịch"
          value={aggregates.totalTransactions}
        />
        <TransactionStat
          label="Doanh thu hoàn tất"
          value={`$${aggregates.totalVolume.toFixed(2)}`}
        />
        <TransactionStat label="Đang chờ xử lý" value={aggregates.pending} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Tìm theo tên hoặc mã người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <SimpleSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "Tất cả loại" },
            { value: "deposit", label: "Deposit" },
            { value: "withdrawal", label: "Withdrawal" },
            { value: "reward", label: "Reward" },
            { value: "purchase", label: "Purchase" },
          ]}
          className="w-full lg:w-[200px]"
        />
        <SimpleSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
          ]}
          className="w-full lg:w-[200px]"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Người dùng</th>
              <th className="px-6 py-3 text-left">Số tiền</th>
              <th className="px-6 py-3 text-left">Loại</th>
              <th className="px-6 py-3 text-left">Ngày</th>
              <th className="px-6 py-3 text-left">Trạng thái</th>
              <th className="px-6 py-3 text-left">Ghi chú</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {transaction.userName}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.userId}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`capitalize text-sm font-medium flex items-center gap-2 ${typeColor(
                      transaction.type
                    )}`}
                  >
                    <CreditCard size={16} />
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">{transaction.date}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {transaction.note || "—"}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(transaction)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteTarget(transaction)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Không có giao dịch phù hợp tiêu chí tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SimpleModal
        isOpen={modalState.open}
        onClose={closeModal}
        title={
          modalState.mode === "create" ? "Thêm giao dịch" : "Cập nhật giao dịch"
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
            >
              {modalState.mode === "create" ? "Tạo mới" : "Lưu thay đổi"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <FormField
            label="Tên người dùng"
            value={form.userName}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, userName: value }))
            }
            required
          />
          <FormField
            label="Mã người dùng"
            value={form.userId}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, userId: value }))
            }
            placeholder="VD: USR-001"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Số tiền (USD)"
              type="number"
              value={String(form.amount)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  amount: Number(value) || 0,
                }))
              }
            />
            <FormField
              label="Ngày giao dịch"
              type="date"
              value={form.date}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, date: value }))
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Loại</label>
              <SimpleSelect
                value={form.type}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    type: value as TransactionPayload["type"],
                  }))
                }
                options={[
                  { value: "deposit", label: "Deposit" },
                  { value: "withdrawal", label: "Withdrawal" },
                  { value: "reward", label: "Reward" },
                  { value: "purchase", label: "Purchase" },
                ]}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <SimpleSelect
                value={form.status}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    status: value as TransactionPayload["status"],
                  }))
                }
                options={[
                  { value: "completed", label: "Completed" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                ]}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Ghi chú</label>
            <Textarea
              value={form.note}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, note: e.target.value }))
              }
              className="min-h-[80px]"
              placeholder="Thông tin bổ sung (ví dụ: lý do thất bại, mã đơn hàng...)"
            />
          </div>
        </div>
      </SimpleModal>

      <SimpleModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Xuất báo cáo giao dịch"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>
              Đóng
            </Button>
            <Button>Xuất CSV</Button>
          </div>
        }
      >
        <p className="text-gray-600">
          Chức năng export sẽ sử dụng bộ lọc hiện tại để tạo file CSV phục vụ kế
          toán.
        </p>
      </SimpleModal>

      <SimpleModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Xóa giao dịch"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteTarget) {
                  handleDelete(deleteTarget.id);
                }
              }}
            >
              Xóa
            </Button>
          </div>
        }
      >
        <p className="text-gray-600">
          Bạn có chắc muốn xóa giao dịch của{" "}
          <span className="font-semibold">{deleteTarget?.userName}</span>? Thao
          tác này không thể hoàn tác.
        </p>
      </SimpleModal>
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "completed":
      return "text-green-700 bg-green-50";
    case "pending":
      return "text-yellow-700 bg-yellow-50";
    case "failed":
      return "text-red-700 bg-red-50";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

function typeColor(type: string) {
  switch (type) {
    case "deposit":
      return "text-green-600";
    case "withdrawal":
      return "text-red-600";
    case "reward":
      return "text-blue-600";
    case "purchase":
      return "text-indigo-600";
    default:
      return "text-gray-600";
  }
}

function TransactionStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
