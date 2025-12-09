import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserInfoAPI, BodyMetricHistoryDTO } from "../../../api/userInfo.api";
import { Button } from "../../../components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const BodyProgressPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<BodyMetricHistoryDTO[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Lấy tất cả body metrics (30 ngày gần nhất)
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);
        const toDate = new Date();

        const response = await UserInfoAPI.getBodyMetricsByDateRange(
          fromDate.toISOString(),
          toDate.toISOString()
        );

        if (response.data && Array.isArray(response.data)) {
          setMetrics(response.data);
        }
      } catch (err) {
        console.error("Failed to load body metrics", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Format data for charts
  const chartData = metrics.map((metric) => ({
    date: metric.recordedAt
      ? new Date(metric.recordedAt).toLocaleDateString("vi-VN", {
          month: "short",
          day: "numeric",
        })
      : "",
    weight: metric.weightKg || 0,
    bodyFat: metric.bodyFatPct || 0,
    bmi: metric.bmi || 0,
  }));

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Body Progress</h1>
                <p className="text-gray-600">Theo dõi tiến độ cơ thể của bạn</p>
              </div>
            </div>
          </div>
        </motion.div>

        {metrics.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              Chưa có dữ liệu body metric
            </p>
            <Button onClick={() => navigate("/profile/body-record")}>
              Thêm body metric đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Weight Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Weight Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    name="Weight (kg)"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Body Fat Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Body Fat Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: "Body Fat (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bodyFat"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Body Fat (%)"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* BMI Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">BMI Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: "BMI", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bmi"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="BMI"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};





