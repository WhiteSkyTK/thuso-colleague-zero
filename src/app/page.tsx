import Link from 'next/link';
import { AGENT_META } from '@/core/config/constants';

const WORKERS = Object.values(AGENT_META).filter((agent) => agent.code !== 'SYS');

const LOOP = ['Goal', 'Plan', 'Act', 'Check', 'Correct', 'Deliver'];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-8 p-6">
      <p className="font-mono text-sm uppercase tracking-widest">A learner-support colleague</p>
      <h1 className="font-display text-6xl font-extrabold uppercase leading-none sm:text-8xl">
        Meet Thuso — your newest colleague.
      </h1>
      <p className="max-w-2xl text-xl">
        Give Thuso one goal. A team of five AI agents finds the learners at risk, works out why,
        writes each one a catch-up plan, checks its own work and delivers it.
      </p>
      <ul className="flex flex-wrap gap-2" aria-label="The agents">
        {WORKERS.map((agent) => (
          <li
            key={agent.code}
            className="rounded-full px-4 py-1 font-display text-lg font-extrabold uppercase"
            style={{ backgroundColor: `var(${agent.colorToken})`, color: `var(${agent.textToken})` }}
          >
            {agent.sign} · {agent.name}
          </li>
        ))}
      </ul>
      <ol className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm" aria-label="How it works">
        {LOOP.map((stage, index) => (
          <li key={stage}>
            {index + 1}. {stage}
          </li>
        ))}
      </ol>
      <Link
        href="/run"
        className="self-start rounded-full bg-ember-700 px-8 py-3 text-lg font-bold text-white shadow-card"
      >
        Watch it work
      </Link>
    </main>
  );
}
