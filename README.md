# 🧱 Fitness AI Challenge — Frontend Architecture Guide

> **Cấu trúc thư mục & mô tả chi tiết** cho dự án React + TypeScript + Vite  
> Dự án gồm 3 tầng chính: **UI**, **Logic**, và **Data**, được tổ chức theo mô hình **feature-based modular architecture**.

---

## 🗂️ Tổng quan cấu trúc thư mục
    fitness-ai-challenge/
├── public/
├── src/
├── tests/
├── .github/
├── .husky/
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md


---

## 🌍 `public/` — Tài nguyên tĩnh (Static Assets)

| File / Folder | Mô tả |
|----------------|--------|
| `index.html` | File HTML gốc được Vite inject code JS vào. |
| `favicon.ico` | Icon hiển thị trên tab trình duyệt. |
| `assets/images/` | Lưu hình ảnh tĩnh (logo, banner, background). |

---

## ⚙️ `src/` — Thư mục chính của ứng dụng

### 📡 `src/api/` — Giao tiếp với Backend API

| File / Folder | Chức năng |
|----------------|------------|
| `client.ts` | Cấu hình Axios client (baseURL, interceptors, token, error handling). |
| `endpoints.ts` | Danh sách endpoint API (centralized constant). |
| `services/` | Nhóm các API service theo tính năng: |
| ├── `auth.service.ts` → Login, register, refresh token, logout. |
| ├── `challenge.service.ts` → CRUD challenge, lấy danh sách thử thách. |
| ├── `workout.service.ts` → Quản lý bài tập, theo dõi tiến độ. |
| └── `ai.service.ts` → Gọi AI API (gợi ý, phản hồi huấn luyện viên ảo). |

---

### 🎨 `src/assets/` — Tài nguyên giao diện (Assets)

| Folder | Chức năng |
|---------|------------|
| `icons/` | SVG hoặc icon giao diện. |
| `images/` | Hình ảnh minh họa trong component. |
| `styles/` | CSS toàn cục, hoặc Tailwind. |
| ├── `globals.css` → Style gốc (reset, font, body). |
| └── `tailwind.css` → Cấu hình Tailwind (nếu dùng). |

---

### 🧩 `src/components/` — Thành phần giao diện (UI Components)

#### 🔹 `common/` — Component tái sử dụng
Ví dụ: Button, Input, Modal, Card, Spinner...

| Component | Chức năng |
|------------|------------|
| `Button/` | Nút bấm tái sử dụng. |
| `Input/` | Ô nhập liệu có validation. |
| `Card/` | Hiển thị nội dung hoặc dữ liệu. |
| `Modal/` | Popup xác nhận, form,... |
| `Spinner/` | Hiển thị trạng thái loading. |

#### 🔹 `layout/` — Khung giao diện tổng thể
| Component | Chức năng |
|------------|------------|
| `Header/`, `Footer/` | Thanh điều hướng trên/dưới. |
| `Sidebar/` | Menu chức năng. |
| `Navigation/` | Breadcrumb hoặc tab route. |

#### 🔹 `features/` — Thành phần theo tính năng
| Folder | Mô tả |
|---------|--------|
| `auth/` | Đăng nhập, đăng ký, quên mật khẩu. |
| `challenge/` | Quản lý và hiển thị thử thách. |
| `workout/` | Theo dõi bài tập và tiến độ. |
| `ai/` | Chat với huấn luyện viên ảo, gợi ý bài tập. |

---

### 🪝 `src/hooks/` — Custom React Hooks

| File | Chức năng |
|------|------------|
| `useAuth.ts` | Quản lý xác thực người dùng. |
| `useChallenge.ts` | Lấy dữ liệu thử thách. |
| `useWorkout.ts` | Quản lý bài tập hiện tại. |
| `useAI.ts` | Giao tiếp với AI API. |
| `useLocalStorage.ts` | Lưu & lấy dữ liệu từ localStorage. |

---

### 🧠 `src/context/` — React Context toàn cục

| File | Chức năng |
|------|------------|
| `AuthContext.tsx` | Quản lý user & trạng thái đăng nhập. |
| `ThemeContext.tsx` | Chuyển đổi theme (dark/light). |
| `ChallengeContext.tsx` | Chia sẻ trạng thái thử thách giữa các component. |
| `index.ts` | Export chung. |

---

### 🗺️ `src/pages/` — Các trang chính của ứng dụng

| Folder | File | Chức năng |
|---------|------|------------|
| `Home/` | `Home.tsx` | Trang chủ. |
| `Dashboard/` | `Dashboard.tsx` | Trang tổng quan sau khi đăng nhập. |
| `Challenges/` | `ChallengesPage.tsx`, `ChallengeDetailPage.tsx` | Danh sách & chi tiết thử thách. |
| `Workouts/` | `WorkoutsPage.tsx` | Quản lý & theo dõi bài tập. |
| `Profile/` | `ProfilePage.tsx` | Hồ sơ người dùng. |
| `Auth/` | `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx` | Xác thực tài khoản. |
| `NotFound/` | `NotFound.tsx` | Trang 404. |

---

### 🚦 `src/routes/` — Cấu hình định tuyến (Routing)

