import type { Diagram } from '@/core/lessons/TopicLesson';

type Of<K extends Diagram['kind']> = Readonly<{ diagram: Extract<Diagram, { kind: K }> }>;

const WIDTH = 320;
const HEIGHT = 190;
const BASE = 160;
const FILLS = ['fill-jacaranda-500', 'fill-ember-700', 'fill-ink'];
const TEXT = 'fill-ink text-[11px]';

function Bars({ diagram }: Of<'bars'>) {
  const max = Math.max(...diagram.bars.map((b) => b.value), diagram.line?.value ?? 0);
  const slot = (WIDTH - 40) / diagram.bars.length;
  const heightOf = (value: number) => (value / max) * (BASE - 30);
  return (
    <>
      {diagram.bars.map((bar, at) => {
        const x = 30 + at * slot + slot * 0.15;
        const h = heightOf(bar.value);
        return (
          <g key={bar.label + String(at)}>
            <rect
              x={x}
              y={BASE - h}
              width={slot * 0.7}
              height={h}
              rx={4}
              className="bar-rise fill-jacaranda-500"
              style={{ animationDelay: `${at * 80}ms` }}
            />
            <text x={x + slot * 0.35} y={BASE - h - 4} textAnchor="middle" className={TEXT}>
              {diagram.unit === 'R' ? `R${bar.value}` : bar.value}
            </text>
            <text x={x + slot * 0.35} y={BASE + 14} textAnchor="middle" className={TEXT}>
              {bar.label}
            </text>
          </g>
        );
      })}
      {diagram.line && (
        <g>
          <line
            x1={24}
            x2={WIDTH - 8}
            y1={BASE - heightOf(diagram.line.value)}
            y2={BASE - heightOf(diagram.line.value)}
            strokeDasharray="5 4"
            className="stroke-ember-700"
            strokeWidth={2}
          />
          <text
            x={WIDTH - 8}
            y={BASE - heightOf(diagram.line.value) - 4}
            textAnchor="end"
            className="fill-ember-700 text-[11px] font-bold"
          >
            {diagram.line.label}
          </text>
        </g>
      )}
      <line x1={24} x2={WIDTH - 8} y1={BASE} y2={BASE} className="stroke-ink" />
    </>
  );
}

function Triangle({ diagram }: Of<'triangle'>) {
  const [ax, ay, bx, by, cx, cy] = [50, 160, 270, 160, 270, 40];
  return (
    <>
      <polygon
        points={`${ax},${ay} ${bx},${by} ${cx},${cy}`}
        className="draw-in fill-jacaranda-50 stroke-jacaranda-700"
        strokeWidth={3}
      />
      <rect x={bx - 14} y={by - 14} width={14} height={14} className="fill-none stroke-ink" />
      <path
        d={`M ${ax + 36} ${ay} A 36 36 0 0 0 ${ax + 31} ${ay - 18}`}
        className="fill-none stroke-ember-700"
        strokeWidth={2}
      />
      <text x={ax + 42} y={ay - 6} className="fill-ember-700 text-[12px] font-bold">
        {diagram.angle}
      </text>
      <text x={(ax + bx) / 2} y={ay + 18} textAnchor="middle" className={TEXT}>
        adjacent · {diagram.adjacent}
      </text>
      <text x={bx + 6} y={(by + cy) / 2} className={TEXT}>
        opposite
      </text>
      <text x={bx + 6} y={(by + cy) / 2 + 13} className={TEXT}>
        {diagram.opposite}
      </text>
      <text x={(ax + cx) / 2 - 8} y={(ay + cy) / 2 - 8} textAnchor="end" className={TEXT}>
        hypotenuse · {diagram.hypotenuse}
      </text>
    </>
  );
}

function Parabola({ diagram }: Of<'parabola'>) {
  const { a, q } = diagram;
  const xs = Array.from({ length: 25 }, (_, at) => -3 + at * 0.25);
  const ys = xs.map((x) => a * x * x + q);
  const [low, high] = [Math.min(...ys, 0) - 1, Math.max(...ys, 0) + 1];
  const px = (x: number) => 20 + ((x + 3) / 6) * (WIDTH - 40);
  const py = (y: number) => 10 + ((high - y) / (high - low)) * (HEIGHT - 30);
  const path = xs.map((x, at) => `${at === 0 ? 'M' : 'L'} ${px(x)} ${py(ys[at] ?? 0)}`).join(' ');
  const root = q / a < 0 ? Math.sqrt(-q / a) : undefined;
  return (
    <>
      <line x1={10} x2={WIDTH - 10} y1={py(0)} y2={py(0)} className="stroke-ink" />
      <line x1={px(0)} x2={px(0)} y1={6} y2={HEIGHT - 16} className="stroke-ink" />
      <path d={path} className="draw-in fill-none stroke-jacaranda-500" strokeWidth={3} />
      <circle cx={px(0)} cy={py(q)} r={4} className="fill-ember-700" />
      <text x={px(0) + 6} y={py(q) + 4} className="fill-ember-700 text-[11px] font-bold">
        turning point (0; {q})
      </text>
      {root !== undefined &&
        [-root, root].map((x) => (
          <g key={x}>
            <circle cx={px(x)} cy={py(0)} r={4} className="fill-jacaranda-700" />
            <text x={px(x)} y={py(0) - 8} textAnchor="middle" className={TEXT}>
              ({x}; 0)
            </text>
          </g>
        ))}
      <text x={WIDTH - 12} y={18} textAnchor="end" className={TEXT}>
        y = {a}x² {q < 0 ? '−' : '+'} {Math.abs(q)}
      </text>
    </>
  );
}

