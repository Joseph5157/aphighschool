"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_BREAKPOINT } from "@/lib/breakpoints";
import IconButton from "./IconButton";

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
  const pathname = usePathname();
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

  // Kept in a ref so the shortcut listener below can be registered once instead
  // of being torn down and re-added on every open/close.
  const toggleRef = useRef(toggleSidebar);
  toggleRef.current = toggleSidebar;

  // Detect screen size changes. NAV_BREAKPOINT is the same value the `lg:`
  // variant uses for BottomNav and DesktopNav; hard-coding 768 here put
  // viewports between 768px and 1023px into a mixed navigation model.
  //
  // Crossing up to desktop also closes the drawer: otherwise it stays "open" in
  // state, and rotating a tablet back to portrait reopens a menu the user never
  // asked for.
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < NAV_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setOpenMobile(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // A navigation elsewhere on the page — a card link, browser back — must close
  // the drawer too. Closing it only from the drawer's own links (which is all
  // that happened before) left it open over the new page.
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  // Ctrl/Cmd+B toggles the menu.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "b") return;

      // Do not steal the keystroke from a text field. This previously fired
      // and called preventDefault unconditionally, so Ctrl+B while typing in
      // the search box or the admin form toggled the menu instead of doing
      // nothing — and the browser's own bookmark shortcut never ran either.
      const target = e.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      ) {
        return;
      }

      e.preventDefault();
      toggleRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * The off-canvas navigation drawer.
 *
 * Audit F5: this was a panel translated off-screen and nothing else. It had no
 * Escape, no focus trap, no focus return, no body scroll lock, and — because
 * `-translate-x-full` moves an element without hiding it — its links stayed
 * keyboard-focusable and screen-reader reachable while it was closed, so Tab
 * from the header walked into an invisible menu.
 *
 * It is a modal surface (it has a scrim), so it follows the same contract as
 * Dialog in DESIGN_SYSTEM.md §8.5.
 *
 * Closed-state inertness uses `visibility` rather than unmounting: an element
 * with `visibility: hidden` is out of the tab order and out of the
 * accessibility tree, and unlike `display: none` it still transitions — so the
 * slide survives. `visibility` is transitioned alongside `transform` so it
 * flips only at the END of the closing slide. The `inert` attribute is set from
 * an effect as well, because React 18 has no `inert` prop.
 */
const MobileDrawer = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ side = "left", className = "", children, ...props }, ref) => {
    const { openMobile, setOpenMobile } = useSidebar();
    const panelRef = useRef<HTMLElement | null>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLElement | null) => {
        panelRef.current = node;
        if (typeof ref === "function") ref(node as HTMLDivElement);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node as HTMLDivElement;
      },
      [ref],
    );

    const focusable = useCallback(
      () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
      [],
    );

    // Belt and braces alongside `visibility: hidden`, and the part jsdom can
    // observe.
    useEffect(() => {
      const node = panelRef.current;
      if (!node) return;
      if (openMobile) node.removeAttribute("inert");
      else node.setAttribute("inert", "");
    }, [openMobile]);

    useEffect(() => {
      if (!openMobile) return;

      returnFocusRef.current = document.activeElement as HTMLElement | null;
      (focusable()[0] ?? panelRef.current)?.focus();

      return () => {
        // Back to the trigger, not to the top of the document.
        returnFocusRef.current?.focus?.();
      };
    }, [openMobile, focusable]);

    useEffect(() => {
      if (!openMobile) return;

      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }, [openMobile]);

    useEffect(() => {
      if (!openMobile) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpenMobile(false);
          return;
        }

        if (event.key !== "Tab") return;

        const items = focusable();
        if (items.length === 0) {
          event.preventDefault();
          return;
        }

        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && (active === first || active === panelRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", onKeyDown, true);
      return () => document.removeEventListener("keydown", onKeyDown, true);
    }, [openMobile, setOpenMobile, focusable]);

    const edgeClass = side === "left" ? "left-0" : "right-0";
    const offscreenClass = side === "left" ? "-translate-x-full" : "translate-x-full";
    const stateClass = openMobile
      ? "visible translate-x-0"
      : `invisible ${offscreenClass}`;

    return (
      <>
        {openMobile && (
          // Scrim at z-50, above the z-45 bottom bars it is meant to disable.
          // aria-hidden because Escape and the close button are the accessible
          // ways out; a click target here would otherwise be announced as an
          // unlabelled interactive element.
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
            onClick={() => setOpenMobile(false)}
          />
        )}
        <aside
          ref={setRefs}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          tabIndex={-1}
          className={`fixed inset-y-0 ${edgeClass} z-60 w-72 bg-paperRaised border-r border-hair p-4 shadow-md transition-[transform,visibility] duration-300 ${stateClass} ${className}`}
          {...props}
        >
          <div className="flex flex-col h-full">{children}</div>
        </aside>
      </>
    );
  },
);
MobileDrawer.displayName = "MobileDrawer";

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ collapsible = "icon", variant = "sidebar", side = "left", className = "", children, ...props }, ref) => {
    const { open, isMobile } = useSidebar();

    if (isMobile) {
      return (
        <MobileDrawer ref={ref} side={side} className={className} {...props}>
          {children}
        </MobileDrawer>
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
        className={`px-2.5 py-1 font-mono text-xs uppercase font-bold text-inkSoft/80 tracking-wider ${className}`}
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
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex min-h-[44px] items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors duration-150 ${
          isActive
            ? "bg-paperRaised text-ink font-bold border-l-[3px] border-turmeric"
            : "border-l-[3px] border-transparent text-inkSoft hover:text-ink hover:bg-hair/30"
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
        className={`w-full flex min-h-[44px] items-center justify-between gap-2.5 px-3 py-2 rounded-lg font-mono text-xs font-medium text-inkSoft hover:text-ink hover:bg-hair/30 transition-colors duration-150 ${
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
        aria-current={isActive ? "page" : undefined}
        className={`flex min-h-[44px] items-center px-2.5 py-1.5 rounded-md font-mono text-xs transition-colors duration-150 ${
          isActive
            ? "bg-paperRaised text-ink font-bold border-l-[3px] border-turmeric -ml-[3px] pl-2"
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
    const { toggleSidebar, open, openMobile, isMobile } = useSidebar();
    const expanded = isMobile ? openMobile : open;

    // Was a bare <button> with a `title` and no aria-label, so it announced as
    // "button" with no state. aria-expanded is what tells a screen-reader user
    // whether the menu they are about to toggle is already open.
    return (
      <IconButton
        ref={ref}
        variant="outline"
        onClick={toggleSidebar}
        label={expanded ? "Close navigation menu" : "Open navigation menu"}
        showTitle
        aria-expanded={expanded}
        className={className}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        }
        {...props}
      />
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
