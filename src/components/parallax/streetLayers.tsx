import type { ComponentType } from 'react';

/** One depth layer of the street (docs/DESIGN.md §5.1). Speed 0 = static, 1 = road. */
export interface SceneLayer {
  readonly id: string;
  readonly speed: number;
  readonly Tile: ComponentType;
}

/** Every tile shares this box so seams line up when two copies sit side by side. */
const VIEW_BOX = '0 0 2000 400';
const TILE_CLASS = 'scene-tile';

/** [x, width, height] of each far building; tops sit at 400 − height. */
const BUILDINGS = [
  [60, 90, 150], [160, 60, 210], [230, 110, 130], [360, 70, 250], [440, 110, 170],
  [1050, 80, 200], [1140, 60, 260], [1210, 120, 150], [1340, 70, 220], [1420, 90, 140],
  [1760, 90, 190], [1860, 70, 240],
] as const;

function SkylineTile() {
  return (
    <svg viewBox={VIEW_BOX} className={TILE_CLASS}>
      <polygon points="560,400 640,300 860,300 940,400" className="fill-sun/45" />
      <polygon points="1520,400 1590,320 1700,320 1760,400" className="fill-sun/45" />
      {BUILDINGS.map(([x, width, height]) => (
        <rect key={x} x={x} y={400 - height} width={width} height={height} className="fill-jacaranda-300/60" />
      ))}
      {/* A tall telecoms tower on the skyline — a generic shape, not a real landmark's artwork. */}
      <rect x={968} y={70} width={24} height={330} className="fill-jacaranda-300/70" />
      <rect x={942} y={92} width={76} height={34} rx={10} className="fill-jacaranda-300/70" />
      <rect x={978} y={28} width={4} height={44} className="fill-jacaranda-300/70" />
    </svg>
  );
}

const TREES = [
  { x: 130, size: 1 }, { x: 390, size: 0.8 }, { x: 650, size: 1.1 }, { x: 990, size: 0.9 },
  { x: 1250, size: 1 }, { x: 1560, size: 1.15 }, { x: 1840, size: 0.85 },
] as const;

function JacarandaTree({ x, size }: Readonly<{ x: number; size: number }>) {
  return (
    <g transform={`translate(${x} 400) scale(${size})`}>
      <path d="M-7 0 L-5 -120 L-40 -170 L-32 -176 L0 -132 L30 -180 L38 -174 L6 -118 L7 0 Z" className="fill-jacaranda-700" />
      <circle cx={-48} cy={-170} r={46} className="fill-jacaranda-500" />
      <circle cx={34} cy={-182} r={54} className="fill-jacaranda-500" />
      <circle cx={-4} cy={-214} r={50} className="fill-jacaranda-300" />
      <circle cx={70} cy={-146} r={36} className="fill-jacaranda-300" />
      <circle cx={-80} cy={-140} r={32} className="fill-jacaranda-300" />
    </g>
  );
}

function TreesTile() {
  return (
    <svg viewBox={VIEW_BOX} className={TILE_CLASS}>
      {TREES.map((tree) => (
        <JacarandaTree key={tree.x} x={tree.x} size={tree.size} />
      ))}
    </svg>
  );
}

const CLASSROOM_WINDOWS = [660, 740, 820, 1100, 1180, 1260];
const FENCE_POSTS = Array.from({ length: 50 }, (_, index) => index * 40 + 8);

function SchoolTile() {
  return (
    <svg viewBox={VIEW_BOX} className={TILE_CLASS}>
      <rect x={0} y={318} width={2000} height={30} className="fill-leaf/50" />
      <polygon points="590,190 1000,130 1410,190" className="fill-jacaranda-700" />
      <rect x={610} y={190} width={780} height={130} className="fill-blush" />
      {CLASSROOM_WINDOWS.map((x) => (
        <rect key={x} x={x} y={222} width={56} height={46} rx={4} className="fill-ink/80" />
      ))}
      {/* The lit staff-room window — the zoom target in DESIGN.md §5.2. */}
      <rect x={900} y={218} width={200} height={54} rx={6} className="fill-sun" />
      <rect x={968} y={278} width={64} height={42} className="fill-jacaranda-700" />
      <rect x={880} y={150} width={240} height={30} rx={6} className="fill-ink" />
      <text x={1000} y={171} textAnchor="middle" className="fill-paper font-display text-[20px] font-extrabold tracking-widest">
        JACARANDA HIGH
      </text>
      {FENCE_POSTS.filter((x) => x < 940 || x > 1060).map((x) => (
        <rect key={x} x={x} y={286} width={5} height={50} className="fill-ink/60" />
      ))}
      <rect x={0} y={296} width={940} height={4} className="fill-ink/60" />
      <rect x={1060} y={296} width={940} height={4} className="fill-ink/60" />
    </svg>
  );
}

const LANE_DASHES = Array.from({ length: 14 }, (_, index) => index * 143 + 20);

function RoadTile() {
  return (
    <svg viewBox={VIEW_BOX} className={TILE_CLASS}>
      <rect x={0} y={300} width={2000} height={42} className="fill-jacaranda-50" />
      <rect x={0} y={342} width={2000} height={6} className="fill-ink/40" />
      <rect x={0} y={348} width={2000} height={52} className="fill-ink" />
      {LANE_DASHES.map((x) => (
        <rect key={x} x={x} y={371} width={64} height={5} rx={2} className="fill-paper/80" />
      ))}
      <g transform="translate(1320 330)">
        <rect x={0} y={0} width={250} height={56} rx={12} className="fill-sun" />
        {[16, 66, 116, 166].map((x) => (
          <rect key={x} x={x} y={9} width={40} height={20} rx={3} className="fill-paper/90" />
        ))}
        <rect x={214} y={9} width={26} height={30} rx={3} className="fill-paper/90" />
        <rect x={0} y={36} width={250} height={6} className="fill-ink/70" />
        <circle cx={52} cy={58} r={13} className="fill-ink" />
        <circle cx={196} cy={58} r={13} className="fill-ink" />
      </g>
    </svg>
  );
}

function ForegroundTile() {
  return (
    <svg viewBox={VIEW_BOX} className={`${TILE_CLASS} blur-[1px]`}>
      {[420, 1380].map((x) => (
        <g key={x}>
          <rect x={x} y={150} width={9} height={250} className="fill-ink/85" />
          <rect x={x - 26} y={142} width={60} height={12} rx={6} className="fill-ink/85" />
          <ellipse cx={x - 18} cy={160} rx={14} ry={6} className="fill-sun/90" />
        </g>
      ))}
      {[150, 900, 1650].map((x) => (
        <ellipse key={x} cx={x} cy={404} rx={90} ry={34} className="fill-leaf/85" />
      ))}
    </svg>
  );
}

/** Layers behind the walking agents, far to near. */
export const BACK_LAYERS = [
  { id: 'far', speed: 0.1, Tile: SkylineTile },
  { id: 'mid-far', speed: 0.25, Tile: TreesTile },
  { id: 'mid', speed: 0.5, Tile: SchoolTile },
  { id: 'near', speed: 1, Tile: RoadTile },
] as const satisfies readonly SceneLayer[];

/** Layers in front of the agents. */
export const FRONT_LAYERS = [
  { id: 'foreground', speed: 1.4, Tile: ForegroundTile },
] as const satisfies readonly SceneLayer[];
