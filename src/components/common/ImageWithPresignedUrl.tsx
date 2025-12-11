import { useImageUrl } from '@/hooks/useFileUrl';
import { useState } from 'react';

interface ImageWithPresignedUrlProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Component để hiển thị image với Pre-Signed URL
 * Tự động gọi API để lấy presigned URL nếu cần
 */
export function ImageWithPresignedUrl({
  src,
  alt,
  className,
  fallback,
  onError,
}: ImageWithPresignedUrlProps) {
  const imageUrl = useImageUrl(src);
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  const finalUrl = hasError && fallback ? fallback : (imageUrl || src || fallback);

  if (!finalUrl) {
    return null;
  }

  return (
    <img
      src={finalUrl}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}

