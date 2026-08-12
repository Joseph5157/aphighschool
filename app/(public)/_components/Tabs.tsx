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

export function TabsTrigger({ value, children, badge, className = "" }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.setActiveTab(value)}
      className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
        isActive
          ? "bg-ink text-white shadow-2xs"
          : "text-inkSoft hover:text-ink hover:bg-hair/30"
      } ${className}`}
    >
      <span>{children}</span>
      {badge && (
        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${isActive ? "bg-white/20 text-white" : "bg-hair text-inkSoft"}`}>
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
    <div role="tabpanel" className={`animate-fadeIn ${className}`}>
      {children}
    </div>
  );
}

export default Tabs;
