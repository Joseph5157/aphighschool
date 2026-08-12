"use client";

import React, { createContext, useContext, useState } from "react";

type SheetContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sheet({ children, open, onOpenChange }: SheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;

  const setIsOpen = (val: boolean) => {
    if (open === undefined) {
      setInternalOpen(val);
    }
    onOpenChange?.(val);
  };

  return (
    <SheetContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const context = useContext(SheetContext);
  if (!context) throw new Error("SheetTrigger must be used within Sheet");

  return (
    <div onClick={() => context.setIsOpen(true)} className={`cursor-pointer inline-block ${className}`}>
      {children}
    </div>
  );
}

export interface SheetContentProps {
  children: React.ReactNode;
  side?: "bottom" | "right" | "left";
  className?: string;
}

export function SheetContent({ children, side = "bottom", className = "" }: SheetContentProps) {
  const context = useContext(SheetContext);
  if (!context) throw new Error("SheetContent must be used within Sheet");

  if (!context.isOpen) return null;

  const sideClasses =
    side === "bottom"
      ? "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl border-t border-hair"
      : side === "right"
      ? "top-0 right-0 bottom-0 w-80 max-w-[85vw] border-l border-hair"
      : "top-0 left-0 bottom-0 w-80 max-w-[85vw] border-r border-hair";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={() => context.setIsOpen(false)}
      />

      {/* Slide Panel */}
      <div className={`relative z-10 bg-paperRaised p-6 shadow-2xl overflow-y-auto animate-slideUp space-y-4 ${sideClasses} ${className}`}>
        {/* Close Handle */}
        {side === "bottom" && (
          <div className="w-12 h-1.5 bg-hair rounded-full mx-auto mb-2 opacity-60" />
        )}
        <button
          type="button"
          onClick={() => context.setIsOpen(false)}
          className="absolute top-4 right-4 text-xs font-mono text-inkSoft hover:text-ink p-1 rounded-md border border-hair/50"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-b border-hair pb-3 space-y-1 ${className}`}>{children}</div>;
}

export function SheetTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className="font-bold text-lg text-ink tracking-tight">{children}</h2>;
}

export default Sheet;
