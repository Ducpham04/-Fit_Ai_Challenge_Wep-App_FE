# Fit AI Challenge - Frontend Application

🏋️ **Fit AI Challenge** là ứng dụng web luyện tập thể thao tích hợp AI, giúp người dùng theo dõi tiến trình, tham gia các thử thách và kết nối với cộng đồng fitness.

## ✨ Tính năng chính

- 🏠 **Home Page** - Trang chủ với banner giới thiệu và danh sách challenges phổ biến
- 📊 **Dashboard** - Theo dõi số liệu thống kê cá nhân, biểu đồ hoạt động hàng tuần
- 🎯 **Challenges** - Danh sách thử thách AI với bộ lọc và tìm kiếm
- 🏆 **Leaderboard** - Bảng xếp hạng toàn cầu theo AI Score
- 👥 **Community** - Mạng xã hội chia sẻ thành tích fitness
- 👤 **Profile** - Quản lý thông tin cá nhân và mục tiêu
- 🔐 **Authentication** - Đăng nhập/đăng ký với UI gradient tươi sáng
- ⚙️ **Settings** - Cài đặt tài khoản, ngôn ngữ, thông báo

## 🎨 Thiết kế

- **Màu sắc chủ đạo**: Xanh cyan (#38bdf8), Xanh lá (#84cc16), Trắng
- **Font**: Hệ thống font mặc định (Inter-style)
- **UI/UX**: Hiện đại, tối giản, năng động
- **Animations**: Sử dụng Motion (Framer Motion) cho hiệu ứng mượt mà
- **Responsive**: Tương thích mobile và desktop

## 🛠️ Công nghệ sử dụng

- **React** - Thư viện UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling framework
- **React Router DOM** - Routing
- **Motion (Framer Motion)** - Animations
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📁 Cấu trúc thư mục

```
fit-ai-challenge/
├── src/
│   ├── api/
│   │   ├── client.ts              # Cấu hình Axios
│   │   ├── mockData.ts            # Mock data
│   │   └── FitChallenge-API.yaml  # Swagger API documentation
│   │
│   ├── components/
│   │   ├── common/                # Components dùng chung
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                    # UI components
│   │       ├── StatCard.tsx
│   │       ├── ProgressBar.tsx
│   │       └── ChallengeCard.tsx
│   │
│   ├── context/
│   │   └── AuthContext.tsx        # Authentication context
│   │
│   ├── hooks/
│   │   └── useFetch.ts            # Custom hooks
│   │
│   ├── layouts/
│   │   └── MainLayout.tsx         # Layout chính
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Challenges.tsx
│   │   ├── ChallengeDetail.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Community.tsx
│   │   ├── Profile.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Settings.tsx
│   │
│   └── router/
│       └── index.tsx              # React Router configuration
│
├── App.tsx                         # Root component
└── styles/
    └── globals.css                 # Global styles
```

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js v18+ (tương thích v22+)
- npm hoặc yarn

### Cài đặt dependencies

```bash
npm install
```

### Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### Build production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 🔐 Authentication

Ứng dụng sử dụng mock authentication với localStorage:
- Đăng ký/Đăng nhập sẽ tạo mock token
- Token được lưu trong localStorage
- Protected routes yêu cầu authentication

## 📊 Mock Data

Tất cả data hiện tại đều là mock data được định nghĩa trong `/src/api/mockData.ts`:
- Workouts và Challenges
- Leaderboard rankings
- Community posts
- User profiles
- Dashboard statistics

## 🎯 API Documentation

API documentation được định nghĩa trong file Swagger YAML tại `/src/api/FitChallenge-API.yaml`. File này mô tả các endpoints, schemas và responses cho backend API.

## 🔧 Tùy chỉnh

### Thay đổi màu sắc
Màu sắc chính được sử dụng trong Tailwind classes:
- `sky-400`, `sky-500` - Xanh cyan
- `lime-400`, `lime-500` - Xanh lá
- `orange-400`, `orange-500` - Cam
- `purple-400`, `purple-500` - Tím

### Thêm trang mới
1. Tạo component trong `/src/pages/`
2. Thêm route trong `/src/router/index.tsx`
3. Thêm link trong Navbar nếu cần

## 📱 Responsive Design

Ứng dụng responsive với breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🤝 Contributing

Đây là demo frontend hoàn chỉnh. Để tích hợp backend thật:
1. Thay thế mock data bằng API calls thật
2. Cấu hình `VITE_API_URL` trong `.env`
3. Cập nhật authentication logic với JWT thật
4. Thêm error handling và loading states

## 📄 License

MIT License - Free to use for learning and commercial projects

---

**Developed with ❤️ using React + TypeScript + Tailwind CSS**
