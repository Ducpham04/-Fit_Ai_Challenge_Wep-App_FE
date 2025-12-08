# Fitness AI Service Integration Guide

## 🎯 Bước tiếp theo sau khi Python AI Service đã chạy

### 1. Kiểm tra Service đang chạy

```bash
# Test health endpoint
curl http://localhost:8000/health

# Hoặc dùng make
make test
```

### 2. Cấu hình Environment Variables

Thêm vào file `.env` của frontend:

```env
VITE_FITNESS_AI_URL=http://localhost:8000
VITE_FITNESS_AI_WS_URL=ws://localhost:8000
```

### 3. Các file đã được tạo

#### API Client
- `src/api/fitnessAI.api.ts` - REST API client cho Python service

#### Hooks
- `src/hooks/useFitnessAI.ts` - Hook cho frame-by-frame analysis
- `src/hooks/useFitnessAIWebSocket.ts` - Hook cho real-time WebSocket analysis

### 4. Cách sử dụng trong Component

#### Option 1: Frame-by-frame Analysis (REST API)

```typescript
import { useFitnessAI } from '@/hooks/useFitnessAI';

function MyComponent() {
  const {
    metrics,
    isProcessing,
    error,
    isConnected,
    analyzeVideoFrame,
    reset,
    checkServiceHealth,
  } = useFitnessAI();

  const handleAnalyze = async (video: HTMLVideoElement) => {
    await analyzeVideoFrame(video, 'push-up');
  };

  return (
    <div>
      {!isConnected && <p>Service not connected</p>}
      {error && <p>Error: {error}</p>}
      {metrics && (
        <div>
          <p>Reps: {metrics.reps}</p>
          <p>Quality: {metrics.quality_score}</p>
          <p>State: {metrics.state}</p>
        </div>
      )}
    </div>
  );
}
```

#### Option 2: Real-time WebSocket Analysis

```typescript
import { useFitnessAIWebSocket } from '@/hooks/useFitnessAIWebSocket';

function MyComponent() {
  const {
    metrics,
    isConnected,
    connect,
    disconnect,
    sendFrame,
  } = useFitnessAIWebSocket();

  useEffect(() => {
    connect('push-up');
    return () => disconnect();
  }, []);

  const handleVideoFrame = (video: HTMLVideoElement) => {
    if (isConnected) {
      sendFrame(video);
    }
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Reps: {metrics?.reps || 0}</p>
          <p>Quality: {metrics?.quality_score || 0}</p>
        </div>
      ) : (
        <p>Connecting...</p>
      )}
    </div>
  );
}
```

### 5. Cập nhật AIRepCounter Component

Bạn có thể cập nhật `AIRepCounter.tsx` để:
- Thêm toggle giữa client-side MediaPipe và server-side Python AI
- Sử dụng `useFitnessAI` hoặc `useFitnessAIWebSocket` thay cho `usePushUpCounter`
- Gửi video frames đến Python service thay vì xử lý client-side

### 6. Test Integration

```typescript
// Test trong browser console
import { checkHealth, getExercises } from '@/api/fitnessAI.api';

// Check health
await checkHealth();

// Get exercises
await getExercises();
```

### 7. Production Deployment

Khi deploy:
- Update `VITE_FITNESS_AI_URL` với production URL
- Đảm bảo CORS được cấu hình đúng trong Python service
- Sử dụng HTTPS/WSS cho production

## 📝 Next Steps

1. ✅ Python AI Service đã chạy
2. ✅ API Client đã được tạo
3. ✅ Hooks đã được tạo
4. ⏭️ Cập nhật AIRepCounter để sử dụng Python service
5. ⏭️ Test với video thực tế
6. ⏭️ Deploy lên production

## 🔧 Troubleshooting

### Service không kết nối được
- Kiểm tra service đang chạy: `curl http://localhost:8000/health`
- Kiểm tra CORS settings trong Python service
- Kiểm tra firewall/port blocking

### WebSocket không kết nối
- Kiểm tra URL: `ws://localhost:8000/ws/exercise/push-up`
- Kiểm tra service logs: `make logs`
- Thử reconnect sau vài giây

### Frame analysis lỗi
- Kiểm tra video format (hỗ trợ: jpg, png)
- Kiểm tra video size (không quá lớn)
- Kiểm tra service logs để xem error chi tiết


