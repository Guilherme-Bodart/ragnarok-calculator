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
  showDelta?: boolean;
  className?: string;
};

// Smooth easeOutCubic curve so the user can clearly watch the +delta drain into the main number
function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
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
  duration = 520,
  formatLocale = true,
  flashOnChange = false,
  showDelta = true,
  className = "",
}: AnimatedNumberProps) {
  const valueSpanRef = useRef<HTMLSpanElement | null>(null);
  const deltaSpanRef = useRef<HTMLSpanElement | null>(null);
  const previousValueRef = useRef<number>(value);
  const currentDisplayRef = useRef<number>(value);
  const rafIdRef = useRef<number | null>(null);
  const colorCleanupTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const valueNode = valueSpanRef.current;
    const deltaNode = deltaSpanRef.current;
    if (!valueNode) return;

    const fromValue = currentDisplayRef.current;
    const toValue = Number.isFinite(value) ? value : 0;
    const totalDelta = toValue - fromValue;
    const threshold = Math.pow(10, -decimals);

    if (Math.abs(totalDelta) < threshold) {
      valueNode.textContent = formatNumberValue(
        toValue,
        decimals,
        formatLocale,
        prefix,
        suffix,
      );
      if (deltaNode) {
        deltaNode.style.opacity = "0";
        deltaNode.textContent = "";
      }
      previousValueRef.current = toValue;
      currentDisplayRef.current = toValue;
      return;
    }

    const isIncrease = totalDelta > 0;
    const activeColor = isIncrease ? "#34d399" : "#fb7185"; // emerald-400 vs rose-400
    const activeShadow = isIncrease
      ? "0 0 12px rgba(52, 211, 153, 0.45)"
      : "0 0 12px rgba(251, 113, 133, 0.45)";

    if (colorCleanupTimeoutRef.current !== null) {
      window.clearTimeout(colorCleanupTimeoutRef.current);
    }

    // Highlight the main number with semantic green/red while it is incrementing/decrementing
    valueNode.style.transition = "color 120ms ease, text-shadow 120ms ease";
    valueNode.style.color = activeColor;
    valueNode.style.textShadow = activeShadow;

    if (flashOnChange && typeof valueNode.animate === "function") {
      valueNode.animate(
        [
          { transform: "scale(1)" },
          { transform: isIncrease ? "scale(1.05)" : "scale(0.97)", offset: 0.3 },
          { transform: "scale(1)" },
        ],
        {
          duration: duration + 80,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        },
      );
    }

    if (deltaNode && showDelta) {
      deltaNode.style.color = activeColor;
      deltaNode.style.opacity = "1";
      deltaNode.style.transform = "translateX(0) scale(1)";
    }

    previousValueRef.current = toValue;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Hold full delta briefly (90ms) so the eye catches the exact +delta before it drains into the number
    const holdMs = 90;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const drainElapsed = Math.max(0, elapsed - holdMs);
      const progress = Math.min(1, drainElapsed / duration);
      const eased = easeOutCubic(progress);

      const interpolated = fromValue + totalDelta * eased;
      const remainingDelta = toValue - interpolated;

      currentDisplayRef.current = interpolated;
      valueNode.textContent = formatNumberValue(
        interpolated,
        decimals,
        formatLocale,
        prefix,
        suffix,
      );

      if (deltaNode && showDelta) {
        const roundedRemaining =
          decimals > 0
            ? Number(Math.abs(remainingDelta).toFixed(decimals))
            : Math.round(Math.abs(remainingDelta));

        if (roundedRemaining > 0 && progress < 0.99) {
          const sign = isIncrease ? "+" : "-";
          deltaNode.textContent = formatNumberValue(
            roundedRemaining,
            decimals,
            formatLocale,
            sign,
            suffix,
          );
          deltaNode.style.opacity = String(Math.min(1, (1 - progress) * 1.6));
          deltaNode.style.transform = `translateX(${(-eased * 4).toFixed(1)}px) scale(${(
            1 -
            eased * 0.1
          ).toFixed(2)})`;
        } else {
          deltaNode.textContent = "";
          deltaNode.style.opacity = "0";
        }
      }

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        currentDisplayRef.current = toValue;
        valueNode.textContent = formatNumberValue(
          toValue,
          decimals,
          formatLocale,
          prefix,
          suffix,
        );
        if (deltaNode) {
          deltaNode.textContent = "";
          deltaNode.style.opacity = "0";
        }
        rafIdRef.current = null;

        // Smoothly restore original color after drain completes
        colorCleanupTimeoutRef.current = window.setTimeout(() => {
          valueNode.style.transition = "color 320ms ease, text-shadow 320ms ease";
          valueNode.style.color = "";
          valueNode.style.textShadow = "";
        }, 120);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (colorCleanupTimeoutRef.current !== null) {
        window.clearTimeout(colorCleanupTimeoutRef.current);
      }
    };
  }, [
    value,
    decimals,
    prefix,
    suffix,
    duration,
    formatLocale,
    flashOnChange,
    showDelta,
  ]);

  return (
    <span className={`inline-flex items-baseline gap-1 tabular-nums ${className}`.trim()}>
      <span ref={valueSpanRef}>
        {formatNumberValue(value, decimals, formatLocale, prefix, suffix)}
      </span>
      {showDelta && (
        <span
          ref={deltaSpanRef}
          aria-hidden="true"
          className="text-[0.72em] font-mono font-extrabold pointer-events-none select-none opacity-0 transition-opacity duration-75"
        />
      )}
    </span>
  );
}
