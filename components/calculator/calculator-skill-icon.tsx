type CalculatorSkillIconProps = {
  name: string;
  numericId?: number;
};

export function CalculatorSkillIcon({ name, numericId }: CalculatorSkillIconProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  if (typeof numericId !== "number" || !Number.isFinite(numericId) || numericId <= 0) {
    return <span className="skill-tree-icon-fallback">{initials}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="skill-select-icon"
      src={`https://static.divine-pride.net/images/skill/${numericId}.png`}
      alt=""
      width={24}
      height={24}
      loading="lazy"
    />
  );
}
