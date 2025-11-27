# Fit AI Challenge — Project Documentation

Ngày tạo: 2025-11-14

Tài liệu này mô tả nhanh mục đích dự án, cách chạy, và giải thích chức năng các thư mục & file chính trong repository.

## Tổng quan dự án

Fit AI Challenge Frontend là ứng dụng frontend (React + TypeScript) cho một thử thách/ứng dụng fitness có tích hợp AI/pose-detection (MediaPipe / TensorFlow). Ứng dụng dùng Vite làm bundler, Tailwind (có vẻ) cho styles, một bộ UI components tùy chỉnh, và có các pages cho Dashboard, Challenges, Community, Profile, v.v.

Mục tiêu tài liệu: cung cấp cái nhìn tổng quan cấu trúc code, chức năng từng folder/file chính, và hướng dẫn nhanh cách chạy.

---

## Hướng dẫn nhanh (Run)

- Cài dependencies:

```bash
npm install
```

- Chạy dev server:

```bash
npm run dev
# mở http://localhost:5173
```

- Build sản phẩm:

```bash
npm run build
# tạo thư mục `dist/` (mặc định Vite)
```

- Lưu ý deploy (gh-pages): hiện tại `package.json` có script `deploy: gh-pages -d build` — gh-pages đang tìm thư mục `build/` nhưng Vite xuất ra `dist/` theo mặc định. Để deploy bằng gh-pages, sửa script thành `gh-pages -d dist` hoặc thay đổi quá trình build để xuất ra `build/`.

---

## Các file cấu hình quan trọng

- `package.json` — metadata & script. Chứa:
  - `dev`: `vite`
  - `build`: `vite build`
  - `predeploy` / `deploy`: hiện dùng `gh-pages -d build` (xem lưu ý trên)
  - `dependencies` / `devDependencies` liệt kê các thư viện (react, react-dom, vite, @mediapipe, TensorFlow, Radix UI, sonner, gh-pages, v.v.)

- `tsconfig.json` — cấu hình TypeScript (JSX runtime, paths, strict, v.v.).
- `vite.config.ts` — (nếu có) cấu hình Vite. Nếu muốn tối ưu chunking, có thể thêm `build.rollupOptions.output.manualChunks` và chỉnh `build.chunkSizeWarningLimit`.
- `mock-server.js` — (nếu tồn tại) server giả lập cho API (thường dùng cho dev).
- `README.md` — mô tả dự án (nếu có nội dung chi tiết, xem file).

---

## Cấu trúc thư mục chính và mô tả

Lưu ý: trong repository hiện có một số mức lồng `src/src/...` (tức trong thư mục `src` lại có folder `src`). Điều này dễ gây nhầm lẫn — nên cân nhắc hợp nhất/di chuyển các file để tránh duplicate import paths.

Dưới đây là mô tả theo cấu trúc quan sát được (chủ yếu tập trung vào `src/`):

- `/src/` — Thư mục nguồn chính. (Trong repo hiện có `src/` và `src/src/` — kiểm tra và làm sạch.)
  - `main.tsx` — Entry point của ứng dụng. Mount React vào DOM root.
  - `App.tsx` — Component root, bọc các Provider (AuthProvider) và router.
  - `index.css`, `styles/globals.css` — styles toàn cục / Tailwind (nếu dùng).
  - `Attributions.md`, `README.md` — tài liệu phụ.

- `/src/src/` — (chứa phần lớn mã thực tế theo file list) — gợi ý cần sắp xếp lại
  - `router/`
    - `index.tsx` — cấu hình routes React Router (định tuyến giữa pages).
  - `pages/` — Các trang chính của ứng dụng
    - `Home.tsx`, `Dashboard.tsx`, `Challenges.tsx`, `ChallengeDetail.tsx`, `Community.tsx`, `Leaderboard.tsx`, `Login.tsx`, `Register.tsx`, `Profile.tsx`, `Settings.tsx`, `Reports.tsx`, `PushUpCounter.tsx` — mỗi file là một route/page với UI tương ứng.
  - `components/`
    - `common/` — các component dùng chung như `Footer.tsx`, `Navbar.tsx`.
    - `canvas/` — ví dụ `PoseOverlay.tsx` — hiển thị overlay cho pose detection.
    - `video/` — `VideoPlayer.tsx` — component phát video / stream camera.
    - `figma/` — `ImageWithFallback.tsx` — component hình ảnh với fallback.
    - `ui/` — bộ component UI tùy chỉnh (button, input, modal, spinner, card, form helpers, grid, carousel, skeleton, sonner wrapper, v.v.). Rất nhiều file ở đây: `button.tsx`, `card.tsx`, `input.tsx`, `dropdown-menu.tsx`, `sidebar.tsx`, `table.tsx`, `chart.tsx`, `avatar.tsx`, `label.tsx`, `popover.tsx`, `tabs.tsx`, `toast/sonner wrapper`, ...
  - `context/`
    - `AuthContext.tsx` — provider quản lý authentication/state user.
    - (có thể thêm `ThemeContext.tsx`, `ChallengeContext.tsx` theo cấu trúc ban đầu)
  - `hooks/`
    - `useFetch.ts`, `usePushUpCounter.ts`, `useAI.ts`, `useAuth.ts`, `useChallenge.ts`, `useLocalStorage.ts`, `useWorkout.ts` — hooks tùy chỉnh cho API, feature logic, localStorage, authentication, v.v.
  - `api/` (trong root `src` hoặc `src/src/api`)
    - `client.ts` — axios/fetch client cấu hình base URL, interceptors.
    - `FitChallenge-API.yaml` — OpenAPI / spec (dùng để tham khảo API endpoints).
    - `mockData.ts` — dữ liệu giả lập cho dev.
  - `utils/` — tiện ích thuần
    - `poseDetector.ts` — khởi tạo mô hình pose detection (MediaPipe / TensorFlow wrapper).
    - `poseProcessor.ts`, `pushUpCounterLogic.ts`, `angleUtils.ts` — thuật toán xử lý pose, đếm push-up, tính góc khớp, v.v.
  - `layouts/` hoặc `Layout/`
    - `MainLayout.tsx` — bố cục chính (header/sidebar/footer)
  - `styles/` — css/tailwind config
  - `assets/` — hình ảnh, icons

