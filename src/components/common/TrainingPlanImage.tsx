import { useImageUrl } from '@/hooks/useFileUrl';

interface TrainingPlanImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

/**
 * Component để hiển thị Training Plan image với presigned URL
 */
export function TrainingPlanImage({ src, alt, className }: TrainingPlanImageProps) {
  const imageUrl = useImageUrl(src);
  
  if (!imageUrl && !src) {
    return null;
  }

  return (
    <img
      src={imageUrl || src || ''}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}

