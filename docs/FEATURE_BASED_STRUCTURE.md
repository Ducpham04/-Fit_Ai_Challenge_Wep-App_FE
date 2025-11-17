# Feature-Based Project Structure Refactoring

**Ngày hoàn thành:** November 14, 2025

## Tổng Quan

Dự án Fit AI Challenge Frontend đã được tái cấu trúc từ **flat pages structure** sang **feature-based modular structure**. Điều này giúp dễ:
- **Maintain** (dễ tìm file liên quan)
- **Scale** (thêm feature mới mà không ảnh hưởng feature khác)
- **Test** (isolation giữa các feature)
- **Reuse** (component/hook của feature có thể tái sử dụng)

---

## Cấu Trúc Thư Mục Mới (Feature-Based)

```
src/
├── features/
│   ├── auth/                          # Feature: Authentication
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── components/                # (nếu có auth-specific UI)
│   │   ├── hooks/                     # (nếu có auth-specific hooks)
│   │   ├── api/                       # (nếu có auth-specific API)
│   │   └── index.ts                   # Barrel export
│   │
│   ├── dashboard/                     # Feature: Dashboard
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   ├── components/
│   │   │   ├── StatCard.tsx           # Dashboard-specific component
│   │   │   └── ProgressBar.tsx
│   │   ├── api/
│   │   │   └── mockData.ts            # Dashboard mock data
│   │   ├── hooks/                     # (Dashboard-specific hooks nếu có)
│   │   └── index.ts
│   │
│   ├── challenges/                    # Feature: Challenges
│   │   ├── pages/
│   │   │   ├── Challenges.tsx         # List challenges
│   │   │   ├── ChallengeDetail.tsx    # Challenge detail page
│   │   │   └── PushUpCounter.tsx      # Workout counter
│   │   ├── components/
│   │   │   └── ChallengeCard.tsx      # Challenge card component
│   │   ├── api/
│   │   │   └── mockData.ts
│   │   ├── hooks/                     # (e.g., useChallenges.ts, useWorkoutTracking.ts)
│   │   └── index.ts
│   │
│   ├── community/                     # Feature: Community
│   │   ├── pages/
│   │   │   └── Community.tsx
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── leaderboard/                   # Feature: Leaderboard
│   │   ├── pages/
│   │   │   └── Leaderboard.tsx
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── profile/                       # Feature: Profile
│   │   ├── pages/
│   │   │   └── Profile.tsx
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── settings/                      # Feature: Settings
│   │   ├── pages/
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── reports/                       # Feature: Reports
│   │   ├── pages/
│   │   │   └── Reports.tsx
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   └── home/                          # Feature: Home (Landing)
│       ├── pages/
│       │   └── Home.tsx
│       ├── components/
│       ├── api/
│       ├── hooks/
│       └── index.ts
│
├── components/
│   ├── common/                        # Shared components (Navbar, Footer, etc.)
│   └── ui/                            # Radix UI components, sonner, etc.
│
├── layouts/                           # Shared layouts (MainLayout)
├── context/                           # Global context (AuthContext, ThemeContext, etc.)
├── hooks/                             # Shared hooks (useFetch, useLocalStorage, etc.)
├── api/                               # Shared API utilities (client.ts, endpoints.ts, etc.)
├── utils/                             # Shared utilities (pose detection, angle calc, etc.)
├── styles/                            # Global styles, Tailwind config
├── types/                             # Shared TypeScript types
├── router/                            # Router configuration (routes.tsx)
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## Tại Sao Feature-Based Structure?

### 1. **Isolation & Encapsulation**
- Mỗi feature là một module độc lập
- Code của feature X không vô tình phụ thuộc feature Y
- Dễ loại bỏ feature mà không đập vỡ app

Ví dụ: Xóa folder `challenges/` → app vẫn chạy, chỉ mất trang challenges

### 2. **Maintainability**
- Tất cả file liên quan đến feature nằm trong 1 folder
- Dễ tìm, dễ sửa, dễ hiểu flow

So sánh:
- **Flat**: file nằm rải rác: `pages/Challenges.tsx`, `components/ui/ChallengeCard.tsx`, `api/mockData.ts`, `hooks/useChallenges.ts`
- **Feature-based**: tất cả trong `features/challenges/`

### 3. **Scalability**
- Khi thêm feature mới, chỉ tạo folder `features/newFeature/` và theo template
- Không ảnh hưởng code cũ

### 4. **Code Reusability**
- Xác định rõ component/hook chung (shared) vs riêng (feature-specific)
- Tránh duplicate code
- Dễ refactor shared logic

### 5. **Team Collaboration**
- Dev A làm feature A, Dev B làm feature B → ít conflict merge
- Mỗi feature là PR độc lập, dễ review

---

## Ví Dụ: Feature Authentication (`features/auth/`)

### Folder Structure:
```
features/auth/
├── pages/
│   ├── Login.tsx
│   └── Register.tsx
├── components/          # (Nếu có form/modal riêng cho auth)
├── hooks/               # (e.g., useLoginForm.ts, useRegisterValidation.ts)
├── api/                 # (e.g., authService.ts, validate.ts)
└── index.ts             # Barrel export
```

### Index Export (`features/auth/index.ts`):
```typescript
export { Login } from './pages/Login';
export { Register } from './pages/Register';
// export { useLoginForm } from './hooks/useLoginForm';  // nếu có
// export { authService } from './api/authService';      // nếu có
```

### Import Path (Before vs After):
**Before (Flat Structure):**
```typescript
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
```

**After (Feature-Based):**
```typescript
import { Login, Register } from '../features/auth';
// hoặc
import { Login } from '../features/auth/pages/Login';
```

### Login.tsx Example:
```typescript
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';  // Shared context

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();  // From shared context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-lime-400 flex items-center justify-center p-4">
      {/* Form JSX */}
    </div>
  );
};
```

---

## Ví Dụ: Feature Challenges (`features/challenges/`)

### Folder Structure:
```
features/challenges/
├── pages/
│   ├── Challenges.tsx         # List all challenges
│   ├── ChallengeDetail.tsx    # Single challenge detail
│   └── PushUpCounter.tsx      # Workout counter
├── components/
│   └── ChallengeCard.tsx      # Reusable challenge card component
├── hooks/
│   └── useChallenges.ts       # (Optional) Hook to fetch/manage challenges
├── api/
│   └── mockData.ts            # Challenge mock data
└── index.ts
```

### Index Export (`features/challenges/index.ts`):
```typescript
export { Challenges } from './pages/Challenges';
export { ChallengeDetail } from './pages/ChallengeDetail';
export { PushUpCounter } from './pages/PushUpCounter';
export { ChallengeCard } from './components/ChallengeCard';
```

### Challenges.tsx (List Page):
```typescript
import { motion } from 'motion/react';
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { ChallengeCard } from '../components/ChallengeCard';  // Feature-specific component
import { mockChallenges } from '../api/mockData';          // Feature-specific data

