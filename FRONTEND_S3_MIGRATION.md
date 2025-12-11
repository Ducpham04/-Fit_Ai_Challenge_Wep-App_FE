# 🔄 Frontend S3 Migration Guide

## ✅ Đã Hoàn Thành

### 1. **Utility Function**
- ✅ Tạo `src/utils/fileUrl.ts` với các functions:
  - `getFileUrl()` - Xử lý URLs chung
  - `getImageUrl()` - Alias cho images
  - `getVideoUrl()` - Alias cho videos
  - `getAvatarUrl()` - Alias cho avatars

### 2. **Files Đã Cập Nhật**
- ✅ `AIRepCounter.tsx` - Sử dụng `getVideoUrl()`
- ✅ `ChallengeCard.tsx` - Sử dụng `getVideoUrl()`
- ✅ `TrainingPlansPage.tsx` - Sử dụng `getImageUrl()`
- ✅ `ChallengeDetailsPage.tsx` - Xóa `baseURL`, sử dụng utility functions

---

## 📝 Cách Sử Dụng

### **Import Utility Function**

```typescript
import { getImageUrl, getVideoUrl, getAvatarUrl } from '@/utils/fileUrl';
```

### **Sử Dụng trong Components**

#### **Images:**
```typescript
// OLD
const imageUrl = `http://localhost:8080/${relativePath}`;

// NEW
const imageUrl = getImageUrl(relativePath);
```

#### **Videos:**
```typescript
// OLD
<video src={`http://localhost:8080/${videoPath}`} />

// NEW
<video src={getVideoUrl(videoPath) || ''} />
```

#### **Avatars:**
```typescript
// OLD
<img src={`http://localhost:8080/${avatarPath}`} />

// NEW
<img src={getAvatarUrl(avatarPath) || ''} />
```

---

## 🔍 Files Cần Kiểm Tra

Các file sau có thể còn dùng `localhost:8080`:

1. `src/features/profile/pages/Profile.tsx`
2. `src/components/common/Navbar.tsx`
3. `src/features/settings/pages/Settings.tsx`
4. `src/features/admin/pages/ChallengesPage.tsx`
5. `src/features/admin/pages/GoalsPage.tsx`
6. `src/features/admin/pages/RewardsPage.tsx`
7. `src/features/challenges/pages/ChallengeDetail.tsx`

---

## 🎯 Logic của Utility Function

1. **Nếu đã là full URL** (http/https) → Return nguyên
2. **Nếu là relative path**:
   - **Development**: Fallback về `localhost:8080` (nếu cần)
   - **Production**: Backend nên trả về full S3 URL
3. **Log warning** nếu không phải full URL trong production

---

## ✅ Best Practices

1. **Backend luôn trả về full S3 URL** - Không cần frontend xử lý
2. **Sử dụng utility functions** - Không hardcode `localhost:8080`
3. **Handle null/undefined** - Luôn check trước khi dùng
4. **Fallback trong development** - Chỉ khi cần thiết

---

## 🐛 Troubleshooting

### **Images/Videos không hiển thị**

1. Kiểm tra backend có trả về full S3 URL không
2. Kiểm tra S3 bucket có public read access không
3. Kiểm tra CORS settings trên S3
4. Kiểm tra console logs để xem URL được tạo ra

### **Vẫn thấy localhost:8080**

1. Kiểm tra đã import utility function chưa
2. Kiểm tra đã thay thế tất cả hardcoded URLs chưa
3. Clear browser cache
4. Rebuild frontend

---

## 📚 Tài Liệu Tham Khảo

- [S3_STORAGE_CONFIGURATION.md](../S3_STORAGE_CONFIGURATION.md)
- [S3_MIGRATION_GUIDE.md](../S3_MIGRATION_GUIDE.md)

