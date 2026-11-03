"use client";

import { useEffect, useRef } from "react";

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  formatLocale?: boolean;
  flashOnChange?: boolean;
  className?: string;
};

// Anime.js easeOutExpo curve for snappy, high-craft number rolling
function easeOutExpo(progress: number): number {
  return progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
}

function formatNumberValue(
  raw: number,
  decimals: number,
  formatLocale: boolean,
  prefix: string,
  suffix: string,
): string {
  const safeValue = Number.isFinite(raw) ? raw : 0;
  const rounded =
    decimals > 0
      ? Number(safeValue.toFixed(decimals))
      : Math.round(safeValue);

  const formatted = formatLocale
    ? rounded.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : decimals > 0
      ? rounded.toFixed(decimals)
      : String(rounded);

  return `${prefix}${formatted}${suffix}`;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 280,
  formatLocale = true,
  flashOnChange = false,
  className = "",
}: AnimatedNumberProps) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const previousValueRef = useRef<number>(value);
  const currentDisplayRef = useRef<number>(value);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;

    const fromValue = currentDisplayRef.current;
    const toValue = Number.isFinite(value) ? value : 0;
    const delta = toValue - fromValue;

    if (Math.abs(delta) < Math.pow(10, -decimals)) {
      node.textContent = formatNumberValue(
        toValue,
        decimals,
        formatLocale,
        prefix,
        suffix,
      );
      previousValueRef.current = toValue;
      currentDisplayRef.current = toValue;
      return;
    }

    // Subtle scale + semantic tint pulse when damage/stat increases or decreases
    if (flashOnChange && previousValueRef.current !== toValue && typeof node.animate === "function") {
      const isIncrease = toValue > previousValueRef.current;
      node.animate(
        [
          {
            transform: "scale(1)",
            filter: "brightness(1)",
          },
          {
            transform: isIncrease ? "scale(1.045)" : "scale(0.975)",
            filter: isIncrease
              ? "brightness(1.25) drop-shadow(0 0 10px rgba(56, 189, 248, 0.45))"
              : "brightness(1.1) drop-shadow(0 0 8px rgba(251, 113, 133, 0.35))",
            offset: 0.35,
          },
          {
            transform: "scale(1)",
            filter: "brightness(1)",
          },
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        },
      );
    }

    previousValueRef.current = toValue;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutExpo(progress);
      const interpolated = fromValue + delta * eased;

      currentDisplayRef.current = interpolated;
      node.textContent = formatNumberValue(
        interpolated,
        decimals,
        formatLocale,
        prefix,
        suffix,
      );

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        currentDisplayRef.current = toValue;
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [value, decimals, prefix, suffix, duration, formatLocale, flashOnChange]);

  return (
    <span
      ref={spanRef}
      className={`inline-block tabular-nums ${className}`.trim()}
    >
      {formatNumberValue(value, decimals, formatLocale, prefix, suffix)}
    </span>
  );
}