- `/public/` — tệp tĩnh public (nếu có `index.html` trong public hoặc root). Vite thường dùng root `index.html`.

- `/test/` — cấu trúc test: `e2e/`, `integration/`, `unit/` — chứa test suites nếu có.

---

## Một số file & nút quan trọng khác

- `mock-server.js` — server mock (dùng khi phát triển nếu API chưa sẵn sàng).
- `vite.config.ts` — cấu hình Vite (nên thêm `build.rollupOptions.output.manualChunks` để cải thiện chunking và `build.chunkSizeWarningLimit` để cấu hình cảnh báo kích thước chunk).
- `tsconfig.*.json` — cấu hình TS cho app và node (nếu có `tsconfig.app.json`, `tsconfig.node.json`).

---

## Vấn đề hiện có & khuyến nghị

1. React import / JSX runtime
   - Trước đây có lỗi `React is not defined` — đã fix bằng cách thêm `import React from 'react'` vào một số file hoặc cấu hình `tsconfig.json` với `jsx: react-jsx`. Nếu đã thiết lập `react-jsx`, bạn có thể bỏ các import React thủ công.

2. Deploy với `gh-pages`
   - `package.json` dùng `gh-pages -d build` causing `ENOENT` vì Vite tạo `dist/`. Sửa script deploy:
     - `"deploy": "gh-pages -d dist"`
   - Hoặc thay đổi outputDir trong `vite.config.ts`: `build: { outDir: 'build' }`.

3. Cấu trúc `src/src` (Duplicate folder)
   - Hiện repository chứa `src/` và bên trong có `src/` nữa (`src/src/...`). Điều này dễ gây nhầm lẫn khi import (ví dụ `import ... from './src/...'` xuất hiện ở file). Khuyến nghị di chuyển các file từ `src/src` lên root `src` và cập nhật đường dẫn imports hoặc sửa `baseUrl/paths` trong `tsconfig.json`.

4. Tuning build chunking
   - Thêm vào `vite.config.ts`:

```ts
// ví dụ minimal
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor_react';
            if (id.includes('radix-ui')) return 'vendor_radix';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 2000 // KB, tăng nếu cần
  }
})
```

5. Tên package có khoảng trắng
   - `package.json` có `"name": "Fit AI Challenge Frontend"` — tên package thường không nên có khoảng trắng nếu đăng npm; nhưng nếu private thì không bắt buộc. Nếu định publish, đổi thành `fit-ai-challenge-frontend`.

---

## Kết luận & Next steps đề xuất

- (Ngắn hạn) Sửa `deploy` script thành `gh-pages -d dist` để deploy nhanh.
- (Trung hạn) Dọn dẹp cấu trúc `src/` (loại bỏ `src/src`), cập nhật imports.
- (Tối ưu) Bổ sung `vite.config.ts` manualChunks để giảm kích thước chunk và set `chunkSizeWarningLimit` phù hợp.
- (Tài liệu) Thêm README chi tiết hơn về workflow dev, cách chạy mô phỏng pose-detection (mã mẫu), và yêu cầu môi trường (camera permissions, browser compatibility).

## Module admin (cập nhật 2025-11-19)

- `src/features/admin/context/AdminDataContext.tsx` đóng vai trò như một mock data store dùng chung cho toàn bộ trang admin (users, challenges, rewards, plans, meals/foods, transactions).
- Tất cả các page trong `src/features/admin/pages/*` đã được hoàn thiện UI + CRUD dựa trên mock (dashboard, users, transactions, challenges, rewards, training plans, meals, foods). Việc kết nối API thật chỉ cần thay logic trong Provider.
- README riêng tại `src/features/admin/README.md` mô tả kiến trúc, các tính năng hiện có và checklist để chuyển đổi sang backend thật.

---

Nếu bạn muốn, tôi có thể: 
- Tự động sửa `package.json` `deploy` script sang `gh-pages -d dist` và commit thay đổi; hoặc
- Thêm snippet `vite.config.ts` với `manualChunks` và `chunkSizeWarningLimit` vào repo; hoặc
- Di chuyển/flatten `src/src` thành `src` và cập nhật imports (thao tác này cần kiểm tra kỹ).

Cho tôi biết bạn muốn tôi thực hiện bước nào tiếp theo — tôi sẽ làm và chạy build để xác nhận.
