# 🎯 Onboarding Implementation Guide

## Tổng quan

Đã tạo workflow onboarding hoàn chỉnh cho user mới với các tính năng:
1. **Body Info Page** - Nhập thông tin cơ thể
2. **Recommended Plan Page** - Hiển thị lộ trình được đề xuất
3. **Onboarding Guard** - Tự động redirect user mới

## 📁 Cấu trúc Files

```
src/
├── api/
│   └── infoBody.api.ts          # API service cho body information
├── features/
│   └── onboarding/
│       ├── pages/
│       │   ├── BodyInfoPage.tsx           # Trang nhập thông tin cơ thể
│       │   └── RecommendedPlanPage.tsx    # Trang đề xuất lộ trình
│       ├── components/
│       │   └── OnboardingGuard.tsx        # Component check onboarding status
│       └── index.ts                       # Export file
└── router/
    └── index.tsx                          # Routes đã được thêm
```

## 🔄 Workflow

### 1. User đăng nhập lần đầu

```
Login → Check Body Info → Nếu chưa có → Redirect to /onboarding/body-info
```

### 2. Body Info Page (3 bước)

**Step 1: Basic Info**
- Gender (Male/Female/Other)
- Age (10-100)

**Step 2: Body Measurements**
- Height (cm)
- Weight (kg)
- Auto-calculate BMI preview

**Step 3: Fitness Goals**
- Select goal từ danh sách goals
- Workout frequency (2-7 days/week)

### 3. Submit & Analysis

- Tính BMI và Body Type
- Lưu vào BE: `POST /api/admin/information-body`
- Navigate to Recommended Plan Page với analysis results

### 4. Recommended Plan Page

- Hiển thị analysis summary (BMI, Body Type, Frequency)
- Load training plans filtered by goal
- Filter by difficulty dựa trên body type
- User chọn plan và click "Start Training Now"
- Start plan: `POST /api/training-plans/{id}/start`
- Navigate to My Challenge page

## 🔌 API Integration

### InfoBody API

```typescript
// Get body info by user ID
InfoBodyAPI.getByUserId(userId)

// Create body info
InfoBodyAPI.create({
  userId, heightCm, weightKg, age, gender, bmi, goalId
})

// Get all goals
InfoBodyAPI.getGoals()

// Calculate BMI
InfoBodyAPI.calculateBMI(heightCm, weightKg)
```

### Training Plan API

```typescript
// Get training plans
TrainingAPI.getTrainingPlans({ goalId, difficulty, page, limit })

// Start training plan
TrainingAPI.startTrainingPlan(planId, userId, startDate)
```

## 🎨 UI/UX Improvements

### My Challenge Page
- ✅ Improved header với avatar và status indicator
- ✅ Enhanced stats cards với icons và colors
- ✅ Better spacing và layout
- ✅ Gradient backgrounds

### Challenge Cards
- ✅ Better hover effects
- ✅ Improved button styling với gradients
- ✅ Clearer status indicators
- ✅ Better spacing

### Modal
- ✅ Fixed position (center screen)
- ✅ Backdrop với click-to-close
- ✅ Better z-index management
- ✅ Smooth animations

### Training Plan Detail Page
- ✅ Improved layout với grid
- ✅ Better day tabs
- ✅ Enhanced challenge cards display

## 🚀 Cách sử dụng

### 1. Enable Onboarding Guard (Optional)

Wrap protected routes với OnboardingGuard:

```tsx
import { OnboardingGuard } from '@/features/onboarding';

<OnboardingGuard>
  <MyChallengePage />
</OnboardingGuard>
```

### 2. Manual Redirect

Nếu muốn redirect thủ công sau login:

```tsx
import { InfoBodyAPI } from '@/api/infoBody.api';

// Check after login
const bodyInfo = await InfoBodyAPI.getByUserId(userId);
if (!bodyInfo.data || bodyInfo.data.length === 0) {
  navigate('/onboarding/body-info');
}
```

### 3. Routes

Routes đã được thêm:
- `/onboarding/body-info` - Body info form
- `/onboarding/recommended` - Recommended plans

## 📝 Notes

1. **BMI Calculation**: Tự động tính từ height và weight
2. **Body Type**: Dựa trên BMI (Underweight/Normal/Overweight/Obese)
3. **Goal Selection**: Load từ `/api/admin/goals`
4. **Training Plan Filtering**: 
   - Filter by goalId
   - Filter by difficulty (dựa trên body type và frequency)
5. **Data Flow**: Body Info → Analysis → Recommended Plans → Start Plan → My Challenge

## 🔧 Environment Variables

Không cần thêm env variables, tất cả sử dụng existing API endpoints.

## ✅ Testing Checklist

- [ ] Test body info form validation
- [ ] Test BMI calculation
- [ ] Test goal selection
- [ ] Test API calls (create body info)
- [ ] Test recommended plans loading
- [ ] Test plan selection và start
- [ ] Test navigation flow
- [ ] Test OnboardingGuard redirect
- [ ] Test với user đã có body info (should skip onboarding)



