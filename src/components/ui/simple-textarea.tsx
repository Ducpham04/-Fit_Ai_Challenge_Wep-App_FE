import React from "react";

interface SimpleTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function SimpleTextarea({ className = "", ...props }: SimpleTextareaProps) {
  return (
    <textarea
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${className}`}
      {...props}
    />
  );
}
