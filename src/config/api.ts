/**
 * API Configuration - Tự động detect môi trường
 * 
 * Tự động nhận biết đang chạy ở local hay production
 * và sử dụng URL backend tương ứng
 */

/**
 * Lấy API base URL dựa trên hostname hiện tại
 */
export const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Nếu có environment variable, ưu tiên dùng nó
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Production: CloudFront hoặc custom domain
  if (
    hostname.includes('cloudfront.net') ||
    hostname.includes('amazonaws.com') ||
    hostname.includes('your-custom-domain.com') // Thay bằng domain thật của bạn
  ) {
    // ⚠️ THAY BẰNG URL BACKEND PRODUCTION THẬT
    // Ví dụ: https://api.yourdomain.com
    // Hoặc: http://your-ec2-ip:8080
    // KHÔNG thêm /api vì backend đã có prefix /api trong routes
    return 'https://your-backend-production.com'; // ⚠️ CẦN THAY ĐỔI
  }

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    return 'http://localhost:8080';
  }

  // Fallback: dùng cùng hostname với frontend
  return `${protocol}//${hostname}:8080`;
};

/**
 * Lấy Fitness AI Service URL
 */
export const getFitnessAIBaseUrl = (): string => {
  const hostname = window.location.hostname;

  // Nếu có environment variable, ưu tiên dùng nó
  if (import.meta.env.VITE_FITNESS_AI_URL) {
    return import.meta.env.VITE_FITNESS_AI_URL;
  }

  // Production
  if (
    hostname.includes('cloudfront.net') ||
    hostname.includes('amazonaws.com')
  ) {
    // ⚠️ THAY BẰNG URL PYTHON AI SERVICE PRODUCTION
    // Ví dụ: http://your-ec2-ip:5001
    return 'http://your-ec2-ip:5001'; // ⚠️ CẦN THAY ĐỔI
  }

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5001';
  }

  // Fallback
  return `http://${hostname}:5001`;
};

/**
 * Lấy WebSocket URL cho Fitness AI
 */
export const getFitnessAIWebSocketUrl = (exerciseType: string): string => {
  const baseUrl = getFitnessAIBaseUrl();
  const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
  const wsBaseUrl = baseUrl.replace(/^https?:\/\//, '').replace(/^http:\/\//, '');
  return `${wsProtocol}://${wsBaseUrl}/ws/exercise/${exerciseType}`;
};

// Export constants
export const API_BASE_URL = getApiBaseUrl();
export const FITNESS_AI_BASE_URL = getFitnessAIBaseUrl();

// Log để debug (chỉ trong development)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:');
  console.log('  🌍 Hostname:', window.location.hostname);
  console.log('  🔗 API Base URL:', API_BASE_URL);
  console.log('  🤖 Fitness AI URL:', FITNESS_AI_BASE_URL);
}

