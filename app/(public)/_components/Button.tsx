import React, { forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tamarind"
  | "turmeric"
  | "ghost"
  | "danger"
  | "outline";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_MAP: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink/90 active:scale-[0.98]",
  secondary: "bg-paperRaised text-ink border border-hair hover:border-ink/40 active:scale-[0.98]",
  tamarind: "bg-tamarind text-white hover:bg-tamarindDark active:scale-[0.98]",
  turmeric: "bg-turmeric text-ink font-bold hover:bg-turmericDeep hover:text-white active:scale-[0.98]",
  ghost: "bg-transparent text-inkSoft hover:text-ink hover:bg-hair/30 active:scale-[0.98]",
  danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
  outline: "bg-transparent border border-ink text-ink hover:bg-ink hover:text-white active:scale-[0.98]",
};

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: "text-xs px-2.5 py-1.5 rounded-md gap-1.5 font-mono",
  md: "text-xs sm:text-sm px-4 py-2 rounded-lg gap-2 font-mono",
  lg: "text-sm sm:text-base px-5 py-2.5 rounded-xl gap-2.5 font-mono",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const variantClass = VARIANT_MAP[variant] || VARIANT_MAP.primary;
    const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
    const widthClass = fullWidth ? "w-full" : "inline-flex";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${widthClass} items-center justify-center font-bold tracking-tight transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-tamarind/40 disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin w-4 h-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
