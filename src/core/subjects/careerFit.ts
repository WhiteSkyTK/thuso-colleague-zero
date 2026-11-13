import { PATHWAYS, type Pathway } from '../pathways/pathwayCatalogue';
import { chosenNames } from './nscSubjects';

export interface CareerFit {
  pathway: Pathway;
  /** Required subjects this choice does not include. */
  missing: string[];
}

/** Which study routes a subject choice keeps open, and what a closed route is missing. */
export function careerFit(codes: readonly string[]): { open: CareerFit[]; closed: CareerFit[] } {
  const names = new Set(chosenNames(codes));
  const fits = PATHWAYS.map((pathway) => ({
    pathway,
    missing: pathway.requires.map((need) => need.subject).filter((subject) => !names.has(subject)),
  }));
  return {
    open: fits.filter((fit) => fit.missing.length === 0),
    closed: fits.filter((fit) => fit.missing.length > 0),
  };
}
