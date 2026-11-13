import type { SubjectChoice } from '@/components/papers/PaperForm';
import { GRADES, type SchoolUser } from '@/core/domain/schoolUser';
import { classFor, school } from './school';

/** Learners see their grade; teachers the subjects and grades they teach; others every grade. */
export async function subjectsInView(user: SchoolUser): Promise<SubjectChoice[]> {
  const { users } = await school();
  const teaching = user.role === 'teacher' ? await users.teachingOf(user.id) : [];
  const grades = user.role === 'learner' ? [user.grade ?? GRADES[0]] : [...GRADES];
  const classes = await Promise.all(grades.map((grade) => classFor(grade)));
  return classes.flatMap((data, at) => {
    const grade = grades[at] ?? GRADES[0];
    return data.subjects
      .filter(
        (s) =>
          user.role !== 'teacher' ||
          teaching.some((t) => t.grade === grade && t.subjectId === s.id),
      )
      .map((s) => ({ grade, id: s.id, name: s.name, topics: s.topics }));
  });
}
