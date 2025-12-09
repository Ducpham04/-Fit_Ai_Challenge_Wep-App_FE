import client from "./client";

export interface UserInfoDTO {
  infoId?: number;
  userId: number;
  userName?: string;
  email?: string;
  avatar?: string;
  heightCm?: number;
  weightKg?: number;
  age?: number;
  gender?: string;
  activityLevel?: string; // sedentary, lightly active, moderately active, very active, extra active
  bodyFatPct?: number;
  bmi?: number;
  bmr?: number;
  recommendedCalories?: number;
  goalId?: number;
  goalName?: string;
  createdAt?: string;
}

export interface BodyMetricHistoryDTO {
  bmhId?: number;
  userId?: number;
  weightKg: number;
  heightCm?: number;
  bmi?: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  waterPct?: number;
  notes?: string;
  recordedAt?: string;
  createdAt?: string;
}

export interface BodyMetricHistoryResponse {
  success: boolean;
  message: string;
  data?: BodyMetricHistoryDTO | BodyMetricHistoryDTO[];
}

export interface UserInfoResponse {
  success: boolean;
  message: string;
  data?: UserInfoDTO;
}

export const UserInfoAPI = {
  /**
   * GET /api/user/info
   * Lấy thông tin user (body info) của user hiện tại
   */
  getUserInfo(): Promise<UserInfoResponse> {
    return client.get("/user/info");
  },

  /**
   * PUT /api/user/info
   * Cập nhật thông tin body của user
   */
  updateUserInfo(data: Partial<UserInfoDTO>): Promise<UserInfoResponse> {
    return client.put("/user/info", data);
  },

  /**
   * POST /api/user/body-metric
   * Thêm lịch sử body metric
   */
  createBodyMetric(data: BodyMetricHistoryDTO): Promise<BodyMetricHistoryResponse> {
    return client.post("/user/body-metric", data);
  },

  /**
   * GET /api/user/body-metric?from=2024-01-01&to=2024-02-01
   * Lấy lịch sử body metric trong khoảng thời gian
   */
  getBodyMetricsByDateRange(
    from?: string,
    to?: string
  ): Promise<BodyMetricHistoryResponse> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return client.get("/user/body-metric", { params });
  },

  /**
   * GET /api/user/body-metric/latest
   * Lấy bản ghi mới nhất
   */
  getLatestBodyMetric(): Promise<BodyMetricHistoryResponse> {
    return client.get("/user/body-metric/latest");
  },
};





