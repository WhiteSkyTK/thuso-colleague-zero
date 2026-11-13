import type { Metadata } from 'next';
import { PortalMascot } from '@/components/mascot/PortalMascot';
import { DeletePaperButton } from '@/components/papers/DeletePaperButton';
import { PaperForm } from '@/components/papers/PaperForm';
import { requireUser } from '@/lib/auth';
import { DBE_PAST_PAPERS_URL } from '@/lib/labels';
import { school } from '@/lib/school';
import { subjectsInView } from '@/lib/subjectsInView';
import { deletePaperAction, savePaperAction } from './actions';

export const metadata: Metadata = { title: 'Past papers — Thuso' };

export default async function PastPapersPage() {
  const user = await requireUser();
  const subjects = await subjectsInView(user);
  const { papers } = await school();
  const list = await papers.list([...new Set(subjects.map((s) => s.grade))]);
  const canEdit = user.role !== 'learner';
  const nameOf = new Map(subjects.map((s) => [`${s.grade}|${s.id}`, s.name]));
  const visible = list.filter((p) => nameOf.has(`${p.grade}|${p.subjectId}`));

  return (
    <>
      <section>
        <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
          Past papers
        </p>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">
          Practise like the real exam
        </h1>
        <p className="mt-2 max-w-2xl">
          Papers and memos your teachers picked for your grade. The full official archive is on the{' '}
          <a
            href={DBE_PAST_PAPERS_URL}
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline"
          >
            Department of Basic Education site ↗
          </a>
          .
        </p>
      </section>

      {canEdit && subjects.length > 0 && (
        <details className="rounded-card bg-white p-5 shadow-card" open={visible.length === 0}>
          <summary className="cursor-pointer font-display text-2xl font-extrabold uppercase">
            + Add a past paper
          </summary>
          <div className="mt-4">
            <PaperForm subjects={subjects} onSave={savePaperAction} />
          </div>
        </details>
      )}

      {visible.length === 0 ? (
        <p className="rounded-card bg-white p-4 shadow-card">
          No papers yet.{' '}
          {canEdit
            ? 'Add the first one above.'
            : 'Use the official DBE archive while your teacher adds some.'}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((paper) => (
            <li
              key={paper.id}
              className="flex flex-col gap-2 rounded-card bg-white p-4 shadow-card"
            >
              <p className="font-mono text-xs uppercase tracking-wide text-jacaranda-700">
                Grade {paper.grade} · {nameOf.get(`${paper.grade}|${paper.subjectId}`)} ·{' '}
                {paper.year} · {paper.paper}
              </p>
              <p className="font-display text-2xl font-extrabold uppercase">{paper.title}</p>
              {paper.topics.length > 0 && (
                <p className="text-sm">Covers: {paper.topics.join(', ')}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-ember-700 px-4 py-1.5 text-sm font-bold text-white"
                >
                  Open the paper ↗
                </a>
                {paper.memoUrl && (
                  <a
                    href={paper.memoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border-2 border-ink/20 px-4 py-1.5 text-sm font-semibold"
                  >
                    Memo ↗
                  </a>
                )}
              </div>
              {canEdit && (
                <details>
                  <summary className="cursor-pointer text-sm font-semibold underline">Edit</summary>
                  <div className="mt-3 flex flex-col gap-3">
                    <PaperForm subjects={subjects} onSave={savePaperAction} paper={paper} />
                    <DeletePaperButton
                      target={{
                        id: paper.id,
                        grade: paper.grade,
                        subjectId: paper.subjectId,
                        title: paper.title,
                      }}
                      onDelete={deletePaperAction}
                    />
                  </div>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
      <PortalMascot
        user={user}
        tips={[
          canEdit
            ? 'Add a paper once and every learner in that grade sees it, with the memo.'
            : 'Try one past paper question a day — then check the memo straight away.',
        ]}
      />
    </>
  );
}
