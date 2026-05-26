import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({
  children,
  className,
  icon,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <a
      className={cn("night-button", variant === "secondary" && "secondary", className)}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </a>
  );
}
