/** A fresh question with new numbers; the answer and the working are computed, never guessed. */
export interface MadeQuestion {
  question: string;
  answer: number;
  unit: string;
  working: readonly string[];
}

/** Whole number in [min, max]. */
export type Pick = (min: number, max: number) => number;
type Maker = (pick: Pick) => MadeQuestion;

const G = 9.8;
const round2 = (value: number) => Math.round(value * 100) / 100;
function fromList<T>(pick: Pick, list: readonly T[]): T {
  const item = list[pick(0, list.length - 1)];
  if (item === undefined) {
    throw new RangeError('fromList needs a non-empty list');
  }
  return item;
}
const ELEMENTS = [
  ['carbon', 6, 12],
  ['oxygen', 8, 16],
  ['sodium', 11, 23],
  ['magnesium', 12, 24],
  ['aluminium', 13, 27],
  ['chlorine', 17, 35],
  ['potassium', 19, 39],
  ['calcium', 20, 40],
] as const;
const SINES = [
  [30, 0.5],
  [45, Math.SQRT1_2],
  [60, Math.sqrt(3) / 2],
] as const;

const MAKERS: Readonly<Record<string, Maker>> = {
  'MATH:equations and inequalities': (pick) => {
    const [a, x, b] = [pick(2, 9), pick(-5, 9), pick(1, 15)];
    return {
      question: `Solve ${a}x + ${b} = ${a * x + b}`,
      answer: x,
      unit: '',
      working: [`Subtract ${b} from both sides: ${a}x = ${a * x}`, `Divide by ${a}: x = ${x}`],
    };
  },
  'MATH:algebraic expressions': (pick) => {
    const [a, b] = [pick(1, 9), pick(1, 9)];
    return {
      question: `Expand (x + ${a})(x + ${b}). What number goes in front of x?`,
      answer: a + b,
      unit: '',
      working: [`x² + ${b}x + ${a}x + ${a * b}`, `= x² + ${a + b}x + ${a * b}`],
    };
  },
  'MATH:functions': (pick) => {
    const [a, k] = [pick(1, 4), pick(1, 6)];
    return {
      question: `y = ${a}x² − ${a * k * k}. Find the positive x-intercept.`,
      answer: k,
      unit: '',
      working: [
        `Set y = 0: ${a}x² = ${a * k * k}`,
        `x² = ${k * k}`,
        `x = ±${k}, so the positive one is ${k}`,
      ],
    };
  },
  'MATH:trigonometry': (pick) => {
    const hyp = pick(4, 20);
    const [angle, sine] = fromList(pick, SINES);
    return {
      question: `Hypotenuse ${hyp} cm, angle ${angle}°. Find the opposite side (2 decimals).`,
      answer: round2(hyp * sine),
      unit: 'cm',
      working: [`opposite = ${hyp} × sin ${angle}°`, `= ${round2(hyp * sine)} cm`],
    };
  },
  'MATH:statistics': (pick) => {
    const values = [pick(1, 20), pick(1, 20), pick(1, 20), pick(1, 20), pick(1, 20)];
    const total = values.reduce((sum, v) => sum + v, 0);
    return {
      question: `Find the mean of ${values.join(', ')}`,
      answer: total / values.length,
      unit: '',
      working: [
        `Total: ${values.join(' + ')} = ${total}`,
        `${total} ÷ ${values.length} = ${total / values.length}`,
      ],
    };
  },
  'MATH:probability': (pick) => {
    const [red, blue] = [pick(1, 9), pick(1, 9)];
    return {
      question: `A bag has ${red} red and ${blue} blue sweets. P(red) as a decimal (2 places)?`,
      answer: round2(red / (red + blue)),
      unit: '',
      working: [
        `Total: ${red} + ${blue} = ${red + blue}`,
        `P(red) = ${red} ÷ ${red + blue} ≈ ${round2(red / (red + blue))}`,
      ],
    };
  },
  'MATH:finance and growth': (pick) => {
    const [p, rate, years] = [
      fromList(pick, [500, 1000, 2000, 5000]),
      fromList(pick, [5, 8, 10, 12]),
      pick(2, 5),
    ];
    const amount = p * (1 + (rate / 100) * years);
    return {
      question: `R${p} at ${rate}% simple interest for ${years} years. Final amount in rand?`,
      answer: amount,
      unit: 'R',
      working: [`A = ${p}(1 + ${rate / 100} × ${years})`, `= R${amount}`],
    };
  },
  'PHSC:electricity': (pick) => {
    const [v, r] = [fromList(pick, [6, 9, 12, 24]), fromList(pick, [2, 3, 4, 6, 8])];
    return {
      question: `${v} V across a ${r} Ω resistor. Current in A (2 decimals)?`,
      answer: round2(v / r),
      unit: 'A',
      working: ['I = V ÷ R', `= ${v} ÷ ${r} ≈ ${round2(v / r)} A`],
    };
  },
  'PHSC:waves and sound': (pick) => {
    const [f, wavelength] = [pick(2, 20) * 50, fromList(pick, [0.5, 1, 1.5, 2])];
    return {
      question: `f = ${f} Hz and λ = ${wavelength} m. Wave speed in m·s⁻¹?`,
      answer: f * wavelength,
      unit: 'm·s⁻¹',
      working: ['v = fλ', `= ${f} × ${wavelength} = ${f * wavelength} m·s⁻¹`],
    };
  },
  'PHSC:mechanics': (pick) => {
    const [v, t] = [pick(10, 30), pick(2, 6)];
    return {
      question: `From rest to ${v} m·s⁻¹ in ${t} s. Acceleration (2 decimals)?`,
      answer: round2(v / t),
      unit: 'm·s⁻²',
      working: ['a = (v − u) ÷ t', `= (${v} − 0) ÷ ${t} ≈ ${round2(v / t)} m·s⁻²`],
    };
  },
  'PHSC:energy': (pick) => {
    const [m, h] = [pick(1, 10), pick(1, 20)];
    return {
      question: `A ${m} kg mass is ${h} m high (g = 9.8). Ep in J?`,
      answer: round2(m * G * h),
      unit: 'J',
      working: ['Ep = mgh', `= ${m} × 9.8 × ${h} = ${round2(m * G * h)} J`],
    };
  },
  'PHSC:atomic structure': (pick) => {
    const [name, protons, mass] = fromList(pick, ELEMENTS);
    return {
      question: `${name}: atomic number ${protons}, mass number ${mass}. How many neutrons?`,
      answer: mass - protons,
      unit: '',
      working: [
        'neutrons = mass number − atomic number',
        `= ${mass} − ${protons} = ${mass - protons}`,
      ],
    };
  },
  'PHSC:chemical change': (pick) => {
    const grams = pick(1, 8) * 9;
    return {
      question: `How many moles in ${grams} g of water (M = 18 g·mol⁻¹)?`,
      answer: grams / 18,
      unit: 'mol',
      working: ['n = m ÷ M', `= ${grams} ÷ 18 = ${grams / 18} mol`],
    };
  },
};

export const makerKey = (subjectId: string, topic: string) => `${subjectId}:${topic.toLowerCase()}`;
export const hasMaker = (key: string) => key in MAKERS;

/** A new question for the topic, or undefined when Thuso cannot make one yet. */
export function makeQuestion(key: string, pick: Pick): MadeQuestion | undefined {
  return MAKERS[key]?.(pick);
}

/** Accepts "8,5" or "8.5" and small rounding differences. */
export function isRightAnswer(given: string, expected: number): boolean {
  const value = Number(
    given
      .trim()
      .replace(',', '.')
      .replace(/[^\d.-]/g, ''),
  );
  if (given.trim() === '' || Number.isNaN(value)) {
    return false;
  }
  return Math.abs(value - expected) <= Math.max(0.01, Math.abs(expected) * 0.01);
}
