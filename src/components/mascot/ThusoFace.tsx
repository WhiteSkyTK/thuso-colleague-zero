const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** Thuso: an original jacaranda-flower character (DESIGN.md §4 style — flat, no outlines, dot eyes). */
export function ThusoFace({
  size = 72,
  isTalking = false,
}: Readonly<{ size?: number; isTalking?: boolean }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="mascot-bob">
      {PETAL_ANGLES.map((angle) => (
        <ellipse
          key={angle}
          cx={50}
          cy={20}
          rx={11}
          ry={17}
          transform={`rotate(${angle} 50 50)`}
          style={{ fill: 'var(--c-jacaranda-300)' }}
        />
      ))}
      <circle cx={50} cy={50} r={27} style={{ fill: 'var(--c-jacaranda-500)' }} />
      <circle cx={40} cy={46} r={6} style={{ fill: 'var(--c-paper)' }} />
      <circle cx={60} cy={46} r={6} style={{ fill: 'var(--c-paper)' }} />
      <circle cx={41} cy={47} r={3} style={{ fill: 'var(--c-ink-900)' }} />
      <circle cx={61} cy={47} r={3} style={{ fill: 'var(--c-ink-900)' }} />
      <circle cx={33} cy={57} r={4} style={{ fill: 'var(--c-blush)' }} />
      <circle cx={67} cy={57} r={4} style={{ fill: 'var(--c-blush)' }} />
      {isTalking ? (
        <ellipse cx={50} cy={61} rx={6} ry={5} style={{ fill: 'var(--c-ink-900)' }} />
      ) : (
        <path
          d="M42 59 Q50 66 58 59"
          fill="none"
          stroke="var(--c-paper)"
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}
      <path d="M38 26 Q50 14 62 26 Z" style={{ fill: 'var(--c-leaf-500)' }} />
    </svg>
  );
}
