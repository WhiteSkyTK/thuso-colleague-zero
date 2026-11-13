import { fail, pass, type ReviewCheck } from './ReviewCheck';

const ID = 'support-session';

/** The booked support session must be a real free slot in the school calendar. */
export const supportSessionCheck: ReviewCheck = ({ plan, calendar }) => {
  const { date, time } = plan.supportSession;
  const day = calendar.find((candidate) => candidate.date === date);
  if (day?.freeSlots.includes(time)) {
    return pass(ID);
  }
  return fail(
    ID,
    `${date} ${time} is not a free support slot in the school calendar`,
    'Book the support session in one of the free slots you were given.',
  );
};
