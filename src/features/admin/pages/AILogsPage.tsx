import { useEffect, useMemo, useState } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Bot, Search, AlertCircle, Eye, Download } from "lucide-react";
import { FormField } from "@/components_1/ui/form-field";

interface AILog {
  id: number;
  submissionId: number;
  userId: number;
  userName: string;
  modelVersion: string;
  inputType: string; // "video" | "image" | "text"
  prediction: string;
  confidence: number;
  processingTime: number; // ms
  isAccurate: boolean;
  createdAt: string;
}

const MOCK_LOGS: AILog[] = [
  {
    id: 1,
    submissionId: 101,
    userId: 10,
    userName: "John Doe",
    modelVersion: "v2.1",
    inputType: "video",
    prediction: "Push-up correctly performed",
    confidence: 0.98,
    processingTime: 2340,
    isAccurate: true,
    createdAt: "2024-01-15T10:30:00",
  },
  {
    id: 2,
    submissionId: 102,
    userId: 11,
    userName: "Jane Smith",
    modelVersion: "v2.1",
    inputType: "video",
    prediction: "Form needs improvement",
    confidence: 0.87,
    processingTime: 1890,
    isAccurate: true,
    createdAt: "2024-01-15T11:00:00",
  },
  {
    id: 3,
    submissionId: 103,
    userId: 12,
    userName: "Mike Johnson",
    modelVersion: "v2.0",
    inputType: "video",
    prediction: "Incorrect exercise",
    confidence: 0.72,
    processingTime: 1560,
    isAccurate: false,
    createdAt: "2024-01-15T11:30:00",
  },
];

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

export function AILogsPage() {
  const [logs, setLogs] = useState<AILog[]>(MOCK_LOGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("");
  const [accuracyFilter, setAccuracyFilter] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AILog | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        !searchTerm ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.prediction.toLowerCase().includes(searchTerm.toLowerCase());

      const matchModel = !modelFilter || log.modelVersion === modelFilter;

      let matchAccuracy = true;
      if (accuracyFilter === "accurate") {
        matchAccuracy = log.isAccurate;
      } else if (accuracyFilter === "inaccurate") {
        matchAccuracy = !log.isAccurate;
      }

      return matchSearch && matchModel && matchAccuracy;
    });
  }, [logs, searchTerm, modelFilter, accuracyFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const accurate = logs.filter((l) => l.isAccurate).length;
    const avgConfidence = (
      logs.reduce((sum, l) => sum + l.confidence, 0) / Math.max(total, 1)
    ).toFixed(2);
    const avgProcessingTime = Math.round(
      logs.reduce((sum, l) => sum + l.processingTime, 0) / Math.max(total, 1)
    );

    return {
      total,
      accurate,
      accuracy: ((accurate / total) * 100).toFixed(1),
      avgConfidence,
      avgProcessingTime,
      uniqueModels: new Set(logs.map((l) => l.modelVersion)).size,
    };
  }, [logs]);

  const modelVersions = Array.from(new Set(logs.map((l) => l.modelVersion)));

  const downloadReport = () => {
    const csv = [
      ["ID", "Submission", "User", "Model", "Prediction", "Confidence", "Accurate", "Time (ms)"].join(","),
      ...logs.map((l) =>
        [
          l.id,
          l.submissionId,
          l.userName,
          l.modelVersion,
          `"${l.prediction}"`,
          l.confidence,
          l.isAccurate ? "Yes" : "No",
          l.processingTime,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <main className="relative">
      <div className={`p-8 transition ${selectedLog ? "pointer-events-none opacity-40" : ""}`}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Model Logs</h1>
              <p className="text-sm text-gray-600 mt-1">Track AI predictions and model performance</p>
            </div>
          </div>
          <Button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-green-600 px-4 py-2 hover:bg-green-700"
          >
            <Download size={18} /> Export Report
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Total Logs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Accuracy</p>
            <p className="text-2xl font-bold text-green-600">{stats.accuracy}%</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Avg Confidence</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgConfidence}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Avg Time (ms)</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgProcessingTime}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Models</p>
            <p className="text-2xl font-bold text-gray-900">{stats.uniqueModels}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search user or prediction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Models</option>
            {modelVersions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={accuracyFilter}
            onChange={(e) => setAccuracyFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Results</option>
            <option value="accurate">Accurate</option>
            <option value="inaccurate">Inaccurate</option>
          </select>

          {(searchTerm || modelFilter || accuracyFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setModelFilter("");
                setAccuracyFilter("");
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Model</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prediction</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Confidence</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Accurate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={log.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{log.userName}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                      {log.modelVersion}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{log.prediction}</td>
                  <td className="px-6 py-3 text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${log.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span>{(log.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        log.isAccurate ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.isAccurate ? "✓ Yes" : "✗ No"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{log.processingTime}ms</td>
                  <td className="px-6 py-3 text-sm">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No AI logs found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <Modal onClose={() => setSelectedLog(null)}>
          <h2 className="text-xl font-bold mb-6">AI Prediction Details</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Submission ID</p>
                <p className="text-lg font-bold text-gray-900">{selectedLog.submissionId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">User</p>
                <p className="text-lg font-bold text-gray-900">{selectedLog.userName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Model Version</p>
                <p className="text-lg font-bold text-gray-900">{selectedLog.modelVersion}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Input Type</p>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                  {selectedLog.inputType}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Prediction</p>
              <p className="text-base text-gray-900 bg-gray-50 p-3 rounded">{selectedLog.prediction}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Confidence</p>
                <p className="text-2xl font-bold text-blue-600">{(selectedLog.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">{selectedLog.processingTime}ms</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Accurate</p>
                <p className={`text-2xl font-bold ${selectedLog.isAccurate ? "text-green-600" : "text-red-600"}`}>
                  {selectedLog.isAccurate ? "✓ Yes" : "✗ No"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Created</p>
              <p className="text-sm text-gray-600">{new Date(selectedLog.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
}
