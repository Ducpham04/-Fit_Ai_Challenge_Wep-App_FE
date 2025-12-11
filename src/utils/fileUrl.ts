/**
 * Utility functions để xử lý file URLs (images, videos)
 * Hỗ trợ Pre-Signed URLs từ S3 private bucket
 */

import { FileUrlAPI } from '../api/fileUrl.api';

// Cache để tránh gọi API nhiều lần cho cùng một key
const urlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

/**
 * Convert S3 key thành Pre-Signed URL
 * - Nếu đã là full URL (http/https), return nguyên
 * - Nếu là S3 key, gọi API để lấy presigned URL
 * - Cache URLs để tránh gọi API nhiều lần
 * 
 * @param path - S3 key (ví dụ: "uploads/videos/filename.mp4") hoặc full URL
 * @param type - Loại file: "video" hoặc "image"
 * @returns Pre-Signed URL hoặc full URL
 */
export async function getFileUrl(
  path: string | null | undefined,
  type: "video" | "image" | "default" = "default"
): Promise<string | null> {
  if (!path) {
    return null;
  }

  // Nếu đã là full URL (http/https), return nguyên
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Kiểm tra cache
  const cacheKey = `${path}:${type}`;
  const cached = urlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  // Gọi API để lấy presigned URL
  try {
    let url: string;
    if (type === "video") {
      url = await FileUrlAPI.getVideoUrl(path);
    } else if (type === "image") {
      url = await FileUrlAPI.getImageUrl(path);
    } else {
      url = await FileUrlAPI.getPresignedUrl(path, type);
    }

    // Cache URL
    urlCache.set(cacheKey, {
      url,
      expiresAt: Date.now() + CACHE_DURATION,
    });

    return url;
  } catch (error) {
    console.error('❌ Error getting presigned URL:', error);
    // Fallback: return path như cũ (có thể là public URL)
    return path;
  }
}

/**
 * Synchronous version - chỉ dùng khi đã có URL trong cache hoặc là full URL
 * Nếu không, sẽ return null và cần dùng async version
 */
export function getFileUrlSync(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  // Nếu đã là full URL, return nguyên
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Kiểm tra cache
  for (const [key, value] of urlCache.entries()) {
    if (key.startsWith(path) && value.expiresAt > Date.now()) {
      return value.url;
    }
  }

  // Không có trong cache, return null (cần dùng async version)
  return null;
}

/**
 * Get image URL (async - gọi API để lấy presigned URL)
 */
export async function getImageUrl(path: string | null | undefined): Promise<string | null> {
  return getFileUrl(path, "image");
}

/**
 * Get video URL (async - gọi API để lấy presigned URL)
 */
export async function getVideoUrl(path: string | null | undefined): Promise<string | null> {
  return getFileUrl(path, "video");
}

/**
 * Get avatar URL (async - gọi API để lấy presigned URL)
 */
export async function getAvatarUrl(path: string | null | undefined): Promise<string | null> {
  return getFileUrl(path, "image");
}

/**
 * Synchronous versions - chỉ dùng khi đã có URL trong cache
 */
export function getImageUrlSync(path: string | null | undefined): string | null {
  return getFileUrlSync(path);
}

export function getVideoUrlSync(path: string | null | undefined): string | null {
  return getFileUrlSync(path);
}

export function getAvatarUrlSync(path: string | null | undefined): string | null {
  return getFileUrlSync(path);
}

