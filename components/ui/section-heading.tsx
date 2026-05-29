import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  align?: "left" | "center";
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  align = "center",
  className,
  description,
  eyebrow,
  title,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "section-heading",
        align === "center" && "section-heading-center",
        align === "left" && "section-heading-left",
        className,
      )}
      {...props}
    >
      {eyebrow ? <div className="ornament">{eyebrow}</div> : null}
      <h2 className="section-title">{title}</h2>
      {description ? <p className="section-copy">{description}</p> : null}
    </div>
  );
}
