# Admin Dashboard - User Management

## 📋 Cấu Trúc Thư Mục

```
src/features/admin/
├── AdminDashboard.tsx          # Entry point của admin panel
├── components/
│   ├── UserTable.tsx           # Component hiển thị table users
│   ├── UserFormCreate.tsx       # Modal form thêm user
│   ├── UserFormEdit.tsx         # Modal form chỉnh sửa user
│   └── DeleteConfirmDialog.tsx  # Dialog xác nhận xoá
├── data/
│   └── user.mock.ts            # Mock data 10 users
├── layouts/
│   └── AdminLayout.tsx          # Sidebar + main layout
├── pages/
│   ├── AdminDashboard.tsx       # Main page router
│   ├── UserPage.tsx             # User management page
│   └── ComingSoonPage.tsx       # Placeholder page
├── types/
│   └── user.dto.ts              # DTOs
└── index.ts                     # Export file
```

## 🚀 Cách Sử Dụng

### 1. Import vào App.tsx hoặc Router

```tsx
import { AdminDashboard } from '@/features/admin/AdminDashboard';

// Trong router hoặc component chính
<AdminDashboard />
```

### 2. Các Tính Năng Đã Implements

✅ **User Table:**
- Hiển thị danh sách 10 users với mock data
- Hiển thị avatar, tên, email, role, trạng thái, ngày tạo

✅ **Search & Filter:**
- Tìm kiếm theo tên hoặc email
- Lọc theo Role (User, Premium, Admin)
- Lọc theo Status (active, pending, banned)

✅ **Sort:**
- Click vào header để sort theo cột (email, role, status, createdAt)
- Hiển thị icon chevron up/down khi có sort

✅ **Pagination:**
- 5 users per page
- Navigation buttons (Previous, Next)
- Số trang hiển thị

✅ **CRUD Operations (Frontend Only):**
- **Create:** Button "Thêm người dùng" → Modal form validation
- **Edit:** Click icon chỉnh sửa → Modal form edit
- **Delete:** Click icon xoá → Xác nhận → Xoá
- Tất cả xử lý bằng `useState`, không call API

✅ **Modals:**
- UserFormCreate: Thêm user mới với validation
- UserFormEdit: Chỉnh sửa user có sẵn
- DeleteConfirmDialog: Xác nhận trước khi xoá

✅ **Admin Sidebar:**
- 8 menu items (Dashboard, Users, Challenges, etc.)
- Collapsible sidebar
- Current page highlight
- Các trang khác là ComingSoon placeholder

## 🎨 Design System

- **Tailwind CSS:** Responsive design, spacing, colors
- **shadcn/ui:** Button, Input, Dialog, Select, Badge, Avatar, Table
- **lucide-react:** Icons (Users, Edit2, Trash2, Search, etc.)
- **Color Scheme:**
  - Primary: Blue (#1e40af / blue-600)
  - Success: Green (#16a34a)
  - Warning: Yellow (#ca8a04)
  - Danger: Red (#dc2626)
  - Background: Gray (#f3f4f6)

## 📦 Data Structure

### UserResponseDTO
```typescript
interface UserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  avatar: string;
  role: string;
  createdAt: string;
  status: "active" | "banned" | "pending";
}
```

### UserRequestDTO
```typescript
interface UserRequestDTO {
  fullName: string;
  email: string;
  role: string;
}
```

## ✏️ Validation Rules

### Create/Edit User Form
- **fullName:** Required, không trống
- **email:** Required, phải là email hợp lệ (regex check)
- **role:** Required, select từ danh sách

## 🔧 Hướng Dẫn Mở Rộng

### Thêm Module Mới (Challenges, Rewards, etc.)

1. **Tạo DTOs:**
```
src/features/admin/types/challenge.dto.ts
```

2. **Tạo Mock Data:**
```
src/features/admin/data/challenge.mock.ts
```

3. **Tạo Components:**
```
src/features/admin/components/ChallengeTable.tsx
src/features/admin/components/ChallengeFormCreate.tsx
src/features/admin/components/ChallengeFormEdit.tsx
```

4. **Tạo Page:**
```
src/features/admin/pages/ChallengePage.tsx
```

5. **Update AdminDashboard.tsx:**
```tsx
case "challenges":
  return <ChallengePage />;
```

## 🎯 State Management

Toàn bộ state được quản lý bằng `useState` trong UserPage:
- `users`: Danh sách users
- `isCreateOpen`: Control modal create
- `isEditOpen`: Control modal edit
- `selectedUser`: User đang được edit
- `deleteConfirm`: Xác nhận xoá

## 📝 Mock Data

10 users mẫu được tạo từ:
- API: `https://api.dicebear.com/7.x/avataaars/svg?seed=`
- Roles: User, Premium, Admin
- Status: active, pending, banned
- Dates: Ngẫu nhiên trong 5 tháng qua

## ⚠️ Lưu Ý

- **Không có Backend API:** Tất cả dữ liệu mock, reset khi F5 trang
- **LocalStorage:** Nếu muốn persist, thêm localStorage trong useState effect
- **Timezone:** Dates sử dụng ISO format, convert bằng `toLocaleDateString("vi-VN")`

## 🔄 Cách Convert sang Real API

1. **Tạo API services:**
```typescript
// src/features/admin/api/user.api.ts
export const userAPI = {
  getAll: () => fetch('/api/users'),
  create: (data: UserRequestDTO) => fetch('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UserRequestDTO) => fetch(`/api/users/${id}`, { method: 'PUT' }),
  delete: (id: number) => fetch(`/api/users/${id}`, { method: 'DELETE' }),
};
```

2. **Replace setState:**
```typescript
// Thay vì: setUsers([...users, newUser])
// Dùng: const result = await userAPI.create(data); setUsers(...);
```

3. **Add Loading & Error states:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## 📱 Responsive

- Desktop: Full sidebar + content
- Tablet: Collapsible sidebar
- Mobile: Hamburger menu (implement bằng responsive design)

---

**Created:** Nov 18, 2025
**Framework:** React + TypeScript
**Styling:** Tailwind CSS + shadcn/ui
