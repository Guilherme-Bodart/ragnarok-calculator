import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function ScrollArea({ children, className, ...props }: ScrollAreaProps) {
  return (
    <div className={cn("ui-scrollarea", className)} {...props}>
      {children}
    </div>
  );
}
