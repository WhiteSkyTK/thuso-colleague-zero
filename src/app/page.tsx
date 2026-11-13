import Link from 'next/link';
import { Marquee } from '@/components/home/Marquee';
import { ParallaxScene } from '@/components/parallax/ParallaxScene';
import { SiteNav } from '@/components/ui/SiteNav';
import { AGENT_META, WORKER_AGENTS } from '@/core/config/constants';

const LOOP = [
  {
    stage: 'Goal',
    agent: AGENT_META.SYS,
    text: 'The lecturer types one goal in plain words, for any subject.',
  },
  {
    stage: 'Plan',
    agent: AGENT_META.PL,
    text: 'The Planner turns the goal and the class data into steps, and re-plans when something changes.',
  },
  {
    stage: 'Act',
    agent: AGENT_META.AN,
    text: 'The Analyst finds who is at risk and the root cause: attendance, homework, falling marks or one weak topic.',
  },
  {
    stage: 'Check',
    agent: AGENT_META.RV,
    text: 'The Reviewer runs eight checks on every plan: cause addressed, format fit, workload, privacy and more.',
  },
  {
    stage: 'Correct',
    agent: AGENT_META.CO,
    text: 'The Coach fixes what the Reviewer flagged, and the fix is checked again.',
  },
  {
    stage: 'Deliver',
    agent: AGENT_META.MS,
    text: 'The Messenger sends each plan, books a support session and briefs the lecturer.',
  },
] as const;

const FORMATS = [
  { icon: '✎', name: 'Worked examples', text: 'Step-by-step solutions, one rung at a time.' },
  { icon: '◇', name: 'Patterns', text: 'Spot the rule, then predict the next one.' },
  { icon: '▣', name: 'Visual story', text: 'A comic-strip story that carries the idea.' },
  { icon: '♪', name: 'Audio', text: 'Short listen-and-repeat explanations.' },
  { icon: '✓', name: 'Exam practice', text: 'Past-paper questions with marked answers.' },
] as const;

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteNav />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-6 pt-4 sm:px-6">
        <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
          A learner-support colleague · Melsoft Colleague Zero 2026
        </p>
        <h1 className="font-display text-[length:var(--text-hero)] font-extrabold uppercase leading-[0.85]">
          Meet Thuso.
          <span className="block font-extralight text-jacaranda-500">Your newest colleague.</span>
        </h1>
        <p className="max-w-2xl text-xl">
          Give Thuso one goal. Five AI agents find the learners at risk, work out <em>why</em>,
          write each one a catch-up plan in the way they learn best, check their own work and
          deliver it.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/run"
            className="rounded-full bg-ember-700 px-8 py-3 text-lg font-bold text-white shadow-card"
          >
            Watch it work
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-jacaranda-500 px-8 py-3 text-lg font-bold text-white shadow-card"
          >
            Open the school portal
          </Link>
          <a href="#how" className="rounded-full border-2 border-ink px-8 py-3 text-lg font-bold">
            How it works
          </a>
        </div>
      </section>

      <ParallaxScene className="h-[clamp(260px,38vw,440px)] w-full" />
      <Marquee />

      <section id="how" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-5xl font-extrabold uppercase">
          Goal → Deliver, with no human in the loop
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOOP.map(({ stage, agent, text }, index) => (
            <li key={stage} className="flex flex-col gap-2 rounded-card bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-extrabold uppercase">
                  {index + 1}. {stage}
                </span>
                <span
                  className="rounded-full px-3 py-0.5 font-mono text-xs font-semibold"
                  style={{
                    backgroundColor: `var(${agent.colorToken})`,
                    color: `var(${agent.textToken})`,
                  }}
                >
                  {agent.code} · {agent.name}
                </span>
              </div>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-ink py-12 text-paper">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-5xl font-extrabold uppercase">
            Every learner learns differently
          </h2>
          <p className="mt-2 max-w-3xl text-lg">
            Thuso reads each learner&apos;s reflections and results, then builds every topic up a
            scaffold ladder on the CAPS scale in the format that works for them. The Reviewer
            rejects a plan that ignores it.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {FORMATS.map((format) => (
              <li key={format.name} className="rounded-card bg-jacaranda-700 p-4">
                <span aria-hidden="true" className="text-3xl">
                  {format.icon}
                </span>
                <p className="mt-1 font-display text-2xl font-extrabold uppercase">{format.name}</p>
                <p className="text-sm">{format.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:px-6">
        <h2 className="font-display text-5xl font-extrabold uppercase">Meet the team</h2>
        <ul className="flex flex-wrap gap-2" aria-label="The agents">
          {WORKER_AGENTS.map((agent) => (
            <li
              key={agent.code}
              className="rounded-full px-4 py-1 font-display text-lg font-extrabold uppercase"
              style={{
                backgroundColor: `var(${agent.colorToken})`,
                color: `var(${agent.textToken})`,
              }}
            >
              {agent.sign} · {agent.name}
            </li>
          ))}
        </ul>
        <Link
          href="/run"
          className="rounded-full bg-ember-700 px-8 py-3 text-lg font-bold text-white shadow-card"
        >
          Watch it work
        </Link>
      </section>

      <footer className="mt-auto border-t border-ink/10 px-4 py-6 text-center text-sm">
        Synthetic class data only · built at Melsoft Colleague Zero, Johannesburg, November 2026 —
        jacaranda season.
      </footer>
    </main>
  );
}
