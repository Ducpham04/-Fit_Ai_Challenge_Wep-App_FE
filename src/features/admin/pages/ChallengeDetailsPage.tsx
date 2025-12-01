import { useState, useMemo } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { ArrowLeft, Play, Loader, TrendingUp, Clock, AlertCircle, BarChart3, Filter } from "lucide-react";
import { AdminChallenge } from "../types/admin-entities";

interface UserSubmission {
  id: number;
  userId: number;
  username: string;
  submissionDate: string;
  videoUrl: string;
  aiScore: number;
  reps: number;
  form: "good" | "average" | "poor";
  duration: number;
}

interface AILogEntry {
  id: number;
  submissionId: number;
  step: string;
  duration: number; // milliseconds
  confidence: number;
  status: "processing" | "completed" | "failed";
}

interface ChallengeDetailsPageProps {
  challenge: AdminChallenge;
  onBack: () => void;
}

const TAB_IDS = ["info", "submissions", "ai-logs"] as const;
type TabId = (typeof TAB_IDS)[number];

// Mock data
const MOCK_SUBMISSIONS: UserSubmission[] = [
  {
    id: 1,
    userId: 101,
    username: "nguyen.van.a",
    submissionDate: "2024-01-15",
    videoUrl: "https://example.com/video1.mp4",
    aiScore: 92,
    reps: 25,
    form: "good",
    duration: 45,
  },
  {
    id: 2,
    userId: 102,
    username: "tran.thi.b",
    submissionDate: "2024-01-14",
    videoUrl: "https://example.com/video2.mp4",
    aiScore: 88,
    reps: 22,
    form: "good",
    duration: 42,
  },
  {
    id: 3,
    userId: 103,
    username: "pham.van.c",
    submissionDate: "2024-01-13",
    videoUrl: "https://example.com/video3.mp4",
    aiScore: 75,
    reps: 18,
    form: "average",
    duration: 38,
  },
  {
    id: 4,
    userId: 104,
    username: "hoang.thi.d",
    submissionDate: "2024-01-12",
    videoUrl: "https://example.com/video4.mp4",
    aiScore: 65,
    reps: 14,
    form: "poor",
    duration: 35,
  },
];

const MOCK_AI_LOGS: AILogEntry[] = [
  {
    id: 1,
    submissionId: 1,
    step: "Video Upload & Validation",
    duration: 2500,
    confidence: 100,
    status: "completed",
  },
  {
    id: 2,
    submissionId: 1,
    step: "Pose Detection",
    duration: 3200,
    confidence: 98,
    status: "completed",
  },
  {
    id: 3,
    submissionId: 1,
    step: "Rep Counting",
    duration: 1800,
    confidence: 92,
    status: "completed",
  },
  {
    id: 4,
    submissionId: 1,
    step: "Form Analysis",
    duration: 2100,
    confidence: 92,
    status: "completed",
  },
  {
    id: 5,
    submissionId: 1,
    step: "Score Generation",
    duration: 800,
    confidence: 92,
    status: "completed",
  },
];

const baseURL = "http://localhost:8080/";

