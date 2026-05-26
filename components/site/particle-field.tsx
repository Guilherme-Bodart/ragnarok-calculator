import type { CSSProperties } from "react";

const particles = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 100}%`,
  top: `${12 + ((index * 17) % 78)}%`,
  duration: `${13 + (index % 9)}s`,
  delay: `${-(index * 0.72).toFixed(2)}s`,
  drift: `${index % 2 === 0 ? 1 : -1}${18 + (index % 7) * 9}px`,
}));

export function ParticleField() {
  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          style={{
            left: particle.left,
            top: particle.top,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
            "--drift-x": particle.drift,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
