import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  align?: "left" | "center";
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  align = "center",
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-[620px]",
        align === "center" && "mx-auto text-center",
      )}
    >
      <p className="font-mono text-xs font-bold uppercase tracking-normal text-death-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-black leading-tight text-bone-100 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-bone-100/68 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
