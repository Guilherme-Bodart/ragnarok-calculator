import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FeaturePillProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function FeaturePill({ children, className, ...props }: FeaturePillProps) {
  return (
    <span className={cn("ui-feature-pill", className)} {...props}>
      {children}
    </span>
  );
}
