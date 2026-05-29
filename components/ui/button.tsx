import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type SharedButtonProps = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

type ButtonProps =
  | (AnchorHTMLAttributes<HTMLAnchorElement> &
      SharedButtonProps & {
        href: string;
      })
  | (ButtonHTMLAttributes<HTMLButtonElement> &
      SharedButtonProps & {
        href?: undefined;
      });

export function Button({
  children,
  className,
  icon,
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = cn(
    "night-button",
    variant !== "primary" && variant,
    className,
  );

  if ("href" in props && props.href) {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };

    return (
      <a className={classes} {...anchorProps}>
        {icon}
        <span>{children}</span>
      </a>
    );
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button className={classes} type="button" {...buttonProps}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
