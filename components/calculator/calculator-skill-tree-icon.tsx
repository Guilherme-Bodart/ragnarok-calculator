"use client";

import { useState } from "react";

export function SkillTreeIcon({
  numericId,
  name,
}: {
  numericId?: number;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!numericId || hasError) {
    return <span className="skill-tree-icon-fallback">{name.slice(0, 2)}</span>;
  }

  return (
    // Tiny remote skill icons are content data; keep them unoptimized and lazy.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://static.divine-pride.net/images/skill/${numericId}.png`}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
