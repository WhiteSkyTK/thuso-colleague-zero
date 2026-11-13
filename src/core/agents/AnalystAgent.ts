import { z } from 'zod';
import { TEMPERATURE } from '../config/constants';
import { DiagnosisSchema } from '../domain/diagnosis';
import type { StepRequest, StepResult } from '../domain/step';
import type { LlmProvider } from '../llm/LlmProvider';
import type { RunContext } from '../orchestrator/RunContext';
import { ANALYST_PROMPT, toPrompt } from '../prompts/prompts';
import { ActionTable } from './ActionTable';
import { Agent } from './Agent';
import type { StepAgent } from './StepAgent';

const FindingsSchema = z.object({ diagnoses: z.array(DiagnosisSchema) });

/** AN — finds the learners at risk and explains why, with evidence. */
export class AnalystAgent extends Agent<StepRequest, StepResult> implements StepAgent {
  private readonly table = new ActionTable({
    'find-at-risk': {
      description: 'Score every learner in scope and diagnose why each at-risk learner is slipping.',
      scope: 'once',
      handle: (request, ctx) => this.findAtRisk(request, ctx),
    },
  });

  readonly actions = this.table.specs;

  constructor(llm: LlmProvider) {
    super('AN', llm);
  }

  protected run(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    return this.table.dispatch(request, ctx);
  }

  private async findAtRisk(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    const input = {
      scope: request.step.input,
      riskThreshold: ctx.goal.constraints.riskThreshold,
    };
    const asked = await this.ask(ctx, FindingsSchema, {
      task: 'analyst.find-at-risk',
      tier: 'reasoning',
      system: ANALYST_PROMPT,
      prompt: toPrompt(input),
      input,
      temperature: TEMPERATURE.planning,
    });
    const { diagnoses } = asked.value;
    this.say(ctx, {
      level: 'ACT',
      message: `${diagnoses.length} learners at risk (threshold ${input.riskThreshold}).`,
      tokens: asked.tokens,
      ms: asked.ms,
    });
    for (const diagnosis of diagnoses) {
      this.say(ctx, {
        level: 'INFO',
        itemId: diagnosis.learnerId,
        message: `${diagnosis.learnerId}: risk ${diagnosis.riskScore}, ${diagnosis.primaryCause} — ${diagnosis.evidence}.`,
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
}
