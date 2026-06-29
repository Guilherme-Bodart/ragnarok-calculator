import { useState } from "react";

type CalculatorItemIconProps = {
  itemId: number;
  alt?: string;
  className?: string;
  size?: number;
};

export function CalculatorItemIcon({
  itemId,
  alt = "",
  className = "",
  size = 24,
}: CalculatorItemIconProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !itemId || itemId <= 0) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/50 rounded text-muted-foreground text-[10px] ${className}`}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`object-contain ${className}`}
      src={`https://static.divine-pride.net/images/items/item/${itemId}.png`}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
