import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  controlClassName?: string;
};

export function Select({
  children,
  className,
  controlClassName,
  ...props
}: SelectProps) {
  return (
    <span className={cn("ui-select", controlClassName)}>
      <select className={className} {...props}>
        {children}
      </select>
    </span>
  );
}
