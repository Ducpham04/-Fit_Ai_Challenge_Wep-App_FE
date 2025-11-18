import { useState } from "react";
import { Button } from "@/components_1/ui/button";
import { Plus, CreditCard, Search } from "lucide-react";
import { Input } from "@/components_1/ui/input";

interface Transaction {
  id: number;
  userId: string;
  userName: string;
  amount: number;
  type: "deposit" | "withdrawal" | "reward";
  date: string;
  status: "completed" | "pending" | "failed";
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    userId: "USR-001",
    userName: "John Doe",
    amount: 100,
    type: "deposit",
    date: "2024-11-15",
    status: "completed",
  },
  {
    id: 2,
    userId: "USR-002",
    userName: "Jane Smith",
    amount: 50,
    type: "withdrawal",
    date: "2024-11-14",
    status: "completed",
  },
  {
    id: 3,
    userId: "USR-003",
    userName: "Bob Johnson",
    amount: 25,
    type: "reward",
    date: "2024-11-13",
    status: "pending",
  },
];

export function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = transactions.filter(
    (t) =>
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
        return "text-red-600 bg-red-50";
      default:
        return "";
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-green-600";
      case "withdrawal":
        return "text-red-600";
      case "reward":
        return "text-blue-600";
      default:
        return "";
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-2">View all user transactions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} />
          Export Report
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by user name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.userName}</p>
                    <p className="text-sm text-gray-500">{transaction.userId}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">${transaction.amount}</td>
                <td className="px-6 py-4">
                  <span className={`capitalize text-sm font-medium flex items-center gap-2 ${typeColor(transaction.type)}`}>
                    <CreditCard size={16} />
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">{transaction.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
