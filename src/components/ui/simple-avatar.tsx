import { useState } from "react";

interface SimpleAvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  className?: string;
}

export function SimpleAvatar({
  src,
  alt = "Avatar",
  fallback,
  className = "h-8 w-8",
}: SimpleAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const isImageValid = src && !imageError;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 overflow-hidden flex-shrink-0 ${className}`}
    >
      {isImageValid ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
