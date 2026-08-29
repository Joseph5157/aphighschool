"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ---------------------------------------------------------------------------
// Sidebar Context & Provider
// ---------------------------------------------------------------------------

type SidebarContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export interface SidebarProviderProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  children,
  className = "",
}: SidebarProviderProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const open = openProp !== undefined ? openProp : internalOpen;

  const setOpen = (value: boolean) => {
    if (openProp === undefined) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  // Detect screen size changes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, openMobile, isMobile]);

  return (
    <SidebarContext.Provider
      value={{ open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }}
    >
      <div className={`flex min-h-screen w-full bg-paper text-ink ${className}`}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Sidebar Component
// ---------------------------------------------------------------------------

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: "icon" | "offcanvas" | "none";
  variant?: "sidebar" | "floating" | "inset";
  side?: "left" | "right";
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ collapsible = "icon", variant = "sidebar", side = "left", className = "", children, ...props }, ref) => {
    const { open, openMobile, setOpenMobile, isMobile } = useSidebar();

    // Mobile Drawer
    if (isMobile) {
      return (
        <>
          {openMobile && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setOpenMobile(false)}
            />
          )}
          <aside
            ref={ref}
            className={`fixed inset-y-0 ${side === "left" ? "left-0" : "right-0"} z-50 w-72 bg-paperRaised border-r border-hair p-4 shadow-xl transition-transform duration-300 ${
              openMobile
                ? "translate-x-0"
                : side === "left"
                ? "-translate-x-full"
                : "translate-x-full"
            } ${className}`}
            {...props}
          >
            <div className="flex flex-col h-full">{children}</div>
          </aside>
        </>
      );
    }

    // Desktop Collapsible Sidebar
    const widthClass = !open
      ? collapsible === "icon"
        ? "w-16"
        : "w-0 overflow-hidden border-none"
      : "w-64";

    const variantClass =
      variant === "floating"
        ? "m-3 rounded-2xl border border-hair shadow-md"
        : variant === "inset"
        ? "border-r border-hair"
        : "border-r border-hair";

    return (
      <aside
        ref={ref}
        className={`sticky top-0 h-screen bg-paperRaised flex flex-col justify-between shrink-0 transition-all duration-300 z-30 ${widthClass} ${variantClass} ${className}`}
        {...props}
      >
        {children}
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

// ---------------------------------------------------------------------------
// Structural Sections: Header, Content, Footer
// ---------------------------------------------------------------------------

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-3 border-b border-hair/60 flex items-center justify-between gap-2 ${className}`} {...props} />
  )
);
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar ${className}`} {...props} />
  )
);
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-3 border-t border-hair/60 flex items-center justify-between gap-2 ${className}`} {...props} />
  )
);
SidebarFooter.displayName = "SidebarFooter";

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`space-y-1 ${className}`} {...props} />
  )
);
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    const { open, isMobile } = useSidebar();
    if (!open && !isMobile) return null;
    return (
      <div
        ref={ref}
        className={`px-2.5 py-1 font-mono text-[10px] uppercase font-bold text-inkSoft/70 tracking-wider ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`space-y-0.5 ${className}`} {...props} />
  )
);
SidebarGroupContent.displayName = "SidebarGroupContent";

// ---------------------------------------------------------------------------
// Menu & Menu Items
// ---------------------------------------------------------------------------

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className = "", ...props }, ref) => (
    <ul ref={ref} className={`space-y-1 font-mono text-xs ${className}`} {...props} />
  )
);
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className = "", ...props }, ref) => (
    <li ref={ref} className={`relative list-none ${className}`} {...props} />
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

export interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<typeof Link> {
  isActive?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export const SidebarMenuButton = React.forwardRef<HTMLAnchorElement, SidebarMenuButtonProps>(
  ({ href, isActive: isActiveProp, icon, badge, children, className = "", onClick, ...props }, ref) => {
    const pathname = usePathname();
    const { open, isMobile, setOpenMobile } = useSidebar();
    const isActive = isActiveProp !== undefined ? isActiveProp : pathname === href || (href !== "/" && pathname?.startsWith(String(href)));

    const collapsed = !open && !isMobile;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isMobile) {
        setOpenMobile(false);
      }
      onClick?.(e);
    };

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        title={collapsed ? String(children) : undefined}
        className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all ${
          isActive
            ? "bg-accent/15 text-accent border border-accent/20 font-bold shadow-2xs"
            : "text-inkSoft hover:text-ink hover:bg-hair/30"
        } ${collapsed ? "justify-center px-0" : ""} ${className}`}
        {...props}
      >
        {icon && <span className="text-base shrink-0 transition-transform group-hover:scale-110">{icon}</span>}
        {!collapsed && <span className="flex-1 truncate">{children}</span>}
        {!collapsed && badge && <span className="shrink-0">{badge}</span>}
      </Link>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

// ---------------------------------------------------------------------------
// Collapsible Submenu Components (Submenu level)
// ---------------------------------------------------------------------------

export interface SidebarCollapsibleProps {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SidebarCollapsible({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
  className = "",
}: SidebarCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { open, isMobile } = useSidebar();
  const collapsed = !open && !isMobile;

  return (
    <SidebarMenuItem className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={collapsed ? title : undefined}
        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg font-mono text-xs font-medium text-inkSoft hover:text-ink hover:bg-hair/30 transition-all ${
          collapsed ? "justify-center px-0" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="text-base shrink-0">{icon}</span>}
          {!collapsed && <span className="truncate">{title}</span>}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1 shrink-0">
            {badge && <span>{badge}</span>}
            <svg
              className={`w-3.5 h-3.5 text-inkSoft/70 transition-transform duration-200 ${
                isOpen ? "rotate-90 text-ink" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </button>

      {/* Submenu links */}
      {isOpen && !collapsed && (
        <ul className="mt-1 ml-4 pl-3 border-l border-hair space-y-1 animate-fadeIn">
          {children}
        </ul>
      )}
    </SidebarMenuItem>
  );
}

export const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className = "", ...props }, ref) => (
    <li ref={ref} className={`list-none ${className}`} {...props} />
  )
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

export interface SidebarMenuSubButtonProps extends React.ComponentPropsWithoutRef<typeof Link> {
  isActive?: boolean;
  children: React.ReactNode;
}

export const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
  ({ href, isActive: isActiveProp, children, className = "", onClick, ...props }, ref) => {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();
    const isActive = isActiveProp !== undefined ? isActiveProp : pathname === href;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isMobile) {
        setOpenMobile(false);
      }
      onClick?.(e);
    };

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        className={`block px-2.5 py-1.5 rounded-md font-mono text-[11px] transition-all ${
          isActive
            ? "text-accent font-bold bg-accent/10"
            : "text-inkSoft hover:text-ink hover:bg-hair/20"
        } ${className}`}
        {...props}
      >
        {children}
      </Link>
    );
  }
);
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";


// ---------------------------------------------------------------------------
// Sidebar Controls & Inset Content Wrapper
// ---------------------------------------------------------------------------

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = "", ...props }, ref) => {
    const { toggleSidebar, open } = useSidebar();
    return (
      <button
        ref={ref}
        type="button"
        onClick={toggleSidebar}
        title={`Toggle Sidebar (${open ? "Collapse" : "Expand"})`}
        className={`p-2 rounded-lg border border-hair bg-paperRaised text-ink hover:bg-hair/30 transition-all ${className}`}
        {...props}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <main ref={ref} className={`flex-1 min-w-0 transition-all duration-300 ${className}`} {...props} />
  )
);
SidebarInset.displayName = "SidebarInset";
