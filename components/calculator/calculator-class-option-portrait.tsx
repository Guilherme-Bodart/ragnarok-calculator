"use client";

import { useState } from "react";

export function CalculatorClassOptionPortrait({
  classId,
  name,
}: {
  classId: string;
  name: string;
}) {
  const canonicalClassId = classId
    .replace(/_T2$/, "")
    .replace(/_T$/, "")
    .replace(/2$/, "");
  const [errorClassId, setErrorClassId] = useState<string | null>(null);
  const hasError = errorClassId === canonicalClassId;

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
        key={canonicalClassId}
        src={`/sprites/classes/${canonicalClassId}.png`}
        alt=""
        width={28}
        height={28}
        loading="lazy"
        onError={() => setErrorClassId(canonicalClassId)}
      />
      <b>{initials}</b>
    </span>
  );
}
