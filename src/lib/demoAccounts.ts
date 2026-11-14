import type { Role } from '@/core/domain/schoolUser';

export interface DemoAccount {
  key: string;
  role: Role;
  email: string;
  label: string;
  /** What this account shows off in the demo. */
  detail: string;
  /** Learners: their id, so the button can show their real name from the database. */
  learnerId?: string;
  className: string;
  /** Not shown to the room; presenters open /login?staff=1. Uses the admin password, server-side. */
  isHidden?: boolean;
}

/**
 * One-click accounts for judges and testers: a learner in each grade (each with a different reason
 * for slipping), both subject teachers and the principal. The shared password stays on the server.
 */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    key: 'learner-10',
    role: 'learner',
    email: 'l014@learners.example.org',
    label: 'Learner · Grade 10',
    detail: 'Missed lessons; learns with visual stories',
    learnerId: 'L-014',
    className: 'bg-sun text-ink',
  },
  {
    key: 'learner-11',
    role: 'learner',
    email: 'l103@learners.example.org',
    label: 'Learner · Grade 11',
    detail: 'Homework not handed in',
    learnerId: 'L-103',
    className: 'bg-sun text-ink',
  },
  {
    key: 'learner-12',
    role: 'learner',
    email: 'l205@learners.example.org',
    label: 'Learner · Grade 12',
    detail: 'One weak topic in Physical Sciences',
    learnerId: 'L-205',
    className: 'bg-sun text-ink',
  },
  {
    key: 'maths-teacher',
    role: 'teacher',
    email: 'maths.teacher@school.example.org',
    label: 'Teacher · Maths',
    detail: 'Ms Khoza, Grades 10–12',
    className: 'bg-teal text-ink',
  },
  {
    key: 'science-teacher',
    role: 'teacher',
    email: 'science.teacher@school.example.org',
    label: 'Teacher · Science',
    detail: 'Mr Botha, Physical Sciences',
    className: 'bg-teal text-ink',
  },
  {
    key: 'english-teacher',
    role: 'teacher',
    email: 'english.teacher@school.example.org',
    label: 'Teacher · English',
    detail: 'Ms Mokoena, English FAL',
    className: 'bg-teal text-ink',
  },
  {
    key: 'life-teacher',
    role: 'teacher',
    email: 'life.teacher@school.example.org',
    label: 'Teacher · Life Sciences',
    detail: 'Mr Dube, Grades 10–12',
    className: 'bg-teal text-ink',
  },
  {
    key: 'principal',
    role: 'principal',
    email: 'principal@school.example.org',
    label: 'Principal',
    detail: 'Mrs Molefe, whole school',
    className: 'bg-jacaranda-500 text-white',
  },
  {
    key: 'admin',
    role: 'admin',
    email: 'admin@school.example.org',
    label: 'Admin',
    detail: 'School set-up and accounts',
    className: 'bg-ink text-paper',
    isHidden: true,
  },
];
