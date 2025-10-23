# Hướng dẫn Deploy lên AWS CloudFront

## 📋 Tóm tắt
- **S3 Bucket**: fit-ai-challenge-frontend (ap-southeast-1)
- **CloudFront**: Sẽ được tạo để phân phối nội dung toàn cầu với HTTPS

## 🚀 Cách 1: Setup CloudFront tự động (Khuyên dùng)

### Bước 1: Thêm quyền CloudFront cho user
Chạy lệnh này với AWS admin user hoặc trên AWS Console:
```powershell
aws iam attach-user-policy --user-name s3-admin-user --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess
```

### Bước 2: Chạy script setup
```powershell
.\setup-cloudfront.ps1
```

Script sẽ tự động:
- ✅ Tạo Origin Access Identity (OAI)
- ✅ Cập nhật S3 bucket policy
- ✅ Tạo CloudFront distribution
- ✅ Lưu thông tin vào `cloudfront-info.json`

### Bước 3: Đợi CloudFront deploy (5-15 phút)
Sau khi chạy script, bạn sẽ nhận được CloudFront URL như:
```
https://d1234567890abc.cloudfront.net
```

### Bước 4: Cập nhật GitHub Actions
Thêm secret vào GitHub repository:
1. Vào Settings → Secrets and variables → Actions
2. Thêm secret mới:
   - Name: `CLOUDFRONT_DISTRIBUTION_ID`
   - Value: (Distribution ID từ cloudfront-info.json)

Từ giờ mỗi khi push code, GitHub Actions sẽ:
- Build → Deploy lên S3 → Xóa CloudFront cache tự động

---

## 🖱️ Cách 2: Setup CloudFront thủ công qua AWS Console

### Bước 1: Tạo CloudFront Distribution
1. Vào AWS Console → CloudFront
2. Click "Create Distribution"
3. Cấu hình:
   - **Origin domain**: fit-ai-challenge-frontend.s3.ap-southeast-1.amazonaws.com
   - **Origin access**: Origin access control settings (recommended)
     - Click "Create control setting" và tạo mới
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD
   - **Cache policy**: CachingOptimized
   - **Default root object**: index.html

### Bước 2: Custom Error Responses
Trong CloudFront distribution settings:
1. Vào tab "Error pages"
2. Thêm 2 error responses:
   - **403**: Response page path = /index.html, HTTP Response Code = 200
   - **404**: Response page path = /index.html, HTTP Response Code = 200

(Điều này giúp React Router hoạt động đúng)

### Bước 3: Cập nhật S3 Bucket Policy
CloudFront sẽ tạo một policy mẫu cho bạn. Copy và áp dụng vào S3 bucket.

### Bước 4: Lấy Distribution ID
Copy CloudFront Distribution ID và thêm vào GitHub Secrets như Cách 1.

---

## 🔄 Deploy thủ công sau khi setup CloudFront

### Build và Deploy
```powershell
cd FIT_AI_Challenge_WEP\APP_FE
npm run build
aws s3 sync dist/ s3://fit-ai-challenge-frontend --delete
```

### Xóa CloudFront cache
```powershell
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

Hoặc dùng script `deploy.ps1`:
```powershell
.\deploy.ps1
```

---

## 📊 Kiểm tra trạng thái CloudFront

```powershell
# Xem danh sách distributions
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName,Status]' --output table

# Xem chi tiết một distribution
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

---

## 🎯 Lợi ích của CloudFront

✅ **HTTPS mặc định** - Bảo mật tốt hơn  
✅ **CDN toàn cầu** - Tốc độ nhanh ở mọi nơi  
✅ **Cache** - Giảm tải cho S3, giảm chi phí  
✅ **Custom domain** - Có thể dùng domain riêng (fitai.yourdomain.com)  
✅ **DDoS protection** - AWS Shield tự động bảo vệ  

---

## 🔧 Troubleshooting

### Lỗi "AccessDenied" khi truy cập CloudFront
- Kiểm tra S3 bucket policy đã cho phép CloudFront OAI chưa
- Đảm bảo Origin Access Control đã được cấu hình đúng

### Website không cập nhật sau khi deploy
- Chạy CloudFront invalidation để xóa cache
- Hoặc đợi cache hết hạn (mặc định 24 giờ)

### React Router không hoạt động (404 errors)
- Đảm bảo đã thêm Custom Error Responses cho 403 và 404

---

## 📁 Files đã tạo

- `setup-cloudfront.ps1` - Script tự động setup CloudFront
- `cloudfront-config.json` - Template cấu hình CloudFront
- `cloudfront-info.json` - Lưu thông tin Distribution ID (sau khi chạy script)
- `.github/workflows/deploy.yml` - GitHub Actions workflow (đã cập nhật)

