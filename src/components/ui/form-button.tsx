import React, { forwardRef } from 'react';

export interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    fullWidth = false,
    className = '',
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
      primary: 'bg-gradient-to-r from-sky-400 to-lime-400 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-sky-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border-2 border-sky-500 text-sky-500 hover:bg-sky-50 focus:ring-sky-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg'
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = isDisabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : '';

    const buttonClasses = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${widthClass}
      ${disabledClass}
      ${className}
    `;

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {loadingText || 'Loading...'}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

FormButton.displayName = 'FormButton';
