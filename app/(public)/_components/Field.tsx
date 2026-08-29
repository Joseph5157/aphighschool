import React from "react";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  labelTe?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Shadcn-inspired Modular Form Primitives
// ---------------------------------------------------------------------------

export const FieldGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`space-y-1 ${className}`} {...props} />
  )
);
FieldGroup.displayName = "FieldGroup";

export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  labelTe?: string;
}

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ children, required, labelTe, className = "", ...props }, ref) => (
    <label
      ref={ref}
      className={`block font-mono text-[10px] sm:text-xs uppercase font-bold text-inkSoft tracking-wider ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {labelTe && (
        <span lang="te" className="font-telugu text-inkSoft/80 font-normal lowercase ml-1">
          ({labelTe})
        </span>
      )}
    </label>
  )
);
FieldLabel.displayName = "FieldLabel";

export const FieldDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p ref={ref} className={`text-[11px] text-inkSoft/80 font-sans leading-tight ${className}`} {...props} />
  )
);
FieldDescription.displayName = "FieldDescription";

export const FieldError = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p ref={ref} className={`text-[11px] text-red-500 font-medium leading-tight ${className}`} {...props} />
  )
);
FieldError.displayName = "FieldError";

// ---------------------------------------------------------------------------
// High-Level Field Helper Component (100% Backward Compatible)
// ---------------------------------------------------------------------------

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      label,
      labelTe,
      helperText,
      errorMessage,
      required = false,
      htmlFor,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <FieldGroup ref={ref} className={className} {...props}>
        {label && (
          <FieldLabel htmlFor={htmlFor} required={required} labelTe={labelTe}>
            {label}
          </FieldLabel>
        )}

        {children}

        {errorMessage ? (
          <FieldError>{errorMessage}</FieldError>
        ) : helperText ? (
          <FieldDescription>{helperText}</FieldDescription>
        ) : null}
      </FieldGroup>
    );
  }
);
Field.displayName = "Field";

export default Field;

