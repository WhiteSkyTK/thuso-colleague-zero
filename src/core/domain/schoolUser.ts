import { z } from 'zod';

export const ROLES = ['learner', 'teacher', 'principal', 'admin'] as const;
export const RoleSchema = z.enum(ROLES);
export type Role = z.infer<typeof RoleSchema>;

export const GRADES = [10, 11, 12] as const;
export type Grade = (typeof GRADES)[number];

/** A signed-in person. Learners have a grade; staff do not. */
export interface SchoolUser {
  id: string;
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
  grade: number | null;
}

/** What a teacher teaches: one subject in one grade. */
export interface TeachingAssignment {
  grade: number;
  subjectId: string;
}
