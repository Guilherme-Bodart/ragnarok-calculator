"use client";

/**
 * Imperative Anime.js-inspired motion helpers built on the native Web Animations API.
 * Runs purely on the compositor thread without triggering React state updates.
 */

export function animateStaggerIn(
  container: HTMLElement | null,
  selector = ":scope > *",
  staggerMs = 24,
) {
  if (!container || typeof container.querySelectorAll !== "function") return;

  const children = Array.from(
    container.querySelectorAll<HTMLElement>(selector),
  );

  children.forEach((child, index) => {
    if (typeof child.animate !== "function") return;
    child.animate(
      [
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 220,
        delay: Math.min(index * staggerMs, 140),
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both",
      },
    );
  });
}

export function animateTargetHit(element: HTMLElement | null) {
  if (!element || typeof element.animate !== "function") return;

  element.animate(
    [
      { transform: "translate3d(0, 0, 0) scale(1)", filter: "brightness(1)" },
      {
        transform: "translate3d(-4px, -1px, 0) scale(0.95)",
        filter: "brightness(1.35) drop-shadow(0 0 12px rgba(56, 189, 248, 0.45))",
        offset: 0.2,
      },
      {
        transform: "translate3d(4px, 1px, 0) scale(1.03)",
        filter: "brightness(1.18)",
        offset: 0.45,
      },
      {
        transform: "translate3d(-2px, 0, 0) scale(0.99)",
        offset: 0.72,
      },
      { transform: "translate3d(0, 0, 0) scale(1)", filter: "brightness(1)" },
    ],
    {
      duration: 240,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  );
}

export function animateSlotPop(element: HTMLElement | null) {
  if (!element || typeof element.animate !== "function") return;

  element.animate(
    [
      { transform: "scale(0.88)", filter: "brightness(1.3)" },
      { transform: "scale(1.05)", filter: "brightness(1.15)", offset: 0.55 },
      { transform: "scale(1)", filter: "brightness(1)" },
    ],
    {
      duration: 240,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  );
}
