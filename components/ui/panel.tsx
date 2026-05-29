import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "aside" | "div" | "header" | "section";
  children: ReactNode;
  variant?: "glass" | "holo";
};

export function Panel({
  as: Component = "div",
  children,
  className,
  variant = "glass",
  ...props
}: PanelProps) {
  return (
    <Component
      className={cn(
        variant === "glass" && "glass-card",
        variant === "holo" && "holo-panel",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
