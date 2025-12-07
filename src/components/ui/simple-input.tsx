import React from "react";

interface SimpleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SimpleInput({ className = "", ...props }: SimpleInputProps) {
  return (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${className}`}
      {...props}
    />
  );
}
