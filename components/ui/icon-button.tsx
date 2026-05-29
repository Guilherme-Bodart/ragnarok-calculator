import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SharedIconButtonProps = {
  children: ReactNode;
  label: string;
  variant?: "default" | "danger";
};

type IconButtonProps =
  | (AnchorHTMLAttributes<HTMLAnchorElement> &
      SharedIconButtonProps & {
        href: string;
      })
  | (ButtonHTMLAttributes<HTMLButtonElement> &
      SharedIconButtonProps & {
        href?: undefined;
      });

export function IconButton({
  children,
  className,
  label,
  variant = "default",
  ...props
}: IconButtonProps) {
  const classes = cn(
    "ui-icon-button",
    variant === "danger" && "danger",
    className,
  );

  if ("href" in props && props.href) {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };

    return (
      <a aria-label={label} className={classes} title={label} {...anchorProps}>
        {children}
      </a>
    );
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      aria-label={label}
      className={classes}
      title={label}
      type="button"
      {...buttonProps}
    >
      {children}
    </button>
  );
}
