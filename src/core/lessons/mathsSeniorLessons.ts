import type { TopicLesson } from './TopicLesson';

/** CAPS Mathematics, Grades 11 and 12: topics beyond Grade 10. */
export const MATHS_SENIOR_LESSONS: Readonly<Record<string, TopicLesson>> = {
  'exponents and surds': {
    idea: 'Exponent laws: aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ, a⁰ = 1. Simplify surds by taking out square factors: √50 = 5√2.',
    example: {
      question: 'Simplify 2³ × 2⁴ ÷ 2⁵',
      steps: ['Multiplying: add the exponents → 2⁷', 'Dividing: subtract → 2²'],
      answer: '4',
    },
    pattern: {
      rows: [
        ['√8', '2√2'],
        ['√12', '2√3'],
        ['√18', '3√2'],
        ['√50', '5√2'],
      ],
      rule: 'Take out the biggest perfect square: √(a²b) = a√b.',
    },
    realWorld: {
      question: 'A square tile has an area of 50 cm². What is its exact side length?',
      answer: '√50 = 5√2 cm ≈ 7.07 cm',
    },
    gossip: [
      ['t', 'Exponents have rules and they are VERY strict about who they hang out with 👀'],
      ['y', 'Meaning?'],
      ['t', 'Same base, multiplying? Add the powers: 2³ × 2⁴ = 2⁷. Dividing? Subtract.'],
      ['t', 'Surds want to look neat: √50 is really √25 × √2, so 5√2.'],
      ['y', 'Can I do 2³ × 3² the same way?'],
      ['t', 'Nope! Different bases don’t combine. That’s the trap 🙅'],
    ],
    mistake: 'Adding exponents when the bases are different — 2³ × 3² cannot be combined.',
    checks: [
      { question: 'Simplify x⁵ ÷ x²', answer: 'x³' },
      { question: 'Simplify √72', answer: '6√2' },
    ],
  },
  'number patterns': {
    idea: 'Linear pattern: the first difference is constant, Tn = an + b. Quadratic pattern: the second difference is constant, Tn = an² + bn + c, with 2a = the second difference.',
    example: {
      question: 'Find Tn for 3; 8; 15; 24; …',
      steps: [
        'First differences 5; 7; 9 → second difference 2 → a = 1',
        '3a + b = 5 → b = 2',
        'a + b + c = 3 → c = 0',
      ],
      answer: 'Tn = n² + 2n',
    },
    pattern: {
      rows: [
        ['T1', '3'],
        ['T2', '8'],
        ['T3', '15'],
        ['T4', '24'],
      ],
      rule: 'Second difference 2 → an n² term; then fit b and c.',
    },
    realWorld: {
      question:
        'A hall’s first row has 12 chairs and each row has 3 more. How many chairs in row 20?',
      answer: 'Tn = 3n + 9 → T20 = 69',
    },
    gossip: [
      ['t', 'Number patterns are basically a mystery and the differences are the clues 🔍'],
      ['y', 'Okay detective'],
      [
        't',
        'First differences the same? Linear: Tn = an + b. Not the same, but the SECOND differences are? Quadratic.',
      ],
      ['t', 'And the big secret: a is HALF the second difference. Second difference 2 → a = 1.'],
      ['y', 'Not the second difference itself?'],
      ['t', 'Half! That one slip costs marks every single year.'],
    ],
    mistake: 'Using the second difference as a — a is half of it.',
    checks: [
      { question: 'Tn = 4n − 1. Find T10.', answer: '39' },
      { question: 'The second difference is 6. What is a?', answer: '3' },
    ],
  },
  'analytical geometry': {
    idea: 'Distance = √((x₂−x₁)² + (y₂−y₁)²); midpoint = ((x₁+x₂)/2; (y₁+y₂)/2); gradient m = (y₂−y₁)/(x₂−x₁). Parallel lines: equal gradients. Perpendicular: m₁ × m₂ = −1.',
    example: {
      question: 'A(1; 2) and B(4; 6). Find AB and the gradient of AB.',
      steps: ['AB = √(3² + 4²) = √25', 'm = (6 − 2) ÷ (4 − 1)'],
      answer: 'AB = 5 units; m = 4/3',
    },
    pattern: {
      rows: [
        ['m = 2', 'perpendicular: −1/2'],
        ['m = −3', 'perpendicular: 1/3'],
        ['m = 1/4', 'perpendicular: −4'],
        ['m = −2/5', 'perpendicular: 5/2'],
      ],
      rule: 'Perpendicular gradient: flip it and change the sign.',
    },
    realWorld: {
      question:
        'On a map grid (1 unit = 100 m), school is at (2; 3) and home at (8; 11). Straight-line distance?',
      answer: '√(6² + 8²) = 10 units = 1 km',
    },
    gossip: [
      ['t', 'Analytical geometry is just Grade 8 Pythagoras wearing a fancy outfit 😎'],
      ['y', 'Seriously?'],
      ['t', 'Distance between two points? It’s the hypotenuse: √(Δx² + Δy²).'],
      [
        't',
        'Gradient is rise over run. Perpendicular lines? Flip it and change the sign — 2 becomes −1/2.',
      ],
      ['y', 'Any traps?'],
      ['t', 'Keep the same point first on top AND bottom. Mix the order and the sign flips.'],
    ],
    mistake: 'Mixing the order of the points in the gradient formula.',
    checks: [
      { question: 'Midpoint of (2; 4) and (6; 8)?', answer: '(4; 6)' },
      { question: 'Gradient of a line parallel to y = 3x + 1?', answer: '3' },
    ],
  },
  'sequences and series': {
    idea: 'Arithmetic: Tn = a + (n−1)d and Sn = n/2[2a + (n−1)d]. Geometric: Tn = arⁿ⁻¹; S∞ = a/(1 − r) only when −1 < r < 1.',
    example: {
      question: 'Sum the first 20 terms of 3 + 7 + 11 + …',
      steps: ['a = 3, d = 4, n = 20', 'Sn = 20/2 [2(3) + 19(4)]', '= 10 × 82'],
      answer: '820',
    },
    pattern: {
      rows: [
        ['2; 6; 18; …', 'r = 3'],
        ['5; 10; 20; …', 'r = 2'],
        ['16; 8; 4; …', 'r = 1/2'],
        ['1; −2; 4; …', 'r = −2'],
      ],
      rule: 'r = any term ÷ the term before it.',
    },
    realWorld: {
      question: 'You save R100 in month 1 and R20 more every month. Total after 12 months?',
      answer: 'S12 = 12/2 [200 + 11(20)] = R2 520',
    },
    gossip: [
      [
        't',
        'Sequences are patterns with a personality: arithmetic ADDS, geometric MULTIPLIES ➕✖️',
      ],
      ['y', 'And series?'],
      [
        't',
        'A series is the sum. For arithmetic, Sn = n/2[2a + (n−1)d]. Learn it like your ID number.',
      ],
      [
        't',
        'Geometric with r between −1 and 1 keeps shrinking, so it adds up to a limit: S∞ = a/(1 − r).',
      ],
      ['y', 'And if r = 2?'],
      ['t', 'It explodes to infinity — no sum to infinity. Using S∞ there is the classic mistake.'],
    ],
    mistake: 'Using S∞ when r is not between −1 and 1.',
    checks: [
      { question: 'T10 of 5; 8; 11; …?', answer: '32' },
      { question: 'S∞ of 8 + 4 + 2 + …?', answer: '16' },
    ],
  },
  'functions and inverses': {
    idea: 'The inverse swaps x and y: for y = 2x + 4 the inverse is y = (x − 4)/2. Its graph is the mirror image in y = x. y = x² needs x ≥ 0 for its inverse to be a function.',
    example: {
      question: 'Find the inverse of f(x) = 3x − 6.',
      steps: ['Write y = 3x − 6', 'Swap x and y: x = 3y − 6', 'Solve for y: y = (x + 6)/3'],
      answer: 'f⁻¹(x) = x/3 + 2',
    },
    pattern: {
      rows: [
        ['f(x) = 2x', 'f⁻¹(x) = x/2'],
        ['f(x) = x + 5', 'f⁻¹(x) = x − 5'],
        ['f(x) = 4x − 8', 'f⁻¹(x) = x/4 + 2'],
        ['f(x) = 2ˣ', 'f⁻¹(x) = log₂x'],
      ],
      rule: 'The inverse undoes f, in reverse order.',
    },
    realWorld: {
      question: '°F = 1.8 × °C + 32. Find the formula back to °C.',
      answer: '°C = (°F − 32) ÷ 1.8',
    },
    gossip: [
      ['t', 'An inverse function is basically the undo button ↩️'],
      ['y', 'How do I find it?'],
      ['t', 'Swap x and y, then make y the subject again. That’s it.'],
      ['t', 'On the graph it’s the mirror image in the line y = x. Super satisfying.'],
      ['y', 'So f⁻¹ means 1 over f?'],
      ['t', 'NO 😭 It means the inverse function, not a fraction. Everyone falls for it once.'],
    ],
    mistake: 'Thinking f⁻¹(x) means 1/f(x).',
    checks: [
      { question: 'Inverse of y = x − 7?', answer: 'y = x + 7' },
      { question: 'In which line is a function mirrored to give its inverse?', answer: 'y = x' },
    ],
  },
  'exponential and logarithmic functions': {
    idea: 'log_b a = x means bˣ = a — the log is the inverse of the exponential. Laws: log(ab) = log a + log b, log(a/b) = log a − log b, log aⁿ = n log a.',
    example: {
      question: 'Solve 2ˣ = 32.',
      steps: ['Write 32 as a power of 2: 2⁵', 'So x = 5 (x = log₂32)'],
      answer: 'x = 5',
    },
    pattern: {
      rows: [
        ['log₂8', '3'],
        ['log₂16', '4'],
        ['log₁₀1 000', '3'],
        ['log₃81', '4'],
      ],
      rule: 'Ask: to what power must the base be raised?',
    },
    realWorld: {
      question: 'Bacteria double every hour, starting at 100. When do they reach 6 400?',
      answer: '2ˣ = 64 → x = 6 hours',
    },
    gossip: [
      ['t', 'Logs sound scary but they only ever ask ONE question 🤔'],
      ['y', 'Which is?'],
      ['t', '“What power?” log₂8 = 3 because 2 to the power 3 is 8. That’s literally it.'],
      [
        't',
        'Logs undo exponentials, so they solve stuff like 2ˣ = 32 or “when does the money double?”',
      ],
      ['y', 'Can I split log(a + b)?'],
      ['t', 'No! log(ab) splits into a sum. log(a + b) stays as it is. Big trap.'],
    ],
    mistake: 'Writing log(a + b) = log a + log b — that law is for log(ab).',
    checks: [
      { question: 'log₅25?', answer: '2' },
      { question: 'Solve 10ˣ = 1 000', answer: 'x = 3' },
    ],
  },
  polynomials: {
    idea: 'Factor theorem: if f(a) = 0, then (x − a) is a factor. Use it to factorise a cubic, then solve.',
    example: {
      question: 'Factorise f(x) = x³ − 6x² + 11x − 6.',
      steps: [
        'f(1) = 1 − 6 + 11 − 6 = 0, so (x − 1) is a factor',
        'Divide: f(x) = (x − 1)(x² − 5x + 6)',
        'Factorise the quadratic: (x − 2)(x − 3)',
      ],
      answer: '(x − 1)(x − 2)(x − 3)',
    },
    pattern: {
      rows: [
        ['f(1) = 0', '(x − 1) is a factor'],
        ['f(−2) = 0', '(x + 2) is a factor'],
        ['f(3) = 0', '(x − 3) is a factor'],
        ['f(−1/2) = 0', '(2x + 1) is a factor'],
      ],
      rule: 'f(a) = 0 ⇔ (x − a) is a factor.',
    },
    realWorld: {
      question: 'A box’s volume is V(x) = x³ − 6x² + 11x − 6. For which whole numbers is V = 0?',
      answer: 'x = 1, 2 or 3',
    },
    gossip: [
      ['t', 'Cubics look impossible until you learn the guessing game 🎲'],
      ['y', 'Guessing?!'],
      ['t', 'Try small numbers: 1, −1, 2… If f(1) = 0, boom — (x − 1) is a factor.'],
      [
        't',
        'Then divide it out and you’re left with a quadratic you already know how to factorise.',
      ],
      ['y', 'Easy'],
      ['t', 'Just watch the sign: f(2) = 0 means (x − 2), NOT (x + 2).'],
    ],
    mistake: 'Getting the sign wrong: f(2) = 0 gives the factor (x − 2), not (x + 2).',
    checks: [
      { question: 'Remainder when x³ + 1 is divided by (x − 1)?', answer: '2, because f(1) = 2' },
      { question: 'Is (x + 1) a factor of x² − 1?', answer: 'Yes, f(−1) = 0' },
    ],
  },
  'differential calculus': {
    idea: 'The derivative is the gradient of the tangent: for f(x) = axⁿ, f′(x) = naxⁿ⁻¹. Turning points are where f′(x) = 0.',
    example: {
      question: 'f(x) = 3x² − 5x + 2. Find f′(x) and the gradient at x = 2.',
      steps: ['Power rule: f′(x) = 6x − 5', 'At x = 2: 6(2) − 5'],
      answer: 'f′(x) = 6x − 5; gradient 7',
    },
    pattern: {
      rows: [
        ['x²', '2x'],
        ['x³', '3x²'],
        ['5x⁴', '20x³'],
        ['7x', '7'],
      ],
      rule: 'Bring the power down in front, then lower it by one.',
    },
    realWorld: {
      question: 'A ball’s height is h(t) = 20t − 5t². When is it highest?',
      answer: 'h′(t) = 20 − 10t = 0 → t = 2 s (20 m up)',
    },
    gossip: [
      ['t', 'Calculus has a reputation, but the main move is honestly a dance step 💃'],
      ['y', 'A dance step?'],
      [
        't',
        'Power comes down to the front, then the power drops by one. x³ → 3x². Step, drop, done.',
      ],
      ['t', 'And the derivative is the gradient. Where it’s zero, the graph turns — max or min.'],
      ['y', 'And constants?'],
      [
        't',
        'They disappear — the derivative of a constant is 0. Leaving them in is the classic slip.',
      ],
    ],
    mistake: 'Forgetting that the derivative of a constant is 0.',
    checks: [
      { question: 'f(x) = 4x³. f′(x)?', answer: '12x²' },
      { question: 'Where does f(x) = x² − 6x turn?', answer: 'x = 3, where f′(x) = 2x − 6 = 0' },
    ],
  },
};
