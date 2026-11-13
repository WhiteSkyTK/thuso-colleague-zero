import { AGENT_META } from '@/core/config/constants';
import type { AgentCode } from '@/core/domain/codes';

const WORKERS = Object.values(AGENT_META).filter((agent) => agent.code !== 'SYS');

const STATUS = {
  idle: { icon: '○', label: 'idle' },
  working: { icon: '●', label: 'working' },
  done: { icon: '✓', label: 'done' },
} as const;

interface AgentChipsProps {
  activeAgent: AgentCode | null;
  seenAgents: readonly AgentCode[];
}

/** One chip per agent: code, name and what it is doing — never colour alone. */
export function AgentChips({ activeAgent, seenAgents }: Readonly<AgentChipsProps>) {
  const statusOf = (code: AgentCode): keyof typeof STATUS => {
    if (code === activeAgent) {
      return 'working';
    }
    return seenAgents.includes(code) ? 'done' : 'idle';
  };

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Agents">
      {WORKERS.map((agent) => {
        const status = STATUS[statusOf(agent.code)];
        return (
          <li
            key={agent.code}
            className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            style={{
              backgroundColor: `var(${agent.colorToken})`,
              color: `var(${agent.textToken})`,
            }}
          >
            <span className="font-mono font-semibold">{agent.code}</span>
            <span>{agent.name}</span>
            <span aria-hidden="true">{status.icon}</span>
            <span>{status.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
