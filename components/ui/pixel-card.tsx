import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PixelCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "default" | "none";
};

export function PixelCard({
  children,
  className,
  padding = "default",
  ...props
}: PixelCardProps) {
  return (
    <div
      className={cn(
        "death-panel rounded-md backdrop-blur-sm",
        padding === "default" && "p-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
