import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LessonBlockView } from '@/components/lesson/LessonBlockView';
import { LessonFeedback } from '@/components/lesson/LessonFeedback';
import { LessonNotes } from '@/components/lesson/LessonNotes';
import { SpeakButton } from '@/components/lesson/SpeakButton';
import { PortalMascot } from '@/components/mascot/PortalMascot';
import { GRADES } from '@/core/domain/schoolUser';
import { LEARNING_FORMATS, LearningFormatSchema } from '@/core/domain/vocab';
import { buildLesson } from '@/core/lessons/buildLesson';
import { requireUser } from '@/lib/auth';
import { FORMAT_ICON, FORMAT_LABEL } from '@/lib/labels';
import { classFor, school } from '@/lib/school';
import { lessonFeedbackAction, saveLessonNoteAction } from '../actions';

export const metadata: Metadata = { title: 'Lesson — Thuso' };

type SearchParams = Promise<{ format?: string; grade?: string }>;

const average = (values: readonly number[]) =>
  values.length ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : undefined;

/** A "Study next" resource opened as a lesson, in the learner's format (or another they pick). */
export default async function LessonPage({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ id: string }>; searchParams: SearchParams }>) {
  const [{ id }, query, user] = await Promise.all([params, searchParams, requireUser()]);
  const askedGrade = GRADES.find((g) => String(g) === query.grade) ?? GRADES[0];
  const grade = user.role === 'learner' ? (user.grade ?? GRADES[0]) : askedGrade;
  const data = await classFor(grade);
  const resource = data.resources.find((r) => r.id === id);
  if (!resource) {
    notFound();
  }
  const learner = data.learners.find((l) => l.id === user.id);
  const asked = LearningFormatSchema.safeParse(query.format);
  const format = asked.success ? asked.data : (learner?.preferredFormats[0] ?? resource.format);
  const subjectName =
    data.subjects.find((s) => s.id === resource.subjectId)?.name ?? resource.subjectId;
  const lesson = buildLesson(resource, subjectName, format);
  const myScore = average(
    data.results
      .filter(
        (r) =>
          r.learnerId === user.id &&
          r.subjectId === resource.subjectId &&
          r.topic === resource.topic,
      )
      .map((r) => r.scorePct),
  );
  const isLearner = user.role === 'learner';
  const gradeQuery = isLearner ? '' : '&grade=' + String(grade);
  const backHref = isLearner ? '/portal/learner' : '/portal/teacher';
  const myNotes = isLearner ? await (await school()).notes.lessonNote(user.id, resource.id) : '';

  return (
    <>
      <section>
        <p className="font-mono text-sm uppercase tracking-widest text-jacaranda-700">
          Lesson · Grade {grade} · {subjectName} · {lesson.topic}
        </p>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-none">
          {lesson.title}
        </h1>
        <p className="mt-2 text-lg">
          {FORMAT_ICON[format]} {FORMAT_LABEL[format]} · {lesson.minutes} min
          {myScore !== undefined && (
            <> · you have {myScore}% on this topic — let&apos;s move it up</>
          )}
        </p>
        {!lesson.hasTopicNotes && (
          <p className="mt-1 text-sm">
            Thuso has no notes for this topic yet, so this is a study method that works for any
            topic.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-card bg-ink p-5 text-paper shadow-card">
        <p className="font-mono text-xs uppercase tracking-widest">In 30 seconds</p>
        <p>{lesson.summary}</p>
        <div>
          <SpeakButton text={lesson.summary} label="🔊 Say it out loud" />
        </div>
      </section>

      <div className="flex flex-col gap-4">
        {lesson.blocks.map((block) => (
          <LessonBlockView key={format + block.kind} block={block} />
        ))}
      </div>

      {isLearner && (
        <>
          <LessonNotes
            initial={myNotes}
            summary={lesson.summary}
            onSave={saveLessonNoteAction.bind(null, resource.id)}
          />
          <LessonFeedback
            onAnswer={lessonFeedbackAction.bind(null, { resourceId: resource.id, format })}
          />
        </>
      )}

      <nav aria-label="Try it another way" className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">Try it another way:</span>
        {LEARNING_FORMATS.filter((f) => f !== format).map((f) => (
          <Link
            key={f}
            href={`/portal/lesson/${resource.id}?format=${f}${gradeQuery}`}
            className="rounded-full bg-white px-3 py-1 text-sm font-semibold shadow-card"
          >
            {FORMAT_ICON[f]} {FORMAT_LABEL[f]}
          </Link>
        ))}
      </nav>
      <Link href={backHref} className="self-start font-semibold underline">
        ← Back
      </Link>
      <PortalMascot
        user={user}
        tips={[
          `This lesson is in ${FORMAT_LABEL[format].toLowerCase()} — tap “Try it another way” if it does not click.`,
          'Tell me if it helped. I use your answers to choose how to teach you next time.',
        ]}
      />
    </>
  );
}
