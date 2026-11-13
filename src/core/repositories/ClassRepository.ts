import type { Resource, SchoolDay, Teacher } from '../domain/classData';
import type { LearnerRecord } from '../domain/learnerRecord';

/** What the Planner may know about the class before it plans. */
export interface ClassOverview {
  learnerCount: number;
  subjects: { id: string; name: string; grade: number }[];
  weeksOfData: number;
}

export interface ClassOverviewSource {
  overview(): ClassOverview;
}

/** Analyst: every learner's record for one subject, in one call (no N+1). */
export interface LearnerRecords {
  recordsFor(subjectId: string): LearnerRecord[];
}

/** Coach and Reviewer: the only resources a plan may cite. */
export interface ResourceCatalog {
  forSubject(subjectId: string): readonly Resource[];
}

export interface SchoolCalendar {
  days(): readonly SchoolDay[];
}

export interface Contacts {
  firstName: string;
  learnerEmail: string;
  guardianName: string;
  guardianEmail: string;
}

/** Messenger: the only people a message may go to. */
export interface ContactDirectory {
  contactsOf(learnerId: string): Contacts | undefined;
  teacher(): Teacher;
}
