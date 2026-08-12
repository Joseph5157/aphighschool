import React from "react";

export interface FieldProps {
  label?: string;
  labelTe?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  labelTe,
  helperText,
  errorMessage,
  required = false,
  htmlFor,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block font-mono text-[10px] sm:text-xs uppercase font-bold text-inkSoft tracking-wider"
        >
          {label} {required && <span className="text-red-500">*</span>}
          {labelTe && <span className="font-telugu text-inkSoft/80 font-normal lowercase ml-1">({labelTe})</span>}
        </label>
      )}

      {children}

      {errorMessage ? (
        <p className="text-[11px] text-red-500 font-medium leading-tight">{errorMessage}</p>
      ) : helperText ? (
        <p className="text-[11px] text-inkSoft/80 font-sans leading-tight">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Field;
