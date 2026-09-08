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
      className={`block font-mono text-xs uppercase font-bold text-inkSoft tracking-wider ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-kumkum ml-0.5">*</span>}
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
    <p ref={ref} className={`text-xs text-inkSoft/80 font-sans leading-tight ${className}`} {...props} />
  )
);
FieldDescription.displayName = "FieldDescription";

export const FieldError = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p ref={ref} className={`text-xs text-kumkum font-medium leading-tight ${className}`} {...props} />
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
    const generatedId = React.useId();
    const controlId = htmlFor ?? generatedId;
    const messageId = errorMessage
      ? `${controlId}-error`
      : helperText
        ? `${controlId}-description`
        : undefined;

    // The message was rendered but never linked, so assistive technology was
    // told neither that a field was invalid nor why. Cloning is what lets the
    // wiring live in one place instead of asking all 35 call sites to repeat
    // `id`, `aria-describedby` and `aria-invalid` by hand — and to keep getting
    // it right. A child that sets any of these itself keeps its own value.
    const control = React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          id: (children.props as { id?: string }).id ?? controlId,
          "aria-describedby":
            (children.props as { "aria-describedby"?: string })["aria-describedby"] ??
            messageId,
          "aria-invalid":
            (children.props as { "aria-invalid"?: boolean })["aria-invalid"] ??
            (errorMessage ? true : undefined),
          "aria-required":
            (children.props as { "aria-required"?: boolean })["aria-required"] ??
            (required || undefined),
        })
      : children;

    return (
      <FieldGroup ref={ref} className={className} {...props}>
        {label && (
          <FieldLabel htmlFor={controlId} required={required} labelTe={labelTe}>
            {label}
          </FieldLabel>
        )}

        {control}

        {errorMessage ? (
          <FieldError id={messageId}>{errorMessage}</FieldError>
        ) : helperText ? (
          <FieldDescription id={messageId}>{helperText}</FieldDescription>
        ) : null}
      </FieldGroup>
    );
  }
);
Field.displayName = "Field";

export default Field;

