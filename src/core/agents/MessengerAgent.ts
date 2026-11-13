import { CatchUpPlanSchema } from '../domain/catchUpPlan';
import type { StepRequest, StepResult } from '../domain/step';
import type { Outbox } from '../delivery/Outbox';
import { StepFailedError } from '../errors/AppError';
import type { LlmProvider } from '../llm/LlmProvider';
import type { RunContext } from '../orchestrator/RunContext';
import type { ContactDirectory } from '../repositories/ClassRepository';
import { ActionTable } from './ActionTable';
import { Agent } from './Agent';
import { singleItem } from './singleItem';
import type { StepAgent } from './StepAgent';

const PLAN_SUBJECT = 'Your 2-week catch-up plan';
const GUARDIAN_SUBJECT = 'A 2-week catch-up plan for your child';
const SUMMARY_SUBJECT = 'Thuso run summary';
const CLASS_SUBJECT_ID = 'class';

export interface MessengerDelivery {
  outbox: Outbox;
  /** Messages only ever go to people in this directory. */
  directory: ContactDirectory;
}

/** MS — delivers approved plans to learners and guardians, and the summary to the teacher. */
export class MessengerAgent extends Agent<StepRequest, StepResult> implements StepAgent {
  private readonly table = new ActionTable({
    'deliver-plan': {
      description: 'Send one approved plan to the learner and the guardian.',
      scope: 'each',
      handle: (request, ctx) => this.deliverPlan(request, ctx),
    },
    'send-summary': {
      description: 'Send the teacher a summary of the whole run. Plan it last.',
      scope: 'once',
      handle: (_request, ctx) => this.sendSummary(ctx),
    },
  });

  readonly actions = this.table.specs;

  constructor(
    llm: LlmProvider,
    private readonly delivery: MessengerDelivery,
  ) {
    super('MS', llm);
  }

  protected run(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    return this.table.dispatch(request, ctx);
  }

  private async deliverPlan(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    const item = singleItem(request);
    const plan = CatchUpPlanSchema.parse(item.payload);
    const subjectId = plan.learnerId;
    const contacts = this.delivery.directory.contactsOf(subjectId);
    if (!contacts) {
      throw new StepFailedError(`no contact details on record for ${subjectId}`);
    }
    // Names are added here, in code: the model only ever sees pseudonymous ids.
    await this.delivery.outbox.deliver({
      audience: 'learner',
      subjectId,
      to: contacts.learnerEmail,
      subject: PLAN_SUBJECT,
      body: `Hi ${contacts.firstName},\n\n${plan.learnerMessage}`,
    });
    await this.delivery.outbox.deliver({
      audience: 'guardian',
      subjectId,
      to: contacts.guardianEmail,
      subject: GUARDIAN_SUBJECT,
      body: `Dear ${contacts.guardianName},\n\n${plan.guardianMessage}`,
    });
    ctx.recordDelivery(subjectId);
    const { date, time } = plan.supportSession;
    this.say(ctx, {
      level: 'ACT',
      itemId: subjectId,
      message: `${subjectId}: plan sent to learner and guardian; support session booked ${date} ${time}.`,
    });
    return {
      kind: 'outputs',
      outputs: [
        {
          subjectId,
          payload: { audiences: ['learner', 'guardian'], supportSession: plan.supportSession },
        },
      ],
    };
  }

  private async sendSummary(ctx: RunContext): Promise<StepResult> {
    const headline =
      `${ctx.deliveredCount} plans delivered · ${ctx.fixes} fixed after review · ` +
      `${ctx.escalations.length} escalated`;
    const notes = ctx.teacherNotes.map((note) => `• ${note}`);
    const needsYou = ctx.escalations.map(
      (escalation) => `• Needs you: ${escalation.subjectId} — ${escalation.reason}`,
    );
    await this.delivery.outbox.deliver({
      audience: 'teacher',
      subjectId: CLASS_SUBJECT_ID,
      to: this.delivery.directory.teacher().email,
      subject: SUMMARY_SUBJECT,
      body: [headline, ...notes, ...needsYou].join('\n'),
    });
    this.say(ctx, {
      level: 'DONE',
      message: `Summary sent to the teacher: ${headline} · ${notes.length} notes for the teacher.`,
    });
    return { kind: 'outputs', outputs: [] };
  }
}