export const Challenges = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredChallenges = mockChallenges.filter((challenge) => {
    // Filtering logic
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Render challenges */}
    </div>
  );
};
```

### ChallengeCard.tsx (Feature Component):
```typescript
import { Users, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface ChallengeCardProps {
  id: number;
  title: string;
  description: string;
  image: string;
  difficulty: string;
  participants: number;
  reward?: string;
  status?: 'Active' | 'Upcoming' | 'Completed';
}

export const ChallengeCard = ({
  id,
  title,
  description,
  image,
  difficulty,
  participants,
  reward,
  status = 'Active',
}: ChallengeCardProps) => {
  return (
    <motion.div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Card JSX */}
      <Link to={`/challenges/${id}`} className="block w-full px-4 py-2 text-center bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg">
        View Details
      </Link>
    </motion.div>
  );
};
```

### ChallengeDetail.tsx (Detail Page):
```typescript
import { motion } from 'motion/react';
import { useParams } from 'react-router-dom';
import { Star, Users, Trophy } from 'lucide-react';
import { mockChallenges } from '../api/mockData';  // Feature-specific data

export const ChallengeDetail = () => {
  const { id } = useParams();
  const challenge = mockChallenges.find((c) => c.id === Number(id));

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Detail rendering */}
    </div>
  );
};
```

### mockData.ts (Feature API/Mock):
```typescript
// Mock data for challenges feature
export const mockChallenges = [
  {
    id: 1,
    title: '100 Push-ups Challenge',
    description: 'Complete 100 push-ups daily for 30 days',
    reward: '500 AI Points + Badge',
    difficulty: 'Hard',
    participants: 3421,
    aiScore: 95,
    image: 'https://images.unsplash.com/...',
    status: 'Active',
  },
  // ... more challenges
];
```

---

## Router Configuration (Updated)

### `src/src/router/index.tsx`:
```typescript
import { lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';

// Import from features (using barrel exports)
import { Home } from '../features/home/pages/Home';
import { Dashboard } from '../features/dashboard/pages/Dashboard';
import { Challenges, ChallengeDetail, PushUpCounter } from '../features/challenges';
import { Leaderboard } from '../features/leaderboard/pages/Leaderboard';
import { Community } from '../features/community/pages/Community';
import { Profile } from '../features/profile/pages/Profile';
import { Login, Register } from '../features/auth';
import { Settings } from '../features/settings/pages/Settings';

import { useAuth } from '../context/AuthContext';

const Reports = lazy(() => import('../features/reports/pages/Reports').then(m => ({ default: m.Reports })));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const AppRouter = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Auth Routes (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Routes (with layout) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="challenges" element={<Challenges />} />
          <Route path="challenges/:id" element={<ChallengeDetail />} />
          <Route path="challenges/:id/counter" element={
            <ProtectedRoute>
              <PushUpCounter />
            </ProtectedRoute>
          } />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="community" element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};
```

---

## Import Patterns

### Pattern 1: Import từ Barrel Export (Recommended)
```typescript
import { Challenges, ChallengeDetail, ChallengeCard } from '../features/challenges';
```

### Pattern 2: Import từ Specific File
```typescript
import { Challenges } from '../features/challenges/pages/Challenges';
import { ChallengeCard } from '../features/challenges/components/ChallengeCard';
```

### Pattern 3: Import từ Shared
```typescript
import { useAuth } from '../context/AuthContext';           // Shared context
import { Button } from '../components/ui/button';          // Shared UI
import { useFetch } from '../hooks/useFetch';              // Shared hook
```

---

## Best Practices

### 1. Keep Features Independent
- Feature A không import từ Feature B
- Nếu cần logic chung, move lên `shared/` (context, hooks, utils)

### 2. Use Barrel Exports
- Tạo `index.ts` trong mỗi feature
- Export main components/pages từ file này
- Giảm import depth

### 3. Feature-Specific vs Shared
- **Feature-specific**: StatCard (chỉ dùng trong dashboard)
- **Shared**: Button, Card, Input (dùng nhiều feature)

### 4. Naming Conventions
- Folder: `lowercase` (auth, dashboard, challenges)
- Component/Page files: `PascalCase` (Login, Dashboard, Challenges)
- Utilities/hooks: `camelCase` (useFetch, poseDetector)

### 5. API & Data
- Mock data và API calls trong `feature/xxx/api/`
- Chia sẻ client config trong `shared/api/client.ts`

---

## Checklist: Thêm Feature Mới

Để thêm feature `settings`, làm như sau:

1. **Tạo folder structure:**
   ```
   features/settings/
   ├── pages/
   │   └── Settings.tsx
   ├── components/        # (nếu cần)
   ├── hooks/            # (nếu cần)
   ├── api/              # (nếu cần)
   └── index.ts
   ```

2. **Tạo main page** (`Settings.tsx`):
   ```typescript
   export const Settings = () => {
     return <div>Settings content</div>;
   };
   ```

3. **Tạo index.ts**:
   ```typescript
   export { Settings } from './pages/Settings';
   ```

4. **Add route** trong `router/index.tsx`:
   ```typescript
   import { Settings } from '../features/settings';
   
   <Route path="settings" element={<Settings />} />
   ```

5. **Add link** trong navigation (Navbar, etc.)

---

## Build & Deployment

Cấu trúc mới không ảnh hưởng build/deployment:
- `npm run build` → tạo `dist/` như thường
- `npm run dev` → dev server như thường

**Chunk optimization** (tùy chọn):
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom', 'react-router-dom'],
        'features-auth': ['src/features/auth'],
        'features-challenges': ['src/features/challenges'],
      }
    }
  }
}
```

---

## Kết Luận

Feature-based structure làm dự án:
✅ Dễ maintain (tìm/sửa file nhanh)
✅ Dễ scale (thêm feature không ảnh hưởng code cũ)
✅ Dễ collaborate (feature riêng biệt, ít merge conflict)
✅ Dễ test (isolation giữa features)
✅ Dễ reuse (component/hook chung rõ ràng)

Các feature hiện tại:
- `auth/` — Login, Register
- `dashboard/` — Dashboard với stats & charts
- `challenges/` — Challenge list, detail, workout counter
- `community/` — Community posts
- `leaderboard/` — User rankings
- `profile/` — User profile
- `settings/` — Settings
- `reports/` — Analytics reports
- `home/` — Landing page

Tất cả được tổ chức rõ ràng, dễ maintain, dễ expand! 🚀
