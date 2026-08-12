import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = "", hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-paperRaised border border-hair rounded-xl shadow-xs transition-all ${
        hoverable ? "hover:border-ink/30 hover:shadow-2xs" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-5 border-b border-hair/60 space-y-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`font-bold text-base sm:text-lg text-ink tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs sm:text-sm text-inkSoft leading-relaxed font-sans ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-5 space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-5 border-t border-hair/60 flex items-center justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
