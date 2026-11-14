import type { TopicLesson } from './TopicLesson';

/** CAPS Mathematics, Grades 10–12: one short lesson per topic. */
export const MATHS_LESSONS: Readonly<Record<string, TopicLesson>> = {
  'algebraic expressions': {
    idea: 'Like terms have the same letters with the same powers. Only like terms can be added or subtracted.',
    example: {
      question: 'Simplify 3x² + 2x − x² + 5x',
      steps: ['Group like terms: (3x² − x²) + (2x + 5x)', 'Add the numbers in front: 2x² + 7x'],
      answer: '2x² + 7x',
    },
    pattern: {
      rows: [
        ['x² − 9', '(x − 3)(x + 3)'],
        ['x² − 25', '(x − 5)(x + 5)'],
        ['4x² − 1', '(2x − 1)(2x + 1)'],
        ['x² − 49', '(x − 7)(x + 7)'],
      ],
      rule: 'A difference of two squares: a² − b² = (a − b)(a + b).',
    },
    realWorld: {
      question:
        'A taxi charges R15 to get in plus R8 per km. Write the cost for x km, then find it for 5 km.',
      answer: '15 + 8x, so 5 km costs R55',
    },
    diagram: {
      kind: 'dots',
      title: 'Algebra tiles for 2x² + 7x',
      groups: [
        { label: 'x²', count: 2 },
        { label: 'x', count: 7 },
      ],
    },
    gossip: [
      ['t', 'Okay so in algebra, terms only hang out with their own kind 👀'],
      ['y', 'What do you mean?'],
      [
        't',
        '3x² and −x² are like terms — same letter, same power. They can combine: 2x². Same with 2x and 5x: 7x.',
      ],
      ['t', 'But x and x²? Different crowd. They do NOT mix. So 2x² + 7x is as simple as it gets.'],
      ['y', 'People really add them?'],
      ['t', 'All the time! “2x + 3x² = 5x³” is the most famous wrong answer in Grade 10 😭'],
    ],
    mistake: '2x + 3x² is not 5x³ — x and x² are not like terms.',
    checks: [
      { question: 'Factorise x² + 5x + 6', answer: '(x + 2)(x + 3)' },
      { question: 'Expand (x − 4)²', answer: 'x² − 8x + 16' },
    ],
  },
  'equations and inequalities': {
    idea: 'Do the same to both sides. When you multiply or divide an inequality by a negative number, flip the sign.',
    example: {
      question: 'Solve 3x − 7 = 11',
      steps: [
        'Add 7 to both sides: 3x = 18',
        'Divide both sides by 3: x = 6',
        'Check: 3(6) − 7 = 11 ✓',
      ],
      answer: 'x = 6',
    },
    pattern: {
      rows: [
        ['−2x < 6', 'x > −3'],
        ['−x ≥ 4', 'x ≤ −4'],
        ['−3x > 9', 'x < −3'],
        ['−5x ≤ 10', 'x ≥ −2'],
      ],
      rule: 'Dividing by a negative number flips the inequality sign.',
    },
    realWorld: {
      question:
        'You have R50 and a data bundle costs R12. How many bundles can you buy? Solve 12x ≤ 50.',
      answer: 'x ≤ 4.17, so 4 bundles',
    },
    gossip: [
      [
        't',
        'Equations are all about fairness: whatever you do to one side, you do to the other ⚖️',
      ],
      ['y', 'Like what?'],
      [
        't',
        '3x − 7 = 11. Add 7 to BOTH sides: 3x = 18. Divide BOTH sides by 3: x = 6. Then check: 3(6) − 7 = 11 ✓',
      ],
      ['y', 'And inequalities are the same?'],
      [
        't',
        'Almost… but here is the plot twist 😱 Multiply or divide by a NEGATIVE and the sign flips. −2x < 6 becomes x > −3.',
      ],
      ['t', 'Forget to flip and the whole answer is wrong. Every. Single. Time.'],
    ],
    mistake: 'Forgetting to flip the sign after dividing by a negative.',
    checks: [
      { question: 'Solve x² − x − 12 = 0', answer: 'x = 4 or x = −3' },
      { question: 'Solve 2x + 5 > 11', answer: 'x > 3' },
    ],
  },
  functions: {
    idea: 'In y = ax² + q, a sets the shape (a > 0 opens up, a < 0 opens down) and q moves the graph up or down.',
    example: {
      question: 'Find the x-intercepts of y = 2x² − 8',
      steps: [
        'x-intercepts: set y = 0, so 2x² − 8 = 0',
        'Add 8, divide by 2: x² = 4',
        'Square root: x = ±2',
      ],
      answer: '(−2; 0) and (2; 0)',
    },
    pattern: {
      rows: [
        ['y = x²', 'turning point (0; 0)'],
        ['y = x² + 3', 'turning point (0; 3)'],
        ['y = x² − 2', 'turning point (0; −2)'],
        ['y = x² + 5', 'turning point (0; 5)'],
      ],
      rule: 'The turning point of y = ax² + q is (0; q).',
    },
    realWorld: {
      question: 'A ball is thrown up: its height is h = −5t² + 20 metres. When does it land?',
      answer: '−5t² + 20 = 0, so t² = 4 and t = 2 seconds',
    },
    diagram: { kind: 'parabola', a: 2, q: -8 },
    gossip: [
      ['t', 'Let me tell you about y = ax² + q, the drama queen of graphs 👑'],
      ['y', 'Go on'],
      ['t', 'If a is positive she smiles — the graph opens up. If a is negative she frowns 🙃'],
      ['t', 'And q? q just moves her up or down. The turning point is always (0; q).'],
      ['y', 'How do I find where she crosses the x-axis?'],
      [
        't',
        'Make y = 0 and solve. For y = 2x² − 8 you get x = ±2. Want the y-intercept instead? Make x = 0. Mixing those two up is the classic mistake.',
      ],
    ],
    mistake: 'Mixing up intercepts: for the y-intercept set x = 0; for x-intercepts set y = 0.',
    checks: [
      { question: 'y-intercept of y = 3x − 6', answer: '(0; −6)' },
      { question: 'x-intercept of y = 3x − 6', answer: '(2; 0)' },
    ],
  },
  trigonometry: {
    idea: 'In a right-angled triangle: sin = opposite ÷ hypotenuse, cos = adjacent ÷ hypotenuse, tan = opposite ÷ adjacent (SOH CAH TOA).',
    example: {
      question: 'The hypotenuse is 10 cm and the angle is 30°. Find the opposite side.',
      steps: ['sin 30° = opposite ÷ 10', 'opposite = 10 × sin 30°', '= 10 × 0.5'],
      answer: '5 cm',
    },
    pattern: {
      rows: [
        ['sin 30°', '0.5'],
        ['sin 45°', '0.71'],
        ['sin 60°', '0.87'],
        ['sin 90°', '1'],
      ],
      rule: 'sin grows from 0 to 1 as the angle goes from 0° to 90°.',
    },
    realWorld: {
      question:
        'A 10 m ladder leans on a wall at 60° to the ground. How high up the wall does it reach?',
      answer: '10 × sin 60° ≈ 8.66 m',
    },
    diagram: {
      kind: 'triangle',
      opposite: '5 cm',
      adjacent: '8.66 cm',
      hypotenuse: '10 cm',
      angle: '30°',
    },
    gossip: [
      ['t', 'Trig is just three friends with very specific jobs: sin, cos and tan 📐'],
      ['y', 'Which does what?'],
      [
        't',
        'SOH CAH TOA. Sin = opposite ÷ hypotenuse. Cos = adjacent ÷ hypotenuse. Tan = opposite ÷ adjacent.',
      ],
      ['t', 'So hypotenuse 10, angle 30°, want the opposite? Opposite = 10 × sin 30° = 5.'],
      ['y', 'My calculator gave me a weird answer though'],
      [
        't',
        'Babe, it’s in RADIANS mode 😩 Switch it to degrees (D). That one setting has cost people whole exams.',
      ],
    ],
    mistake: 'A calculator in radians mode gives wrong answers — set it to degrees (D).',
    checks: [
      { question: 'tan θ = 1. Find θ (0° < θ < 90°)', answer: '45°' },
      { question: 'cos 60°', answer: '0.5' },
    ],
  },
  'euclidean geometry': {
    idea: 'Every statement needs a reason from a theorem, e.g. "angles in a triangle add up to 180°".',
    example: {
      question: 'A triangle has angles 50°, 60° and x. Find x.',
      steps: ['Angles in a triangle add up to 180°', 'x = 180° − 50° − 60°'],
      answer: 'x = 70°',
    },
    pattern: {
      rows: [
        ['triangle', '180°'],
        ['quadrilateral', '360°'],
        ['pentagon', '540°'],
        ['hexagon', '720°'],
      ],
      rule: 'Interior angles of an n-sided polygon add up to (n − 2) × 180°.',
    },
    realWorld: {
      question:
        'A builder measures both diagonals of a door frame. Why does that prove it is a rectangle?',
      answer: 'A parallelogram with equal diagonals is a rectangle',
    },
    gossip: [
      [
        't',
        'In geometry, saying something is true is not enough. You need a reason, like an alibi 🕵️',
      ],
      ['y', 'An alibi?'],
      [
        't',
        'x = 70°? Why? “Angles in a triangle add up to 180°.” THAT is the alibi, and it earns the mark.',
      ],
      [
        't',
        'Same with shapes: opposite angles of a parallelogram are equal, a line joining two midpoints is half the third side.',
      ],
      ['y', 'So I must write the theorem every time?'],
      [
        't',
        'Every time. Statement without reason = suspect without alibi. The marker will not believe you 😂',
      ],
    ],
    mistake: 'Writing an answer without the reason — the reason earns the mark.',
    checks: [
      {
        question: 'In parallelogram ABCD, ∠A = 70°. Find ∠C.',
        answer: '70° (opposite angles of a parallelogram are equal)',
      },
      {
        question:
          'The side opposite the midpoints line is 12 cm. How long is the line joining the midpoints?',
        answer: '6 cm (midpoint theorem)',
      },
    ],
  },
  statistics: {
    idea: 'Mean = total ÷ how many. Median = the middle value once sorted. Mode = the most common value.',
    example: {
      question: 'Find the mean of 4, 7, 7, 9, 13',
      steps: ['Total: 4 + 7 + 7 + 9 + 13 = 40', 'How many: 5', '40 ÷ 5'],
      answer: 'Mean = 8',
    },
    pattern: {
      rows: [
        ['2, 5, 9', 'range 7'],
        ['1, 4, 10', 'range 9'],
        ['3, 3, 8', 'range 5'],
        ['6, 11, 20', 'range 14'],
      ],
      rule: 'Range = biggest value − smallest value.',
    },
    realWorld: {
      question:
        'Your test marks are 45, 52, 52, 60 and 71. What is the mode, and what is your average?',
      answer: 'Mode 52; mean 280 ÷ 5 = 56',
    },
    diagram: {
      kind: 'bars',
      title: 'The numbers and their mean',
      bars: [
        { label: '4', value: 4 },
        { label: '7', value: 7 },
        { label: '7', value: 7 },
        { label: '9', value: 9 },
        { label: '13', value: 13 },
      ],
      line: { value: 8, label: 'mean = 8' },
    },
    gossip: [
      ['t', 'Mean, median and mode are triplets, but they have VERY different personalities 👯‍♀️'],
      ['y', 'Who’s who?'],
      [
        't',
        'Mean is the fair one: add everything up and share it equally. 4, 7, 7, 9, 13 → 40 ÷ 5 = 8.',
      ],
      [
        't',
        'Median is the one in the middle — but only once the numbers are lined up in order. Mode is the popular one: the number that shows up most.',
      ],
      ['y', 'And range?'],
      [
        't',
        'Biggest minus smallest. And please sort your numbers before finding the median. Unsorted median is a crime 🚨',
      ],
    ],
    mistake: 'Finding the median without sorting the numbers first.',
    checks: [
      { question: 'Median of 9, 2, 5, 7, 3', answer: '5' },
      { question: 'Mode of 2, 4, 4, 6, 4, 8', answer: '4' },
    ],
  },
  probability: {
    idea: 'P(event) = favourable outcomes ÷ total outcomes. It is always between 0 and 1.',
    example: {
      question: 'A bag has 3 red and 5 blue sweets. Find P(red).',
      steps: ['Favourable outcomes: 3 red', 'Total outcomes: 3 + 5 = 8', 'P(red) = 3 ÷ 8'],
      answer: '3/8',
    },
    pattern: {
      rows: [
        ['P(A) = 0.2', 'P(not A) = 0.8'],
        ['P(A) = 0.5', 'P(not A) = 0.5'],
        ['P(A) = 0.35', 'P(not A) = 0.65'],
        ['P(A) = 0.9', 'P(not A) = 0.1'],
      ],
      rule: 'P(not A) = 1 − P(A).',
    },
    realWorld: {
      question: 'A school raffle sells 200 tickets and you buy 4. What is your chance of winning?',
      answer: '4 ÷ 200 = 0.02 (1 in 50)',
    },
    diagram: {
      kind: 'dots',
      title: 'The bag of sweets',
      groups: [
        { label: 'red', count: 3 },
        { label: 'blue', count: 5 },
      ],
    },
    gossip: [
      [
        't',
        'Probability is just: how many ways can the thing happen, out of everything that could happen? 🎲',
      ],
      ['y', 'Example?'],
      ['t', 'A bag has 3 red and 5 blue sweets. P(red) = 3 out of 8 = 3/8.'],
      [
        't',
        'And the chance of something NOT happening is 1 minus the chance it does. P(A) = 0.2? Then P(not A) = 0.8.',
      ],
      ['y', 'Can I always add probabilities?'],
      [
        't',
        'Only if the events can’t happen at the same time — mutually exclusive. Otherwise you’re counting some outcomes twice 👀',
      ],
    ],
    mistake: 'Adding probabilities of events that can happen together (not mutually exclusive).',
    checks: [
      { question: 'Roll a die. P(even number)?', answer: '1/2' },
      {
        question: 'A and B are mutually exclusive, P(A) = 0.3, P(B) = 0.4. P(A or B)?',
        answer: '0.7',
      },
    ],
  },
  'finance and growth': {
    idea: 'Simple interest adds the same amount each year: A = P(1 + in). Compound interest earns interest on interest: A = P(1 + i)ⁿ.',
    example: {
      question: 'R1 000 at 10% simple interest for 3 years',
      steps: ['A = 1 000(1 + 0.1 × 3)', '= 1 000 × 1.3'],
      answer: 'R1 300',
    },
    pattern: {
      rows: [
        ['year 1', 'R1 100'],
        ['year 2', 'R1 210'],
        ['year 3', 'R1 331'],
        ['year 4', 'R1 464.10'],
      ],
      rule: 'R1 000 at 10% compound interest: multiply by 1.1 every year.',
    },
    realWorld: {
      question:
        'A R6 000 phone on credit at 20% simple interest for 2 years. What do you really pay?',
      answer: '6 000(1 + 0.2 × 2) = R8 400, so R2 400 extra',
    },
    diagram: {
      kind: 'bars',
      title: 'R1 000 growing at 10% compound interest',
      unit: 'R',
      bars: [
        { label: 'now', value: 1000 },
        { label: 'yr 1', value: 1100 },
        { label: 'yr 2', value: 1210 },
        { label: 'yr 3', value: 1331 },
        { label: 'yr 4', value: 1464 },
      ],
    },
    gossip: [
      [
        't',
        'Okay so simple interest and compound interest are NOT the same and the difference is juicy 💰',
      ],
      ['y', 'Spill'],
      [
        't',
        'Simple interest: same amount every year. R1 000 at 10% gets R100 a year, always. A = P(1 + in).',
      ],
      [
        't',
        'Compound interest earns interest on the interest. R1 000 → R1 100 → R1 210 → R1 331. A = P(1 + i)ⁿ. It snowballs ❄️',
      ],
      ['y', 'So that’s why store credit is so expensive'],
      [
        't',
        'EXACTLY. And in the formula, 10% is i = 0.1 — not 10. Put in 10 and you’ll be a billionaire on paper 😂',
      ],
    ],
    mistake: 'Using i = 10 instead of i = 0.1 for 10%.',
    checks: [
      { question: 'R2 000 at 5% compound interest for 2 years', answer: 'R2 205' },
      { question: 'Simple interest earned on R500 at 8% for 2 years', answer: 'R80' },
    ],
  },
};
