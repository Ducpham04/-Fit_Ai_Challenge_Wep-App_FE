# API Fixes Summary - FE Alignment with BE

## Tổng quan
Đã kiểm tra và điều chỉnh tất cả các API calls trong FE để phù hợp với các endpoints thực tế trong BE.

## Các thay đổi chính

### 1. ✅ challenge.api.ts - ĐÃ TẠO MỚI
**Trước:** File rỗng
**Sau:** Đã tạo đầy đủ API calls:
- `GET /challenges` - Lấy danh sách challenges với pagination và filters
- `GET /challenges/{id}` - Lấy chi tiết challenge với participants list
- `POST /challenges/{id}/join` - Join challenge

**Mapping với BE:**
- ✅ `GET /api/challenges` - ChallengeController
- ✅ `GET /api/challenges/{id}` - ChallengeController
- ✅ `POST /api/challenges/{id}/join` - ChallengeController

### 2. ✅ training.api.ts - ĐÃ CẬP NHẬT
**Thay đổi:**
- Cập nhật `getTrainingPlans()` để match với BE response format (Page format)
- Đổi `subscribeToPlan()` thành `startTrainingPlan()` với format đúng (userId, startDate)
- Loại bỏ các endpoints chưa có trong BE (getTodayWorkout, completeExercise, pausePlan, etc.)

**Mapping với BE:**
- ✅ `GET /api/training-plans` - TrainingPlanController
- ✅ `GET /api/training-plans/{id}` - TrainingPlanController
- ✅ `POST /api/training-plans/{id}/start` - TrainingPlanController

### 3. ✅ rewards.api.ts - ĐÃ CẬP NHẬT
**Thay đổi:**
- Đổi endpoint từ `/rewards` thành `/admin/rewards`
- Cập nhật response format để match với NotificationResponse của BE
- Đổi `claimReward()` để sử dụng `/reward-redemptions` endpoint
- Cập nhật field names: `points` → `costPoints`, `total` → `stock`

**Mapping với BE:**
- ✅ `GET /api/admin/rewards` - RewardController
- ✅ `GET /api/admin/rewards/{id}` - RewardController
- ✅ `POST /api/reward-redemptions` - RewardRedemptionController

### 4. ✅ goals.api.ts - ĐÃ CẬP NHẬT
**Thay đổi:**
- Tất cả endpoints đổi từ `/goals` thành `/admin/goals`
- Thêm TODO comments cho các endpoints có thể chưa implement đầy đủ

**Mapping với BE:**
- ✅ `GET /api/admin/goals` - GoalsController
- ✅ `POST /api/admin/goals` - GoalsController (multipart/form-data)
- ✅ `GET /api/admin/goals/{id}` - GoalsController
- ✅ `PUT /api/admin/goals/{id}` - GoalsController (multipart/form-data)
- ✅ `DELETE /api/admin/goals/{id}` - GoalsController

### 5. ✅ nutrition.api.ts - ĐÃ CẬP NHẬT
**Thay đổi:**
- Cập nhật response format để match với NotificationResponse
- Thay thế các endpoints không tồn tại bằng endpoints thực tế:
  - `subscribeToPlan()` → `createUserNutrition()` sử dụng `/user-nutrition`
  - `getMyNutritionPlans()` → `getAllUserNutrition()` sử dụng `/user-nutrition`
- Thêm `getPlansByGoal()` endpoint

**Mapping với BE:**
- ✅ `GET /api/nutrition-plans` - NutritionPlanController
- ✅ `GET /api/nutrition-plans/{id}` - NutritionPlanController
- ✅ `GET /api/nutrition-plans/goal/{goalId}` - NutritionPlanController
- ✅ `POST /api/user-nutrition` - UserNutritionController
- ✅ `GET /api/user-nutrition` - UserNutritionController
- ✅ `GET /api/user-nutrition/{id}` - UserNutritionController
- ✅ `PUT /api/user-nutrition/{id}` - UserNutritionController
- ✅ `DELETE /api/user-nutrition/{id}` - UserNutritionController

