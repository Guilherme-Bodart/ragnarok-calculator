"use client";

import { useState } from "react";

export function CalculatorClassOptionPortrait({
  classId,
  name,
}: {
  classId: string;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  if (hasError) {
    return <span className="skill-tree-class-fallback">{initials}</span>;
  }

  return (
    <span className="skill-tree-class-fallback">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/sprites/classes/${classId}.png`}
        alt=""
        width={28}
        height={28}
        loading="lazy"
        onError={() => setHasError(true)}
      />
      <b>{initials}</b>
    </span>
  );
}
