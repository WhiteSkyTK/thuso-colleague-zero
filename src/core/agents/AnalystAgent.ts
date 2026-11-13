import { z } from 'zod';
import { assessRisk } from '../analysis/assessRisk';
import { TEMPERATURE } from '../config/constants';
import type { Diagnosis, RiskAssessment } from '../domain/diagnosis';
import type { LearnerRecord } from '../domain/learnerRecord';
import type { StepRequest, StepResult } from '../domain/step';
import { LearnerIdSchema } from '../domain/vocab';
import { StepFailedError } from '../errors/AppError';
import type { LlmProvider } from '../llm/LlmProvider';
import type { RunContext } from '../orchestrator/RunContext';
import { ANALYST_PROMPT, toPrompt } from '../prompts/prompts';
import type { LearnerRecords } from '../repositories/ClassRepository';
import { ActionTable } from './ActionTable';
import { Agent } from './Agent';
import type { StepAgent } from './StepAgent';

const StepInputSchema = z.object({
  subjectId: z.string().min(1),
  /** Set by the Planner when it decides to carry on although some records are missing. */
  allowPartialData: z.boolean().default(false),
});

const ExplanationsSchema = z.object({
  explanations: z.array(z.object({ learnerId: LearnerIdSchema, explanation: z.string().min(1) })),
});

const WITHHELD = '[withheld: the text read like an instruction]';

/** AN — scores every learner in code, then explains the root cause of each at-risk learner. */
export class AnalystAgent extends Agent<StepRequest, StepResult> implements StepAgent {
  private readonly table = new ActionTable({
    'find-at-risk': {
      description:
        'Score every learner in one subject and diagnose the root cause for each at-risk learner. ' +
        'Input: { subjectId, allowPartialData } — fails if records are missing unless allowPartialData is true.',
      scope: 'once',
      handle: (request, ctx) => this.findAtRisk(request, ctx),
    },
  });

  readonly actions = this.table.specs;

  constructor(
    llm: LlmProvider,
    private readonly source: LearnerRecords,
  ) {
    super('AN', llm);
  }

  protected run(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    return this.table.dispatch(request, ctx);
  }

  private async findAtRisk(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    const input = StepInputSchema.parse(request.step.input);
    const records = this.source.recordsFor(input.subjectId);
    if (records.length === 0) {
      throw new StepFailedError(`no results found for subject "${input.subjectId}"`);
    }
    this.requireAttendance(records, input.allowPartialData, ctx);

    const threshold = ctx.goal.constraints.riskThreshold;
    const atRisk = records.map(assessRisk).filter((assessed) => assessed.riskScore >= threshold);
    this.say(ctx, {
      level: 'ACT',
      message: `${records.length} learners scored in ${input.subjectId}: ${atRisk.length} at or above risk ${threshold}.`,
    });
    this.describeClass(records, ctx);

    const explanations = await this.explain(atRisk, records, ctx);
    const diagnoses: Diagnosis[] = atRisk.map((assessed) => ({
      ...assessed,
      explanation: explanations.get(assessed.learnerId) ?? assessed.evidence,
    }));
    for (const diagnosis of diagnoses) {
      const onLine =
        diagnosis.riskScore === threshold
          ? ` Exactly on the threshold of ${threshold} — included (rule: at or above).`
          : '';
      this.say(ctx, {
        level: 'INFO',
        itemId: diagnosis.learnerId,
        message: `${diagnosis.learnerId}: risk ${diagnosis.riskScore}, ${diagnosis.primaryCause} — ${diagnosis.evidence}.${onLine}`,
        data: { diagnosis },
      });
    }
    return {
      kind: 'outputs',
      outputs: diagnoses.map((diagnosis) => ({
        subjectId: diagnosis.learnerId,
        payload: diagnosis,
      })),
    };
  }

  /** Missing registers stop the step unless the Planner has chosen to continue without them. */
  private requireAttendance(
    records: readonly LearnerRecord[],
    allowPartialData: boolean,
    ctx: RunContext,
  ): void {
    const missing = records
      .filter((record) => record.absencesByWeek === null)
      .map((record) => record.learnerId)
      .join(', ');
    if (missing === '') {
      return;
    }
    if (!allowPartialData) {
      throw new StepFailedError(
        `attendance records are missing for ${missing}; decide whether to continue with partial data`,
      );
    }
    ctx.note(`No attendance register for ${missing} — analysed on marks and homework only.`);
    this.say(ctx, {
      level: 'WARN',
      message: `Continuing with partial data: no attendance register for ${missing}.`,
    });
  }

  /** For the teacher: where the class as a whole is weakest. */
  private describeClass(records: readonly LearnerRecord[], ctx: RunContext): void {
    const byTopic = Map.groupBy(
      records.flatMap((record) => record.results),
      (result) => result.topic,
    );
    const averages = [...byTopic].map(([topic, results]) => ({
      topic,
      average: results.reduce((total, result) => total + result.scorePct, 0) / results.length,
    }));
    const [first, ...rest] = averages;
    if (!first) {
      return;
    }
    const weakest = rest.reduce((low, next) => (next.average < low.average ? next : low), first);
    const line = `the weakest topic for the whole class is ${weakest.topic} (average ${Math.round(weakest.average)}%)`;
    ctx.note(`Class-wide, ${line} — worth reteaching to everyone.`);
    this.say(ctx, { level: 'INFO', message: `Class picture: ${line}.` });
  }

  /** The model explains; it never scores. Learner text is delimited, or withheld if suspect. */
  private async explain(
    atRisk: readonly RiskAssessment[],
    records: readonly LearnerRecord[],
    ctx: RunContext,
  ): Promise<Map<string, string>> {
    if (atRisk.length === 0) {
      return new Map();
    }
    const reflections = new Map(records.map((record) => [record.learnerId, record.reflection]));
    const input = {
      learners: atRisk.map((assessed) => ({
        learnerId: assessed.learnerId,
        primaryCause: assessed.primaryCause,
        evidence: assessed.evidence,
        signals: assessed.signals,
        weakTopics: assessed.weakTopics,
        reflection: assessed.hasSuspectText
          ? WITHHELD
          : `<learner_text>${reflections.get(assessed.learnerId) ?? ''}</learner_text>`,
      })),
    };
    const asked = await this.ask(ctx, ExplanationsSchema, {
      task: 'analyst.explain',
      tier: 'reasoning',
      system: ANALYST_PROMPT,
      prompt: toPrompt(input),
      input,
      temperature: TEMPERATURE.planning,
    });
    return new Map(asked.value.explanations.map((entry) => [entry.learnerId, entry.explanation]));
  }
}