### 6. ✅ dashboard.api.ts - ĐÃ THÊM GHI CHÚ
**Thay đổi:**
- Thêm comments gợi ý sử dụng User Profile endpoints thay thế
- Các endpoints vẫn giữ nguyên nhưng có warning về việc có thể chưa implement

**Gợi ý:**
- Sử dụng `GET /api/v1/users/{userId}/profile/full` để lấy dashboard data

### 7. ✅ leaderboard.api.ts - ĐÃ THÊM GHI CHÚ
**Thay đổi:**
- Thêm comments về việc endpoints có thể chưa implement
- Giữ nguyên structure cho tương lai

### 8. ✅ workout.api.ts - ĐÃ THÊM GHI CHÚ
**Thay đổi:**
- Thêm comments gợi ý sử dụng User Training endpoints
- Gợi ý: Sử dụng `/api/user/training` endpoints

### 9. ✅ community.api.ts - ĐÃ TẠO MỚI
**Trước:** File rỗng
**Sau:** Tạo structure cơ bản với error handling cho các endpoints chưa implement

### 10. ✅ auth.api.ts - KHÔNG CẦN THAY ĐỔI
**Status:** Đã đúng format từ trước
- ✅ `POST /auth/login` → `POST /api/auth/login`
- ✅ `POST /auth/register` → `POST /api/auth/register`
- ✅ `GET /auth/user` → `GET /api/auth/user`
- ✅ `GET /auth/me` → `GET /api/auth/me`

## Lưu ý quan trọng

### Base URL Configuration
- Client baseURL: `http://localhost:8080/api`
- Tất cả API calls KHÔNG cần prefix `/api` vì đã có trong baseURL
- Ví dụ: `client.get("/challenges")` → `http://localhost:8080/api/challenges` ✅

### Response Format
- Hầu hết BE endpoints trả về `NotificationResponse` format:
  ```typescript
  {
    success: boolean;
    message: string;
    data?: any;
  }
  ```
- Một số endpoints trả về Page format (Spring Data):
  ```typescript
  {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }
  ```

### Endpoints chưa implement trong BE
Các endpoints sau có thể chưa có trong BE, đã thêm TODO comments:
- Dashboard endpoints (sử dụng User Profile thay thế)
- Leaderboard endpoints
- Một số Workout endpoints (sử dụng User Training thay thế)
- Community endpoints
- Một số Goals endpoints (statistics, reminders)

## Kiểm tra

### Đã kiểm tra:
- ✅ Không có linter errors
- ✅ Tất cả imports đúng
- ✅ Type definitions phù hợp
- ✅ Endpoint paths đúng format

### Cần test:
- [ ] Test authentication flow
- [ ] Test challenge APIs
- [ ] Test training plan APIs
- [ ] Test rewards APIs
- [ ] Test goals APIs
- [ ] Test nutrition APIs
- [ ] Test user profile APIs

## Next Steps

1. **Test tất cả API calls** với BE đang chạy
2. **Cập nhật components** sử dụng các API này nếu response format thay đổi
3. **Implement error handling** phù hợp với NotificationResponse format
4. **Thêm loading states** cho các API calls
5. **Xử lý pagination** cho các endpoints trả về Page format

## Files đã thay đổi

1. `src/api/challenge.api.ts` - Tạo mới
2. `src/api/training.api.ts` - Cập nhật
3. `src/api/rewards.api.ts` - Cập nhật
4. `src/api/goals.api.ts` - Cập nhật
5. `src/api/nutrition.api.ts` - Cập nhật
6. `src/api/dashboard.api.ts` - Thêm comments
7. `src/api/leaderboard.api.ts` - Thêm comments
8. `src/api/workout.api.ts` - Thêm comments
9. `src/api/community.api.ts` - Tạo mới

## Environment Variables

Đảm bảo có file `.env` với:
```
VITE_API_URL=http://localhost:8080/api
```

Hoặc BE sẽ chạy mặc định tại `http://localhost:8080/api`








