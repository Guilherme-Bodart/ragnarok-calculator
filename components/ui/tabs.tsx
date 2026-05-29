import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type TabsProps = {
  children: ReactNode;
  label: string;
  variant?: "bar" | "segmented";
};

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  children: ReactNode;
};

export function Tabs({ children, label, variant = "bar" }: TabsProps) {
  return (
    <div
      className={cn("ui-tabs", variant === "segmented" && "segmented")}
      role="tablist"
      aria-label={label}
    >
      {children}
    </div>
  );
}

export function TabButton({
  active,
  children,
  className,
  ...props
}: TabButtonProps) {
  return (
    <button
      aria-selected={active}
      className={cn(active && "active", className)}
      role="tab"
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
