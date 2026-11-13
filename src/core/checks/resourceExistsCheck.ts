import { fail, pass, type ReviewCheck } from './ReviewCheck';

const ID = 'resource-exists';

/** Grounding: a plan may only cite resources that are really in the catalogue. */
export const resourceExistsCheck: ReviewCheck = ({ plan, resources }) => {
  const known = new Set(resources.map((resource) => resource.id));
  const cited = plan.sessions.flatMap((session) => session.resourceIds);
  const unknown = [...new Set(cited.filter((id) => !known.has(id)))];
  if (unknown.length === 0) {
    return pass(ID);
  }
  return fail(
    ID,
    `${unknown.join(', ')} ${unknown.length === 1 ? 'is' : 'are'} not in the resource catalogue`,
    'Cite only resource ids from the catalogue you were given. Where a topic has no resource, plan a teacher-led session with no resource id.',
  );
};
