import { useState, useEffect } from 'react';
import { getImageUrl, getVideoUrl, getAvatarUrl, getImageUrlSync, getVideoUrlSync, getAvatarUrlSync } from '../utils/fileUrl';

/**
 * Hook để lấy file URL (hỗ trợ Pre-Signed URLs)
 * Tự động gọi API nếu cần và cache kết quả
 */

export function useFileUrl(
  path: string | null | undefined,
  type: 'image' | 'video' | 'avatar' = 'image'
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }

    // Nếu đã là full URL, dùng luôn
    if (path.startsWith('http://') || path.startsWith('https://')) {
      setUrl(path);
      return;
    }

    // Kiểm tra cache trước
    let cachedUrl: string | null = null;
    if (type === 'image') {
      cachedUrl = getImageUrlSync(path);
    } else if (type === 'video') {
      cachedUrl = getVideoUrlSync(path);
    } else {
      cachedUrl = getAvatarUrlSync(path);
    }

    if (cachedUrl) {
      setUrl(cachedUrl);
      return;
    }

    // Nếu không có trong cache, gọi API
    const loadUrl = async () => {
      try {
        let result: string | null = null;
        if (type === 'image') {
          result = await getImageUrl(path);
        } else if (type === 'video') {
          result = await getVideoUrl(path);
        } else {
          result = await getAvatarUrl(path);
        }
        setUrl(result);
      } catch (error) {
        console.error('Error loading file URL:', error);
        // Fallback: dùng path như cũ
        setUrl(path);
      }
    };

    loadUrl();
  }, [path, type]);

  return url;
}

/**
 * Hook riêng cho images
 */
export function useImageUrl(path: string | null | undefined): string | null {
  return useFileUrl(path, 'image');
}

/**
 * Hook riêng cho videos
 */
export function useVideoUrl(path: string | null | undefined): string | null {
  return useFileUrl(path, 'video');
}

/**
 * Hook riêng cho avatars
 */
export function useAvatarUrl(path: string | null | undefined): string | null {
  return useFileUrl(path, 'avatar');
}

