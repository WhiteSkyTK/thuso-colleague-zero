import { CAUSE_LABEL, FORMAT_LABEL } from '@/lib/labels';
import type { LearnerCard } from '@/lib/runView';

const BADGE = 'rounded-full px-2 py-0.5 text-xs font-semibold text-ink';

function Badges({ card }: Readonly<{ card: LearnerCard }>) {
  return (
    <div className="flex flex-wrap gap-1">
      {card.fixes > 0 && <span className={`${BADGE} bg-sun`}>↻ Fixed by reviewer</span>}
      {card.isDelivered && <span className={`${BADGE} bg-leaf`}>✓ Sent</span>}
      {card.isEscalated && <span className={`${BADGE} bg-ember-500`}>! Needs a human</span>}
    </div>
  );
}

function Card({ card }: Readonly<{ card: LearnerCard }>) {
  const { diagnosis, plan } = card;
  return (
    <li className="flex flex-col gap-3 rounded-card bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-mono text-lg font-semibold">{card.learnerId}</h3>
        <Badges card={card} />
      </div>
      {diagnosis && (
        <>
          <p className="font-medium">
            Risk {diagnosis.riskScore} · Root cause: {CAUSE_LABEL[diagnosis.primaryCause]}
          </p>
          <p className="text-sm">{diagnosis.explanation}</p>
          <ul className="flex flex-wrap gap-1" aria-label="Weak topics">
            {diagnosis.weakTopics.map((weak) => (
              <li key={weak.topic} className="rounded-full bg-jacaranda-50 px-2 py-0.5 text-xs">
                {weak.topic} · {weak.scorePct}% · CAPS level {weak.capsLevel}
              </li>
            ))}
          </ul>
          <p className="text-sm">
            Learns best with:{' '}
            <strong>
              {diagnosis.preferredFormats.map((format) => FORMAT_LABEL[format]).join(', ')}
            </strong>
          </p>
        </>
      )}
      {plan && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold">
            2-week plan · support session {plan.supportSession.date} at {plan.supportSession.time}
          </summary>
          <ol className="mt-2 flex flex-col gap-1">
            {plan.sessions.map((session) => (
              <li key={`${session.day}-${session.topic}`}>
                <strong>Day {session.day}</strong> · {session.topic} · {session.rung} ·{' '}
                {FORMAT_LABEL[session.format]} — {session.activity}{' '}
                <span className="font-mono text-xs">
                  ({session.resourceIds.length > 0 ? session.resourceIds.join(', ') : 'teacher-led'}
                  )
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </li>
  );
}

/** One card per at-risk learner: why they are slipping, how they learn and their plan. */
export function LearnerCards({ cards }: Readonly<{ cards: readonly LearnerCard[] }>) {
  return (
    <section aria-labelledby="learners-heading" className="flex flex-col gap-3">
      <h2 id="learners-heading" className="font-display text-2xl font-extrabold uppercase">
        Learners at risk ({cards.length})
      </h2>
      <ul className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.learnerId} card={card} />
        ))}
      </ul>
    </section>
  );
}
