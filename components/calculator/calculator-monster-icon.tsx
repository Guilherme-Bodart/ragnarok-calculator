import { useState } from "react";

type CalculatorMonsterIconProps = {
  monsterId: number;
  alt?: string;
  className?: string;
  size?: number;
};

export function CalculatorMonsterIcon({
  monsterId,
  alt = "",
  className = "",
  size = 48,
}: CalculatorMonsterIconProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !monsterId || monsterId <= 0) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/20 rounded-md border border-dashed border-muted-foreground/30 text-muted-foreground text-xs ${className}`}
        style={{ width: size, height: size }}
      >
        N/A
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`object-contain drop-shadow-md ${className}`}
      src={`https://static.divine-pride.net/images/mobs/png/${monsterId}.png`}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
