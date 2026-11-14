/** A picture Thuso draws for visual learners (rendered as SVG). */
export type Diagram =
  | {
      kind: 'bars';
      title: string;
      bars: readonly { label: string; value: number }[];
      unit?: string;
      line?: { value: number; label: string };
    }
  | { kind: 'triangle'; opposite: string; adjacent: string; hypotenuse: string; angle: string }
  | { kind: 'parabola'; a: number; q: number }
  | { kind: 'dots'; title: string; groups: readonly { label: string; count: number }[] }
  | { kind: 'wave'; wavelength: string; amplitude: string }
  /** A process or sequence, top to bottom (e.g. root hair → xylem → leaves → stomata). */
  | { kind: 'flow'; title: string; steps: readonly string[] };

/** One line of a gossip chat: Thuso (`t`) spilling the tea, or the friend (`y`) reacting. */
export type GossipLine = readonly ['t' | 'y', string];

/** What Thuso needs to teach one topic in any format. */
export interface TopicLesson {
  /** The key idea in one or two sentences. */
  idea: string;
  example: { question: string; steps: readonly string[]; answer: string };
  /** Rows of a pattern; the last row's answer is hidden for the learner to find. */
  pattern: { rows: readonly (readonly [string, string])[]; rule: string };
  /** The same idea in a South African everyday problem. */
  realWorld: { question: string; answer: string };
  /** The whole topic told like gossip to a friend: chatty, dramatic, and correct. */
  gossip?: readonly GossipLine[];
  diagram?: Diagram;
  mistake: string;
  checks: readonly { question: string; answer: string }[];
}
