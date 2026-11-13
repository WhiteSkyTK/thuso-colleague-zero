'use client';

import { useState } from 'react';
import type { LessonBlock } from '@/core/lessons/buildLesson';
import { DiagramView } from './DiagramView';
import { QuestionMaker } from './QuestionMaker';
import { SpeakButton } from './SpeakButton';

type Block<K extends LessonBlock['kind']> = Readonly<{ block: Extract<LessonBlock, { kind: K }> }>;

const CARD = 'rounded-card bg-white p-5 shadow-card';
const LABEL = 'font-mono text-xs uppercase tracking-widest text-jacaranda-700';
const BUTTON = 'rounded-full bg-jacaranda-500 px-4 py-1.5 text-sm font-bold text-white';

function StepsBlock({ block }: Block<'steps'>) {
  const [shown, setShown] = useState(0);
  const isDone = shown >= block.steps.length;
  return (
    <section className={CARD}>
      <p className={LABEL}>Worked example</p>
      <p className="mt-1 text-lg font-semibold">{block.question}</p>
      <ol className="mt-3 flex flex-col gap-2">
        {block.steps.slice(0, shown).map((step, at) => (
          <li key={step} className="ask-reply rounded-lg bg-jacaranda-50 px-3 py-2">
            <strong>Step {at + 1}.</strong> {step}
          </li>
        ))}
      </ol>
      {isDone ? (
        <p className="ask-reply mt-3 font-display text-2xl font-extrabold">✓ {block.answer}</p>
      ) : (
        <button type="button" onClick={() => setShown((n) => n + 1)} className={`mt-3 ${BUTTON}`}>
          {shown === 0 ? 'Show the first step' : 'Next step'}
        </button>
      )}
    </section>
  );
}

function StoryBlock({ block }: Block<'story'>) {
  return (
    <section aria-label="Picture story">
      <p className={LABEL}>Picture story</p>
      <ol className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {block.panels.map((panel, at) => (
          <li
            key={panel.caption}
            className="flex flex-col gap-2 rounded-card bg-white p-4 shadow-card"
          >
            <span aria-hidden="true" className="text-4xl">
              {panel.icon}
            </span>
            <span className="sr-only">Panel {at + 1}:</span>
            <span>{panel.caption}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PatternBlock({ block }: Block<'pattern'>) {
  const [isRevealed, setRevealed] = useState(false);
  const last = block.rows.length - 1;
  return (
    <section className={CARD}>
      <p className={LABEL}>Spot the pattern</p>
      <table className="mt-2 w-full border-separate border-spacing-y-1 text-left">
        <tbody>
          {block.rows.map(([left, right], at) => (
            <tr key={left}>
              <td className="rounded-l-lg bg-jacaranda-50 px-3 py-2 font-mono">{left}</td>
              <td className="rounded-r-lg bg-jacaranda-50 px-3 py-2 font-mono font-semibold">
                {at === last && !isRevealed ? '?' : right}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isRevealed ? (
        <p className="ask-reply mt-2 font-semibold">The rule: {block.rule}</p>
      ) : (
        <button type="button" onClick={() => setRevealed(true)} className={`mt-2 ${BUTTON}`}>
          I have a guess — show me
        </button>
      )}
    </section>
  );
}

function ListenBlock({ block }: Block<'listen'>) {
  return (
    <section className={CARD}>
      <p className={LABEL}>Listen</p>
      <div className="mt-2">
        <SpeakButton text={block.script} label="▶ Play the whole lesson" />
      </div>
      <details className="mt-3" open>
        <summary className="cursor-pointer text-sm font-semibold">Read along</summary>
        <p className="mt-1">{block.script}</p>
      </details>
    </section>
  );
}

function QuestionsBlock({ block }: Block<'questions'>) {
  return (
    <section className={CARD}>
      <p className={LABEL}>Try it — exam style</p>
      <ol className="mt-2 flex flex-col gap-2">
        {block.items.map((item, at) => (
          <li key={item.question} className="rounded-lg bg-jacaranda-50 px-3 py-2">
            <p className="font-semibold">
              {at + 1}. {item.question}
            </p>
            <details>
              <summary className="cursor-pointer text-sm underline">Show the answer</summary>
              <p className="ask-reply mt-1">{item.answer}</p>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}

function GossipBlock({ block }: Block<'gossip'>) {
  return (
    <section className={CARD} aria-label="Thuso spills the tea">
      <p className={LABEL}>Thuso spills the tea</p>
      <ol className="mt-2 flex flex-col gap-2">
        {block.messages.map((message, at) => (
          <li
            key={message}
            className="ask-reply max-w-[85%] rounded-2xl rounded-bl-sm bg-jacaranda-50 px-3 py-2"
            style={{ animationDelay: `${at * 350}ms` }}
          >
            <span aria-hidden="true">🦉 </span>
            {message}
          </li>
        ))}
      </ol>
    </section>
  );
}

function RealWorldBlock({ block }: Block<'realWorld'>) {
  return (
    <section className={CARD}>
      <p className={LABEL}>In real life</p>
      <p className="mt-1 text-lg font-semibold">🌍 {block.question}</p>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm underline">Work it out, then check</summary>
        <p className="ask-reply mt-1 font-semibold">{block.answer}</p>
      </details>
    </section>
  );
}

/** One part of a lesson, drawn for its kind. */
export function LessonBlockView({ block }: Readonly<{ block: LessonBlock }>) {
  switch (block.kind) {
    case 'gossip':
      return <GossipBlock block={block} />;
    case 'realWorld':
      return <RealWorldBlock block={block} />;
    case 'diagram':
      return <DiagramView diagram={block.diagram} />;
    case 'maker':
      return <QuestionMaker makerKey={block.key} />;
    case 'idea':
      return (
        <section className={CARD}>
          <p className={LABEL}>Key idea</p>
          <p className="mt-1 text-xl font-semibold">{block.text}</p>
        </section>
      );
    case 'steps':
      return <StepsBlock block={block} />;
    case 'story':
      return <StoryBlock block={block} />;
    case 'pattern':
      return <PatternBlock block={block} />;
    case 'listen':
      return <ListenBlock block={block} />;
    case 'mistake':
      return (
        <p className="rounded-card border-2 border-ember-700 bg-white p-4">
          <strong>⚠ Watch out:</strong> {block.text}
        </p>
      );
    case 'questions':
      return <QuestionsBlock block={block} />;
  }
}
