const ITEMS = [
  '32 learners analysed',
  'Root cause found for every learner at risk',
  'Plans in the format each learner learns best',
  'Mistakes caught and fixed by the Reviewer',
  'Human interventions: 0',
] as const;

function Row() {
  return (
    <ul className="flex shrink-0 items-center gap-8 pr-8">
      {ITEMS.map((item) => (
        <li key={item} className="flex items-center gap-8 whitespace-nowrap">
          <span>{item}</span>
          <span aria-hidden="true" className="text-ember-700">
            ✱
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The ticker band from DESIGN.md §5.4; pauses on hover and focus. */
export function Marquee() {
  return (
    <section aria-label="What a run does" className="marquee overflow-hidden bg-blush py-3">
      <div
        className="scene-strip font-display text-2xl font-extrabold uppercase"
        style={{ animationDuration: '40s' }}
      >
        <Row />
        <div aria-hidden="true">
          <Row />
        </div>
      </div>
    </section>
  );
}
