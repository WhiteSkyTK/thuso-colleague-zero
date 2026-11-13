import type { TopicLesson } from './TopicLesson';

/** CAPS Physical Sciences, Grades 10–12: one short lesson per topic. */
export const SCIENCE_LESSONS: Readonly<Record<string, TopicLesson>> = {
  'matter and materials': {
    idea: 'An element has one kind of atom, a compound has elements bonded in a fixed ratio, a mixture can be separated physically.',
    example: {
      question: 'Classify copper, oxygen (O₂) and salt water.',
      steps: [
        'Copper: one kind of atom → element',
        'O₂: one kind of atom → element',
        'Salt water: separated by evaporation → mixture',
      ],
      answer: 'element, element, mixture',
    },
    pattern: {
      rows: [
        ['Fe', 'element'],
        ['H₂O', 'compound'],
        ['air', 'mixture'],
        ['CO₂', 'compound'],
      ],
      rule: 'Two or more elements chemically bonded make a compound.',
    },
    realWorld: {
      question: 'Why are pots made of steel but have plastic handles?',
      answer: 'Steel conducts heat to the food; plastic insulates, so you do not burn your hand',
    },
    mistake: 'Calling a compound a mixture — a compound has a fixed ratio and new properties.',
    checks: [
      { question: 'Is steel a mixture or a compound?', answer: 'A mixture (an alloy)' },
      {
        question: 'Which property makes copper good for wires?',
        answer: 'It conducts electricity well',
      },
    ],
  },
  'atomic structure': {
    idea: 'Protons and neutrons are in the nucleus; electrons move around it. Atomic number = number of protons.',
    example: {
      question: 'Sodium: atomic number 11, mass number 23. How many neutrons?',
      steps: ['neutrons = mass number − atomic number', '= 23 − 11'],
      answer: '12 neutrons',
    },
    pattern: {
      rows: [
        ['H (1)', '1'],
        ['Li (3)', '2, 1'],
        ['Na (11)', '2, 8, 1'],
        ['Cl (17)', '2, 8, 7'],
      ],
      rule: 'Electron shells fill 2, then 8, then 8.',
    },
    realWorld: {
      question: 'Smoke detectors use americium-241. What does the 241 tell you?',
      answer: 'The mass number: protons + neutrons = 241',
    },
    diagram: {
      kind: 'dots',
      title: 'Inside a sodium atom',
      groups: [
        { label: 'protons', count: 11 },
        { label: 'neutrons', count: 12 },
        { label: 'electrons', count: 11 },
      ],
    },
    mistake: 'Swapping the mass number and the atomic number.',
    checks: [
      {
        question: 'How many electrons in a neutral magnesium atom (atomic number 12)?',
        answer: '12',
      },
      {
        question: 'What is different between isotopes of an element?',
        answer: 'The number of neutrons',
      },
    ],
  },
  'chemical bonding': {
    idea: 'Atoms bond to get a full outer shell: metals give electrons to non-metals (ionic); non-metals share electrons (covalent).',
    example: {
      question: 'How do sodium and chlorine bond?',
      steps: [
        'Na has 1 outer electron; Cl has 7',
        'Na gives its electron to Cl',
        'Na⁺ and Cl⁻ attract each other',
      ],
      answer: 'An ionic bond (NaCl)',
    },
    pattern: {
      rows: [
        ['group 1', '+1'],
        ['group 2', '+2'],
        ['group 16', '−2'],
        ['group 17', '−1'],
      ],
      rule: 'The charge of an ion follows its group in the periodic table.',
    },
    realWorld: {
      question: 'Why does salt dissolve in water but candle wax does not?',
      answer: 'Salt is ionic and water pulls its ions apart; wax is covalent and non-polar',
    },
    mistake: 'Calling a bond between two non-metals ionic — it is covalent.',
    checks: [
      { question: 'Which bond holds H₂O together?', answer: 'Covalent' },
      { question: 'Formula of magnesium chloride', answer: 'MgCl₂' },
    ],
  },
  'waves and sound': {
    idea: 'Wave speed = frequency × wavelength (v = fλ).',
    example: {
      question: 'f = 200 Hz and λ = 1.7 m. Find the speed.',
      steps: ['v = fλ', '= 200 × 1.7'],
      answer: '340 m·s⁻¹',
    },
    pattern: {
      rows: [
        ['170 Hz', '2 m'],
        ['340 Hz', '1 m'],
        ['680 Hz', '0.5 m'],
        ['1 360 Hz', '0.25 m'],
      ],
      rule: 'At the same speed, doubling the frequency halves the wavelength.',
    },
    realWorld: {
      question: 'At a concert a 680 Hz note travels at 340 m·s⁻¹. How long is each wave?',
      answer: 'λ = v ÷ f = 340 ÷ 680 = 0.5 m',
    },
    diagram: { kind: 'wave', wavelength: 'λ = 1.7 m', amplitude: 'amplitude' },
    mistake: 'Leaving out units: Hz × m gives m·s⁻¹.',
    checks: [
      { question: 'Period of a 50 Hz wave', answer: '0.02 s (T = 1 ÷ f)' },
      { question: 'Does sound travel faster in solids or in gases?', answer: 'In solids' },
    ],
  },
  electricity: {
    idea: 'V = IR. In series, resistances add up; in parallel, the total is smaller than the smallest resistor.',
    example: {
      question: '12 V across a 4 Ω resistor. Find the current.',
      steps: ['I = V ÷ R', '= 12 ÷ 4'],
      answer: '3 A',
    },
    pattern: {
      rows: [
        ['2 Ω + 3 Ω in series', '5 Ω'],
        ['4 Ω + 4 Ω in series', '8 Ω'],
        ['1 Ω + 2 Ω + 3 Ω in series', '6 Ω'],
        ['5 Ω + 10 Ω in series', '15 Ω'],
      ],
      rule: 'Series resistances simply add up.',
    },
    realWorld: {
      question: 'A 2 000 W kettle runs on 230 V. What current does it draw?',
      answer: 'I = P ÷ V ≈ 8.7 A',
    },
    mistake: 'Adding parallel resistors like series ones. Use 1/R = 1/R₁ + 1/R₂.',
    checks: [
      { question: 'Two 6 Ω resistors in parallel', answer: '3 Ω' },
      { question: 'Power with 12 V and 2 A', answer: '24 W (P = VI)' },
    ],
  },
  mechanics: {
    idea: 'Velocity is speed with a direction. Acceleration is how fast velocity changes: a = (v − u) ÷ t.',
    example: {
      question: 'A car goes from 0 to 20 m·s⁻¹ in 5 s. Find its acceleration.',
      steps: ['a = (v − u) ÷ t', '= (20 − 0) ÷ 5'],
      answer: '4 m·s⁻²',
    },
    pattern: {
      rows: [
        ['t = 1 s', 'v = 2 m·s⁻¹'],
        ['t = 2 s', 'v = 4 m·s⁻¹'],
        ['t = 3 s', 'v = 6 m·s⁻¹'],
        ['t = 5 s', 'v = 10 m·s⁻¹'],
      ],
      rule: 'Starting from rest at 2 m·s⁻²: v = u + at.',
    },
    realWorld: {
      question: 'A minibus taxi goes from 0 to 25 m·s⁻¹ in 10 s. What is its acceleration?',
      answer: '25 ÷ 10 = 2.5 m·s⁻²',
    },
    diagram: {
      kind: 'bars',
      title: 'Speed each second at 2 m·s⁻²',
      unit: 'm·s⁻¹',
      bars: [
        { label: '1 s', value: 2 },
        { label: '2 s', value: 4 },
        { label: '3 s', value: 6 },
        { label: '4 s', value: 8 },
        { label: '5 s', value: 10 },
      ],
    },
    mistake: 'Forgetting direction: vectors need a sign or a direction.',
    checks: [
      { question: 'F = ma: m = 2 kg, a = 3 m·s⁻². Find F.', answer: '6 N' },
      { question: 'Weight of a 10 kg mass (g = 9.8 m·s⁻²)', answer: '98 N' },
    ],
  },
  energy: {
    idea: 'Energy is never lost — it changes form. Ep = mgh and Ek = ½mv².',
    example: {
      question: 'A 2 kg ball is 5 m above the ground (g = 9.8 m·s⁻²). Find Ep.',
      steps: ['Ep = mgh', '= 2 × 9.8 × 5'],
      answer: '98 J',
    },
    pattern: {
      rows: [
        ['m = 2 kg, v = 1 m·s⁻¹', '1 J'],
        ['m = 2 kg, v = 2 m·s⁻¹', '4 J'],
        ['m = 2 kg, v = 3 m·s⁻¹', '9 J'],
        ['m = 2 kg, v = 4 m·s⁻¹', '16 J'],
      ],
      rule: 'Double the speed → four times the kinetic energy.',
    },
    realWorld: {
      question: 'Why is a crash at 120 km/h so much worse than at 60 km/h?',
      answer: 'Ek grows with v²: twice the speed is four times the energy',
    },
    diagram: {
      kind: 'bars',
      title: 'Kinetic energy as the speed grows',
      unit: 'J',
      bars: [
        { label: '1 m/s', value: 1 },
        { label: '2 m/s', value: 4 },
        { label: '3 m/s', value: 9 },
        { label: '4 m/s', value: 16 },
      ],
    },
    mistake: 'Forgetting the ½ or forgetting to square v.',
    checks: [
      { question: 'Ek of 4 kg moving at 3 m·s⁻¹', answer: '18 J' },
      { question: 'As a ball falls, Ep changes into…', answer: 'Kinetic energy' },
    ],
  },
  'chemical change': {
    idea: 'In a chemical change new substances form. Atoms are rearranged, never lost — so equations must balance.',
    example: {
      question: 'Balance H₂ + O₂ → H₂O',
      steps: [
        'O: 2 on the left, 1 on the right → 2H₂O',
        'H: now 2 on the left, 4 on the right → 2H₂',
      ],
      answer: '2H₂ + O₂ → 2H₂O',
    },
    pattern: {
      rows: [
        ['18 g water', '1 mol'],
        ['36 g water', '2 mol'],
        ['9 g water', '0.5 mol'],
        ['54 g water', '3 mol'],
      ],
      rule: 'n = m ÷ M (water: M = 18 g·mol⁻¹).',
    },
    realWorld: {
      question: 'Why does a cut apple turn brown?',
      answer: 'A chemical change: substances in the apple react with oxygen in the air',
    },
    diagram: {
      kind: 'dots',
      title: 'Atoms in 2H₂ + O₂',
      groups: [
        { label: 'H', count: 4 },
        { label: 'O', count: 2 },
      ],
    },
    mistake: 'Changing the small numbers (subscripts) instead of the big numbers in front.',
    checks: [
      { question: 'Burning paper: physical or chemical change?', answer: 'Chemical' },
      { question: 'Molar mass of CO₂', answer: '44 g·mol⁻¹' },
    ],
  },
};
