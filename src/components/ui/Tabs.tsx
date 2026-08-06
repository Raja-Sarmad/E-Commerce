"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  key: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultKey?: string;
  className?: string;
};

export function Tabs({ tabs, defaultKey, className }: TabsProps) {
  const [active, setActive] = useState(defaultKey ?? tabs[0]?.key ?? "");
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/50 p-1 no-scrollbar"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab?.key === tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeTab?.key === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">{activeTab?.content}</div>
    </div>
  );
}
