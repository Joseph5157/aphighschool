"use client";

import React, { createContext, useContext, useState } from "react";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className = "" }: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (id: string) => {
    if (value === undefined) {
      setInternalTab(id);
    }
    onValueChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`space-y-4 ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 p-1 bg-paperRaised border border-hair rounded-xl overflow-x-auto no-scrollbar font-mono text-xs font-bold shadow-2xs ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  badge?: string;
  className?: string;
}

// Deterministic id shared between a TabsTrigger and the TabsContent it
// controls, derived from the tab `value` alone so both sides can compute it
// independently without threading refs through context.
const tabTriggerId = (value: string) => `tab-trigger-${value}`;

export function TabsTrigger({ value, children, badge, className = "" }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  // Roving-tabindex arrow key navigation per the WAI-ARIA tabs pattern:
  // only the active tab is in the natural Tab order; Left/Right/Home/End
  // move focus among the rest and activate as they go.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const tablist = event.currentTarget.closest('[role="tablist"]');
    if (!tablist) return;
    const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const currentIndex = tabs.indexOf(event.currentTarget);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    const nextTab = tabs[nextIndex];
    const nextValue = nextTab.dataset.value;
    if (nextValue) context.setActiveTab(nextValue);
    nextTab.focus();
  };

  return (
    <button
      type="button"
      role="tab"
      id={tabTriggerId(value)}
      data-value={value}
      aria-selected={isActive}
      aria-controls={`tab-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => context.setActiveTab(value)}
      onKeyDown={handleKeyDown}
      className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
        isActive
          ? "bg-ink text-paper shadow-2xs"
          : "text-inkSoft hover:text-ink hover:bg-hair/30"
      } ${className}`}
    >
      <span>{children}</span>
      {badge && (
        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${isActive ? "bg-paper/20 text-paper" : "bg-hair text-inkSoft"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className = "" }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`tab-panel-${value}`}
      aria-labelledby={tabTriggerId(value)}
      className={`animate-fadeIn ${className}`}
    >
      {children}
    </div>
  );
}

export default Tabs;