| File | Chức năng |
|------|------------|
| `routes.config.ts` | Danh sách route và quyền truy cập. |
| `PrivateRoute.tsx` | Chặn truy cập nếu chưa đăng nhập. |
| `index.tsx` | Setup React Router. |

---

### 🗃️ `src/store/` — State Management (Redux / Zustand)

| File / Folder | Chức năng |
|----------------|------------|
| `index.ts` | Tạo store chính. |
| `slices/` | Mỗi slice đại diện một phần trạng thái: |
| ├── `authSlice.ts` → Trạng thái xác thực. |
| ├── `challengeSlice.ts` → Dữ liệu thử thách. |
| └── `workoutSlice.ts` → Dữ liệu bài tập. |
| `middleware/logger.ts` | Log action khi debug. |

---

### 📄 `src/types/` — Kiểu dữ liệu TypeScript

| File | Mô tả |
|------|--------|
| `auth.types.ts` | Kiểu dữ liệu user, token, response. |
| `challenge.types.ts` | Kiểu dữ liệu thử thách. |
| `workout.types.ts` | Kiểu dữ liệu bài tập. |
| `ai.types.ts` | Kiểu dữ liệu phản hồi từ AI. |
| `user.types.ts` | Cấu trúc thông tin người dùng. |
| `index.ts` | Export chung. |

---

### 🧰 `src/utils/` — Hàm tiện ích (Helpers & Utils)

| File | Mô tả |
|------|--------|
| `validation.ts` | Validate dữ liệu form. |
| `formatters.ts` | Định dạng ngày, số, text. |
| `storage.ts` | Làm việc với localStorage / sessionStorage. |
| `constants.ts` | Biến cấu hình chung. |
| `helpers.ts` | Hàm hỗ trợ nhỏ (debounce, deepClone,...). |

---

### ⚙️ `src/config/` — Cấu hình ứng dụng

| File | Mô tả |
|------|--------|
| `env.ts` | Đọc và export biến môi trường `.env`. |
| `app.config.ts` | Cấu hình mặc định của ứng dụng (theme, timeout...). |

---

### 💅 `src/styles/` — Giao diện toàn cục

| File | Mô tả |
|------|--------|
| `theme.ts` | Cấu hình màu sắc, spacing, font cho theme. |
| `variables.css` | Biến CSS dùng toàn cục. |
| `mixins.css` | Định nghĩa các mixin tái sử dụng. |

---

### ⚛️ File chính trong `src/`

| File | Mô tả |
|------|--------|
| `App.tsx` | Component gốc chứa layout và router. |
| `App.test.tsx` | Kiểm thử App component. |
| `index.tsx` | Điểm khởi đầu React (render vào DOM). |
| `setupTests.ts` | Cấu hình môi trường test (Jest/RTL). |

---

## 🧪 `tests/` — Kiểm thử

| Folder | Chức năng |
|---------|------------|
| `unit/` | Kiểm thử từng hàm hoặc hook. |
| `integration/` | Kiểm thử luồng hoạt động giữa nhiều component. |
| `e2e/` | Kiểm thử hành trình người dùng (login → join challenge). |

---

## ⚙️ `.github/` — CI/CD Pipelines

| File | Mô tả |
|------|--------|
| `ci.yml` | Build, lint, test tự động khi push. |
| `deploy.yml` | Triển khai tự động (AWS, Vercel, Netlify...). |

---

## 🔒 `.husky/` — Git Hooks

| File | Mô tả |
|------|--------|
| `pre-commit` | Kiểm tra lint & format trước khi commit. |
| `pre-push` | Chạy test trước khi push lên remote. |

---

## ⚙️ File cấu hình gốc

| File | Mô tả |
|------|--------|
| `.env.example`, `.env.local` | Biến môi trường mẫu. |
| `.eslintrc.json`, `.prettierrc` | Quy tắc linting & format code. |
| `.gitignore` | Loại trừ file không cần push. |
| `tsconfig.json` | Cấu hình TypeScript. |
| `vite.config.ts` | Cấu hình Vite (alias, plugin, env). |
| `package.json` | Quản lý dependency và scripts. |
| `README.md` | Hướng dẫn tổng quan dự án. |

---

## 🧭 Tổng kết — Kiến trúc tổng thể

| Tầng | Vai trò | Thư mục chính |
|------|----------|----------------|
| **UI Layer** | Hiển thị & tương tác giao diện | `/components`, `/pages`, `/styles` |
| **Logic Layer** | Quản lý state, hooks, context | `/hooks`, `/context`, `/store`, `/utils` |
| **Data Layer** | Xử lý dữ liệu & API | `/api`, `/types`, `/config` |
| **Infra Layer** | Build, CI/CD, config, test | `.github`, `.husky`, `tests`, `vite.config.ts` |

---

> ✅ **Gợi ý:**  
> - Khi thêm tính năng mới → tạo folder mới trong `/features/`  
> - Khi thêm API → thêm file tương ứng trong `/services/` và `/types/`  
> - Khi mở rộng UI → tạo component trong `/common/` hoặc `/layout/`

---

✍️ **Tác giả:** *Team Fit-AI Challenge*  
📅 **Version:** 1.0  
🧩 **Stack:** React + TypeScript + Vite + Tailwind + Zustand/Redux
