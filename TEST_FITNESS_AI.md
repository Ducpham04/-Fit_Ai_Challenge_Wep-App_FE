# Test Fitness AI Service - Hướng dẫn

## 🚀 Các bước test

### 1. Đảm bảo Python AI Service đang chạy

```bash
cd fitness-ai-service

# Kiểm tra service
make test
# Hoặc
curl http://localhost:8000/health

# Nếu chưa chạy, start service
make up
# Hoặc
docker-compose up -d
```

### 2. Cấu hình Environment Variables

Thêm vào file `.env` của frontend (nếu chưa có):

```env
VITE_FITNESS_AI_URL=http://localhost:8000
VITE_FITNESS_AI_WS_URL=ws://localhost:8000
```

Sau đó restart frontend dev server.

### 3. Truy cập Demo Component

1. **Mở trình duyệt** và điều hướng đến:
   ```
   http://localhost:3000/#/admin/fitness-ai-demo
   ```

2. **Hoặc từ Admin Dashboard:**
   - Đăng nhập vào admin panel
   - Click vào menu "Fitness AI Demo" trong sidebar

### 4. Test các tính năng

#### A. Test Connection
- Component sẽ tự động check health khi load
- Xem status: "Connected" (xanh) hoặc "Disconnected" (đỏ)

#### B. Test REST API Mode
1. **Chọn Exercise Type**: Push-up, Squat, Pull-up, Sit-up, hoặc Plank
2. **Upload video file** hoặc chọn file từ máy
3. **Click "Analyze Frame"** để phân tích frame hiện tại
4. **Xem kết quả**:
   - Reps count
   - Quality score
   - State (up/down/holding)
   - Form errors (nếu có)
   - Angles

#### C. Test WebSocket Mode (Real-time)
1. **Bật toggle "Use WebSocket"**
2. **Chọn Exercise Type**
3. **Upload và play video**
4. **Frames sẽ tự động gửi** mỗi 100ms (10 FPS)
5. **Xem metrics update real-time** khi video đang play

### 5. Test với video thực tế

#### Video Push-up:
- Upload video người tập push-up
- Chọn "push-up" exercise type
- Xem reps được đếm tự động
- Kiểm tra form errors nếu có

#### Video Squat:
- Upload video người tập squat
- Chọn "squat" exercise type
- Xem phân tích góc đầu gối và lưng

### 6. Kiểm tra Console Logs

Mở Browser DevTools (F12) và xem:
- Connection logs
- API request/response
- WebSocket messages
- Errors (nếu có)

## 🔍 Troubleshooting

### Service không kết nối
```bash
# Kiểm tra service đang chạy
docker-compose ps

# Xem logs
make logs

# Restart service
make restart
```

### CORS Error
- Đảm bảo `CORS_ORIGINS` trong Python service bao gồm `http://localhost:3000`
- Check file `fitness-ai-service/docker-compose.yml` hoặc `.env`

### WebSocket không kết nối
- Kiểm tra service logs: `make logs`
- Kiểm tra URL: `ws://localhost:8000/ws/exercise/push-up`
- Thử reconnect bằng cách toggle WebSocket off/on

### Frame analysis lỗi
- Đảm bảo video đã load xong (readyState >= 2)
- Kiểm tra video format (hỗ trợ: mp4, webm, mov)
- Xem service logs để biết lỗi chi tiết

## 📊 Expected Results

### Push-up Analysis:
- **Reps**: Tăng khi hoàn thành 1 rep (down → up)
- **Quality Score**: 0-100 dựa trên form
- **State**: "up" hoặc "down"
- **Form Errors**: Cảnh báo nếu body không thẳng, tay quá rộng, etc.

### Squat Analysis:
- **Reps**: Tăng khi squat xuống và đứng lên
- **Quality Score**: Dựa trên độ sâu và form
- **Form Errors**: Cảnh báo nếu đầu gối vượt quá mũi chân, lưng không thẳng

## ✅ Checklist Test

- [ ] Service health check thành công
- [ ] REST API analyze frame hoạt động
- [ ] WebSocket connect thành công
- [ ] Real-time analysis hoạt động khi play video
- [ ] Reps được đếm chính xác
- [ ] Quality score hiển thị
- [ ] Form errors hiển thị khi có lỗi
- [ ] Reset counter hoạt động
- [ ] Switch giữa exercises hoạt động
- [ ] Error handling hoạt động (disconnect, invalid video, etc.)

## 🎯 Next Steps

Sau khi test thành công:
1. Tích hợp vào `AIRepCounter` component
2. Thay thế client-side MediaPipe bằng Python service
3. Test với nhiều loại video khác nhau
4. Optimize performance nếu cần
5. Deploy lên production




