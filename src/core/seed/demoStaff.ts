import type { Role } from '../domain/schoolUser';

export interface StaffMember {
  id: string;
  role: Exclude<Role, 'learner'>;
  email: string;
  firstName: string;
  lastName: string;
  /** Subjects taught in every grade. */
  teaches: readonly string[];
}

/** Invented staff on example.org. Teachers teach their subjects in every grade. */
export const DEMO_STAFF: readonly StaffMember[] = [
  {
    id: 'S-101',
    role: 'teacher',
    email: 'maths.teacher@school.example.org',
    firstName: 'Nomvula',
    lastName: 'Khoza',
    teaches: ['MATH'],
  },
  {
    id: 'S-102',
    role: 'teacher',
    email: 'science.teacher@school.example.org',
    firstName: 'Pieter',
    lastName: 'Botha',
    teaches: ['PHSC'],
  },
  {
    id: 'S-103',
    role: 'teacher',
    email: 'english.teacher@school.example.org',
    firstName: 'Thandeka',
    lastName: 'Mokoena',
    teaches: ['ENGL'],
  },
  {
    id: 'S-104',
    role: 'teacher',
    email: 'life.teacher@school.example.org',
    firstName: 'Sibusiso',
    lastName: 'Dube',
    teaches: ['LIFE'],
  },
  {
    id: 'S-105',
    role: 'teacher',
    email: 'commerce.teacher@school.example.org',
    firstName: 'Karabo',
    lastName: 'Moloi',
    teaches: ['LIFO', 'ACCN'],
  },
  {
    id: 'S-201',
    role: 'principal',
    email: 'principal@school.example.org',
    firstName: 'Grace',
    lastName: 'Molefe',
    teaches: [],
  },
  {
    id: 'S-301',
    role: 'admin',
    email: 'admin@school.example.org',
    firstName: 'School',
    lastName: 'Admin',
    teaches: [],
  },
];
