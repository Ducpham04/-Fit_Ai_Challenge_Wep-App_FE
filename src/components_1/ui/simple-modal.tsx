import React from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * Position where the modal panel appears.
   * - `center` (default): centered vertically and horizontally
   * - `top`: top-centered
   * - `bottom`: bottom sheet style
   * - `top-right`: small panel at top-right
   * - `bottom-right`: small panel at bottom-right
   */
  position?: "center" | "top" | "bottom" | "top-right" | "bottom-right";
  className?: string;
}

export function SimpleModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = "center",
  className = "",
}: SimpleModalProps) {
  if (!isOpen) return null;

  // Map position to container flex classes
  const getContainerClasses = (): string => {
    switch (position) {
      case "center":
        return "items-center justify-center";
      case "top":
        return "items-start justify-center pt-12";
      case "bottom":
        return "items-end justify-center pb-12";
      case "top-right":
        return "items-start justify-end pt-12 pr-6";
      case "bottom-right":
        return "items-end justify-end pb-12 pr-6";
      default:
        return "items-center justify-center";
    }
  };

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex px-4 ${getContainerClasses()}`}
      role="dialog"
      aria-modal
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className={`relative z-[100000] w-full max-w-lg rounded-lg bg-white p-6 shadow-xl ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={position === "top-right" ? { marginTop: 24 } : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">{children}</div>

        {/* Footer */}
        {footer && <div className="flex gap-2 justify-end">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
