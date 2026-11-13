import { CatchUpPlanSchema } from '../domain/catchUpPlan';
import type { StepRequest, StepResult } from '../domain/step';
import type { Outbox } from '../delivery/Outbox';
import type { LlmProvider } from '../llm/LlmProvider';
import type { RunContext } from '../orchestrator/RunContext';
import { ActionTable } from './ActionTable';
import { Agent } from './Agent';
import { singleItem } from './singleItem';
import type { StepAgent } from './StepAgent';

const PLAN_SUBJECT = 'Your 2-week Mathematics catch-up plan';
const GUARDIAN_SUBJECT = 'A 2-week Mathematics catch-up plan for your child';
const SUMMARY_SUBJECT = 'Thuso run summary';
const CLASS_SUBJECT_ID = 'class';

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
    private readonly outbox: Outbox,
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
    await this.outbox.deliver({
      audience: 'learner',
      subjectId,
      subject: PLAN_SUBJECT,
      body: plan.learnerMessage,
    });
    await this.outbox.deliver({
      audience: 'guardian',
      subjectId,
      subject: GUARDIAN_SUBJECT,
      body: plan.guardianMessage,
    });
    ctx.recordDelivery(subjectId);
    this.say(ctx, {
      level: 'ACT',
      itemId: subjectId,
      message: `${subjectId}: plan sent to learner and guardian.`,
    });
    return {
      kind: 'outputs',
      outputs: [{ subjectId, payload: { audiences: ['learner', 'guardian'] } }],
    };
  }

  private async sendSummary(ctx: RunContext): Promise<StepResult> {
    const body =
      `${ctx.deliveredCount} plans delivered · ${ctx.fixes} fixed after review · ` +
      `${ctx.escalations.length} escalated`;
    await this.outbox.deliver({
      audience: 'teacher',
      subjectId: CLASS_SUBJECT_ID,
      subject: SUMMARY_SUBJECT,
      body,
    });
    this.say(ctx, { level: 'DONE', message: `Summary sent to the teacher: ${body}.` });
    return { kind: 'outputs', outputs: [] };
  }
}
