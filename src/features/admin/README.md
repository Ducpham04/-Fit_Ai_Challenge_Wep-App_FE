# Admin Control Center

Phiên bản này đã hoàn thiện toàn bộ các trang dành cho admin dựa trên mock data, đồng thời bổ sung `AdminDataContext` để chia sẻ state giữa mọi module. Khi sẵn sàng kết nối API thật, chỉ cần thay thế các hàm CRUD trong context.

## 📂 Cấu trúc thư mục (rút gọn)

```
src/features/admin/
├── AdminDashboard.tsx          # Router nội bộ + Provider
├── context/
│   └── AdminDataContext.tsx    # useAdminData(), mock CRUD
├── data/
│   ├── admin.mock.ts           # challenges, rewards, plans, foods...
│   └── user.mock.ts
├── layouts/
│   └── AdminLayout.tsx         # Sidebar + responsive shell
├── pages/                      # Mỗi page 1 domain
│   ├── DashboardPage.tsx
│   ├── UserPage.tsx
│   ├── TransactionsPage.tsx
│   ├── ChallengesPage.tsx
│   ├── RewardsPage.tsx
│   ├── TrainingPlansPage.tsx
│   ├── MealsPage.tsx
│   └── FoodsPage.tsx
├── components/
│   └── UserTable.tsx           # Data table tái sử dụng
├── types/
│   ├── admin-entities.ts       # DTO cho mọi domain
│   └── user.dto.ts
└── README.md                   # (file hiện tại)
```

## 🧠 Kiến trúc dữ liệu

- `AdminDataProvider` khởi tạo state từ mock và cung cấp 20+ hàm CRUD (createUser, updateChallenge, addReward, …).
- `useAdminData()` trả về toàn bộ state + actions, vì vậy mọi page chỉ tập trung vào UI/form logic.
- ID mới được tạo bằng helper `getNextId`, việc chuyển sang API thật chỉ cần thay thân hàm CRUD bằng call `fetch/axios`.

## 🚀 Các trang đã hoàn thiện

| Trang | Tính năng chính |
| --- | --- |
| `DashboardPage` | KPI cards, recent transactions, new users, challenge progress, hoạt động gần nhất |
| `UserPage` | Full CRUD (mock), lọc, sort, search, pagination, modal create/edit/delete |
| `TransactionsPage` | Bảng giao dịch với lọc theo type/status, modal tạo/sửa, export placeholder, thống kê tổng |
| `ChallengesPage` | Stats card, table với filter đa tiêu chí, modal create/edit, xác nhận delete |
| `RewardsPage` | Grid card hiển thị claim progress, modal create/edit, thống kê claim rate |
| `TrainingPlansPage` | Filter multi-select, bảng chi tiết, modal CRUD cho pricing/difficulty/focus area |
| `MealsPage` & `FoodsPage` | Quản lý thực đơn + nguyên liệu với macro stats và modal CRUD |

Mọi trang đều dùng chung UI kit tại `src/components_1/ui/*` (Button, SimpleModal, SimpleSelect, FormField, Textarea, Table…).

## 🧩 Luồng sử dụng

```tsx
import { AdminDashboard } from "@/features/admin/AdminDashboard";

// Trong router (đã cấu hình sẵn ở src/router/index.tsx):
<Route path="admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
```

`AdminDashboard` tự động bọc `AdminDataProvider` + `AdminLayout` và render page theo state `currentPage`.

## 🔄 Kết nối API thật

1. Tạo service (ví dụ `src/features/admin/api/users.ts`) và map DTO theo `types/admin-entities.ts`.
2. Trong `AdminDataContext.tsx`, thay `addUser` bằng `await userService.create(payload)` rồi cập nhật state từ response.
3. (Tùy chọn) Kết hợp TanStack Query để cache và invalidate dữ liệu. Với kiến trúc hiện tại, chỉ cần wrap `useMutation` quanh các hàm context.

## ✅ Checklist dev nhanh

- [x] `npm run dev` → truy cập `/#/admin`
- [x] Thử tạo user/challenge/reward mới (mock) → dữ liệu được context sync tới dashboard.
- [x] `npm run build` để chắc chắn Vite bundle thành công.

## 📌 Ghi chú

- Tất cả dữ liệu là mock và reset sau mỗi lần refresh.
- Chưa có phân quyền sâu hơn `ProtectedRoute`. Khi tích hợp API, hãy kiểm tra `user.role === "Admin"` trước khi render `AdminDashboard`.
- Chunk build > 500 kB: cân nhắc cấu hình `vite.config.ts` (manualChunks) nếu deploy production.

> Cần thêm hướng dẫn cho QA hoặc product? Cập nhật tại `docs/PROJECT_DOCUMENTATION.md` để đồng bộ kiến trúc tổng.
