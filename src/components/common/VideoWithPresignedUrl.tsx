import { useVideoUrl } from '@/hooks/useFileUrl';

interface VideoWithPresignedUrlProps {
  src: string | null | undefined;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onLoadedMetadata?: () => void;
  onCanPlay?: () => void;
  crossOrigin?: string;
}

/**
 * Component để hiển thị video với Pre-Signed URL
 * Tự động gọi API để lấy presigned URL nếu cần
 */
export function VideoWithPresignedUrl({
  src,
  className,
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  onLoadedMetadata,
  onCanPlay,
  crossOrigin,
}: VideoWithPresignedUrlProps) {
  const videoUrl = useVideoUrl(src);

  if (!videoUrl && !src) {
    return null;
  }

  return (
    <video
      src={videoUrl || src || ''}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      className={className}
      onLoadedMetadata={onLoadedMetadata}
      onCanPlay={onCanPlay}
      crossOrigin={crossOrigin || (videoUrl && !videoUrl.startsWith('blob:') ? 'anonymous' : undefined)}
    >
      Your browser does not support the video tag.
    </video>
  );
}

