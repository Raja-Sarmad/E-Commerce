"use client";

import { useState, type ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/utils";

type AccordionItemProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <FiChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180 text-primary"
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

type AccordionProps = {
  items: { title: string; content: ReactNode }[];
};

export function Accordion({ items }: AccordionProps) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {items.map((item, i) => (
        <div key={i} className="px-5">
          <AccordionItem title={item.title}>{item.content}</AccordionItem>
        </div>
      ))}
    </div>
  );
}