export function ChallengeDetailsPage({ challenge, onBack }: ChallengeDetailsPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<UserSubmission | null>(null);

  const stats = useMemo(() => {
    return {
      totalSubmissions: MOCK_SUBMISSIONS.length,
      averageScore: Math.round(
        (MOCK_SUBMISSIONS.reduce((sum, s) => sum + s.aiScore, 0) / Math.max(MOCK_SUBMISSIONS.length, 1)) * 10
      ) / 10,
      highestScore: Math.max(...MOCK_SUBMISSIONS.map((s) => s.aiScore), 0),
      lowestScore: Math.min(...MOCK_SUBMISSIONS.map((s) => s.aiScore), 0),
      averageReps: Math.round(
        (MOCK_SUBMISSIONS.reduce((sum, s) => sum + s.reps, 0) / Math.max(MOCK_SUBMISSIONS.length, 1)) * 10
      ) / 10,
      goodForm: MOCK_SUBMISSIONS.filter((s) => s.form === "good").length,
    };
  }, []);

  const filteredSubmissions = useMemo(() => {
    return MOCK_SUBMISSIONS.filter((submission) => {
      const matchDate = !dateFilter || submission.submissionDate >= dateFilter;
      const matchScore =
        scoreFilter === "all" ||
        (scoreFilter === "high" && submission.aiScore >= 80) ||
        (scoreFilter === "medium" && submission.aiScore >= 60 && submission.aiScore < 80) ||
        (scoreFilter === "low" && submission.aiScore < 60);
      return matchDate && matchScore;
    });
  }, [dateFilter, scoreFilter]);

  const aiLogsForSubmission = useMemo(() => {
    if (!selectedSubmission) return [];
    return MOCK_AI_LOGS.filter((log) => log.submissionId === selectedSubmission.id);
  }, [selectedSubmission]);

  const totalProcessingTime = useMemo(() => {
    return aiLogsForSubmission.reduce((sum, log) => sum + log.duration, 0);
  }, [aiLogsForSubmission]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
          <p className="text-gray-600">{challenge.description}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Submissions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSubmissions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Avg Score</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.averageScore}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Highest Score</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.highestScore}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Good Form</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.goodForm}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: "info" as TabId, label: "Challenge Info", icon: "ℹ️" },
            { id: "submissions" as TabId, label: "User Submissions", icon: "📹" },
            { id: "ai-logs" as TabId, label: "AI Logs", icon: "🤖" },
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

      {/* Tab Content */}
      <div>
        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Challenge Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Title</p>
                    <p className="font-semibold text-gray-900 mt-1">{challenge.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Description</p>
                    <p className="text-gray-900 mt-1">{challenge.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Difficulty</p>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium mt-1 capitalize">
                      {challenge.difficult || "beginner"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium mt-1 capitalize ${
                        challenge.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {challenge.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sample Video</h3>
                {challenge.linkVideos ? (
                  <video
                    controls
                    className="w-full rounded-lg bg-black"
                    src={challenge.linkVideos}
                    style={{ maxHeight: "300px" }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">No sample video available</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">Average Reps</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{stats.averageReps}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">Score Range</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {stats.lowestScore} - {stats.highestScore}%
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">Submit Rate</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{stats.totalSubmissions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Submissions Tab */}
        {activeTab === "submissions" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter size={20} />
                Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Score Range</label>
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Scores</option>
                    <option value="high">High (80-100%)</option>
                    <option value="medium">Medium (60-79%)</option>
                    <option value="low">Low (0-59%)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Submissions ({filteredSubmissions.length})</h3>
              <div className="space-y-3 overflow-y-auto max-h-96">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{submission.username}</h4>
                        <p className="text-xs text-gray-600">{new Date(submission.submissionDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${submission.aiScore >= 80 ? "text-green-600" : submission.aiScore >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                          {submission.aiScore}%
                        </p>
                        <p className="text-xs text-gray-600">{submission.reps} reps</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          submission.form === "good"
                            ? "bg-green-100 text-green-800"
                            : submission.form === "average"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {submission.form} form
                      </span>
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock size={14} /> {submission.duration}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedSubmission && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Selected Submission Details</h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">User</p>
                      <p className="font-semibold text-gray-900">{selectedSubmission.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">AI Score</p>
                      <p className="font-bold text-lg text-blue-600">{selectedSubmission.aiScore}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reps Counted</p>
                      <p className="font-bold text-lg text-purple-600">{selectedSubmission.reps}</p>
                    </div>
                  </div>
                  <Button onClick={() => setSelectedSubmission(null)} className="bg-gray-500">
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Logs Tab */}
        {activeTab === "ai-logs" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Processing Pipeline</h3>
              {selectedSubmission ? (
                <>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Processing for submission by:</p>
                    <p className="font-bold text-gray-900">{selectedSubmission.username}</p>
                  </div>

                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Total Time</p>
                        <p className="text-2xl font-bold text-blue-600">{(totalProcessingTime / 1000).toFixed(2)}s</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Steps</p>
                        <p className="text-2xl font-bold text-blue-600">{aiLogsForSubmission.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Avg Confidence</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {(aiLogsForSubmission.reduce((sum, log) => sum + log.confidence, 0) / Math.max(aiLogsForSubmission.length, 1)).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Status</p>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {aiLogsForSubmission.map((log, idx) => (
                      <div key={log.id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            {log.step}
                          </h4>
                          <span className="text-xs font-medium text-gray-600">{(log.duration / 1000).toFixed(2)}s</span>
                        </div>
                        <div className="ml-8">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${log.confidence}%` }} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 min-w-fit">{log.confidence}%</span>
                          </div>
                          <p className="text-xs text-gray-600">Confidence Level</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <AlertCircle size={32} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Select a submission from the "User Submissions" tab to view AI logs</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
