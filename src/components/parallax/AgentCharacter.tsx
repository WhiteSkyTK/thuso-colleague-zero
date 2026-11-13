import type { AgentMeta } from '@/core/config/constants';

interface AgentCharacterProps {
  readonly agent: AgentMeta;
  readonly isActive: boolean;
}

const INK = { fill: 'var(--c-ink-900)' };
const PAPER = { fill: 'var(--c-paper)' };

/** Small prop per agent (DESIGN.md §4). Drawn in the character's own 80 × 150 box. */
function Prop({ code }: Readonly<{ code: AgentMeta['code'] }>) {
  switch (code) {
    case 'PL':
      return <rect x={8} y={78} width={16} height={22} rx={2} style={PAPER} />;
    case 'AN':
      return (
        <g>
          <circle cx={14} cy={84} r={8} fill="none" stroke="var(--c-ink-900)" strokeWidth={3} />
          <rect x={18} y={90} width={4} height={12} transform="rotate(-35 20 96)" style={INK} />
        </g>
      );
    case 'CO':
      return <rect x={46} y={72} width={14} height={28} rx={4} style={{ fill: 'var(--c-jacaranda-700)' }} />;
    case 'RV':
      return (
        <g fill="none" stroke="var(--c-paper)" strokeWidth={2}>
          <circle cx={32} cy={48} r={4} />
          <circle cx={43} cy={48} r={4} />
        </g>
      );
    default:
      return <path d="M22 40 Q37 26 52 40 Z" style={{ fill: 'var(--c-leaf-500)' }} />;
  }
}

/** One flat, original character carrying its agent's sign; legs stride while the street moves. */
export function AgentCharacter({ agent, isActive }: AgentCharacterProps) {
  const clothes = { fill: `var(${agent.colorToken})` };
  return (
    <svg
      viewBox="0 0 80 150"
      className={`agent-walker ${isActive ? 'is-active' : ''}`}
      role="img"
      aria-label={`${agent.name} carrying a ${agent.sign} sign${isActive ? ', working now' : ''}`}
    >
      <rect x={58} y={24} width={4} height={60} style={INK} />
      <rect x={4} y={2} width={72} height={26} rx={4} style={clothes} />
      <text
        x={40}
        y={21}
        textAnchor="middle"
        className="font-display text-[17px] font-extrabold"
        style={{ fill: `var(${agent.textToken})` }}
      >
        {agent.sign}
      </text>
      <g className="agent-bob">
        <circle cx={37} cy={48} r={15} style={INK} />
        <circle cx={32} cy={46} r={2} style={PAPER} />
        <circle cx={43} cy={46} r={2} style={PAPER} />
        <path d="M31 53 Q37 58 43 53" fill="none" stroke="var(--c-paper)" strokeWidth={2} strokeLinecap="round" />
        <rect x={20} y={64} width={36} height={44} rx={12} style={clothes} />
        <rect x={50} y={70} width={14} height={7} rx={3.5} transform="rotate(-30 50 74)" style={clothes} />
        <Prop code={agent.code} />
      </g>
      <rect x={25} y={104} width={9} height={36} rx={4} className="agent-leg" style={INK} />
      <rect x={41} y={104} width={9} height={36} rx={4} className="agent-leg agent-leg-b" style={INK} />
    </svg>
  );
}