function Dots({ diagram }: Of<'dots'>) {
  const PER_ROW = 14;
  return (
    <>
      {diagram.groups.map((group, row) => (
        <g key={group.label}>
          <text x={8} y={36 + row * 50} className="fill-ink text-[12px] font-bold">
            {group.label} × {group.count}
          </text>
          {Array.from({ length: group.count }, (_, at) => (
            <circle
              key={at}
              cx={16 + (at % PER_ROW) * 21}
              cy={52 + row * 50 + Math.floor(at / PER_ROW) * 18}
              r={8}
              className={`pop-dot ${FILLS[row % FILLS.length] ?? FILLS[0]}`}
              style={{ animationDelay: `${at * 40}ms` }}
            />
          ))}
        </g>
      ))}
    </>
  );
}

function Wave({ diagram }: Of<'wave'>) {
  const mid = 95;
  const amp = 45;
  const points = Array.from({ length: 81 }, (_, at) => {
    const x = 10 + at * 3.75;
    return `${at === 0 ? 'M' : 'L'} ${x} ${mid - amp * Math.sin((at / 40) * 2 * Math.PI)}`;
  }).join(' ');
  return (
    <>
      <line
        x1={10}
        x2={WIDTH - 10}
        y1={mid}
        y2={mid}
        strokeDasharray="4 4"
        className="stroke-ink"
      />
      <path d={points} className="draw-in fill-none stroke-jacaranda-500" strokeWidth={3} />
      <line x1={47.5} x2={197.5} y1={32} y2={32} className="stroke-ember-700" strokeWidth={2} />
      <text x={122} y={24} textAnchor="middle" className="fill-ember-700 text-[12px] font-bold">
        {diagram.wavelength}
      </text>
      <line
        x1={250}
        x2={250}
        y1={mid}
        y2={mid + amp}
        className="stroke-jacaranda-700"
        strokeWidth={2}
      />
      <text x={256} y={mid + amp / 2} className={TEXT}>
        {diagram.amplitude}
      </text>
    </>
  );
}

const FLOW_BOX = 30;
const FLOW_GAP = 16;
const FLOW_PITCH = FLOW_BOX + FLOW_GAP;

/** A process, top to bottom: one box per step, joined by arrows. */
function Flow({ diagram }: Of<'flow'>) {
  return (
    <>
      {diagram.steps.map((step, at) => {
        const y = 4 + at * FLOW_PITCH;
        const isLast = at === diagram.steps.length - 1;
        return (
          <g key={step} className="pop-dot" style={{ animationDelay: `${at * 120}ms` }}>
            <rect
              x={20}
              y={y}
              width={WIDTH - 40}
              height={FLOW_BOX}
              rx={10}
              className={isLast ? 'fill-jacaranda-500' : 'fill-jacaranda-50 stroke-jacaranda-500'}
            />
            <text
              x={WIDTH / 2}
              y={y + FLOW_BOX / 2 + 4}
              textAnchor="middle"
              className={isLast ? 'fill-white text-[12px] font-bold' : 'fill-ink text-[12px]'}
            >
              {step}
            </text>
            {!isLast && (
              <path
                d={`M ${WIDTH / 2} ${y + FLOW_BOX + 2} v ${FLOW_GAP - 8} l -5 -5 m 5 5 l 5 -5`}
                className="fill-none stroke-ember-700"
                strokeWidth={2}
              />
            )}
          </g>
        );
      })}
    </>
  );
}

const heightOf = (diagram: Diagram) =>
  diagram.kind === 'flow' ? diagram.steps.length * FLOW_PITCH - FLOW_GAP + 8 : HEIGHT;

const TITLE: Record<Diagram['kind'], string> = {
  bars: 'Bar chart',
  triangle: 'Right-angled triangle',
  parabola: 'Graph of a parabola',
  dots: 'Counting picture',
  wave: 'A wave',
  flow: 'Step by step',
};

function Drawing({ diagram }: Readonly<{ diagram: Diagram }>) {
  switch (diagram.kind) {
    case 'bars':
      return <Bars diagram={diagram} />;
    case 'triangle':
      return <Triangle diagram={diagram} />;
    case 'parabola':
      return <Parabola diagram={diagram} />;
    case 'dots':
      return <Dots diagram={diagram} />;
    case 'wave':
      return <Wave diagram={diagram} />;
    case 'flow':
      return <Flow diagram={diagram} />;
  }
}

/** Pictures for visual learners, drawn from the lesson's numbers (SVG, theme colours). */
export function DiagramView({ diagram }: Readonly<{ diagram: Diagram }>) {
  const caption = 'title' in diagram ? diagram.title : TITLE[diagram.kind];
  return (
    <figure className="rounded-card bg-white p-5 shadow-card">
      <p className="font-mono text-xs uppercase tracking-widest text-jacaranda-700">See it</p>
      <svg
        viewBox={`0 0 ${WIDTH} ${heightOf(diagram)}`}
        role="img"
        aria-label={caption}
        className="mt-2 w-full max-w-lg"
      >
        <Drawing diagram={diagram} />
      </svg>
      <figcaption className="mt-1 text-sm font-semibold">{caption}</figcaption>
    </figure>
  );
}
