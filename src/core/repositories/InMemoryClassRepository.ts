import type { ClassData, Resource, SchoolDay, Teacher } from '../domain/classData';
import type { LearnerRecord } from '../domain/learnerRecord';
import type {
  ClassOverview,
  ClassOverviewSource,
  ContactDirectory,
  Contacts,
  LearnerRecords,
  ResourceCatalog,
  SchoolCalendar,
} from './ClassRepository';

/** One class held in memory. Each agent sees it only through the narrow interface it needs. */
export class InMemoryClassRepository
  implements ClassOverviewSource, LearnerRecords, ResourceCatalog, SchoolCalendar, ContactDirectory
{
  constructor(private readonly data: ClassData) {}

  overview(): ClassOverview {
    return {
      learnerCount: this.data.learners.length,
      subjects: this.data.subjects.map(({ id, name, grade }) => ({ id, name, grade })),
      weeksOfData: Math.max(0, ...this.data.results.map((result) => result.week)),
    };
  }

  recordsFor(subjectId: string): LearnerRecord[] {
    const inSubject = this.data.results.filter((result) => result.subjectId === subjectId);
    const results = Map.groupBy(inSubject, (result) => result.learnerId);
    const attendance = Map.groupBy(this.data.attendance, (week) => week.learnerId);
    const homework = new Map(
      this.data.homework
        .filter((record) => record.subjectId === subjectId)
        .map((record) => [record.learnerId, record]),
    );
    const reflections = new Map(
      this.data.reflections.map((entry) => [entry.learnerId, entry.text]),
    );

    return this.data.learners
      .filter((learner) => results.has(learner.id))
      .map((learner) => {
        const weeks = attendance.get(learner.id);
        return {
          learnerId: learner.id,
          subjectId,
          preferredFormats: learner.preferredFormats,
          results: results.get(learner.id) ?? [],
          absencesByWeek: weeks
            ? [...weeks].sort((a, b) => a.week - b.week).map((week) => week.absences)
            : null,
          homework: homework.get(learner.id) ?? null,
          reflection: reflections.get(learner.id) ?? '',
        };
      });
  }

  forSubject(subjectId: string): readonly Resource[] {
    return this.data.resources.filter((resource) => resource.subjectId === subjectId);
  }

  days(): readonly SchoolDay[] {
    return this.data.calendar;
  }

  contactsOf(learnerId: string): Contacts | undefined {
    const learner = this.data.learners.find((candidate) => candidate.id === learnerId);
    return (
      learner && {
        firstName: learner.firstName,
        learnerEmail: learner.learnerEmail,
        guardianName: learner.guardianName,
        guardianEmail: learner.guardianEmail,
      }
    );
  }

  teacher(): Teacher {
    return this.data.teacher;
  }
}
