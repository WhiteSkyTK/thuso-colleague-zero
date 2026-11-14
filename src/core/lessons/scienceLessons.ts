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
    gossip: [
      [
        't',
        'Everything around you is either an element, a compound or a mixture. Let me explain the relationships 💞',
      ],
      ['y', 'Okay'],
      ['t', 'An element is single: one kind of atom, like copper or oxygen.'],
      [
        't',
        'A compound is MARRIED: elements chemically bonded in a fixed ratio, like H₂O. Getting them apart takes a chemical reaction.',
      ],
      ['y', 'And a mixture?'],
      [
        't',
        'Just dating 😂 Salt water, air, steel — mixed together but you can separate them physically, like by evaporation.',
      ],
    ],
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
    gossip: [
      ['t', 'Every atom is basically a tiny celebrity with a crew 🌟'],
      ['y', 'A crew?'],
      [
        't',
        'In the middle, the nucleus: protons and neutrons. Around it, the electrons in shells — 2, then 8, then 8.',
      ],
      [
        't',
        'The atomic number is how many protons. The mass number is protons + neutrons. So neutrons = mass number − atomic number.',
      ],
      ['y', 'Sodium is 11 and 23?'],
      [
        't',
        'Yes! 23 − 11 = 12 neutrons. And don’t swap the two numbers — the mass number is always the bigger one.',
      ],
    ],
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
    gossip: [
      ['t', 'Atoms all want ONE thing: a full outer shell. And they’ll do anything to get it 😏'],
      ['y', 'Anything?'],
      [
        't',
        'Sodium has one extra electron, chlorine needs one. So sodium just GIVES it away. Na⁺ and Cl⁻ attract — ionic bond.',
      ],
      [
        't',
        'Two non-metals, though? Neither wants to give, so they SHARE. That’s covalent, like H₂O.',
      ],
      ['y', 'So metal + non-metal = ionic?'],
      [
        't',
        'You got it. Non-metal + non-metal = covalent. Calling water ionic is a classic way to lose the mark.',
      ],
    ],
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
    gossip: [
      ['t', 'Every wave follows one rule: speed = frequency × wavelength. v = fλ 🌊'],
      ['y', 'What does that mean in real life?'],
      [
        't',
        'Sound in air travels at about 340 m·s⁻¹. A 200 Hz note with 1.7 m waves: 200 × 1.7 = 340. Checks out.',
      ],
      [
        't',
        'And if the speed stays the same, double the frequency and the wavelength halves. High notes have short waves.',
      ],
      ['y', 'Anything else I should know?'],
      [
        't',
        'Sound travels FASTER in solids than in gases. And always write your units: m·s⁻¹. Bare numbers are just vibes.',
      ],
    ],
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
    gossip: [
      ['t', 'Electricity has one celebrity formula: V = IR ⚡'],
      ['y', 'What’s what?'],
      [
        't',
        'V is the push (voltage), I is the flow (current), R is how hard it is to get through (resistance). 12 V across 4 Ω? I = 12 ÷ 4 = 3 A.',
      ],
      ['t', 'Resistors in series just add up: 2 Ω + 3 Ω = 5 Ω. Easy.'],
      ['y', 'And in parallel?'],
      [
        't',
        'That’s where people slip 🫣 In parallel the total gets SMALLER — two 6 Ω resistors give 3 Ω. Use 1/R = 1/R₁ + 1/R₂.',
      ],
    ],
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
    gossip: [
      ['t', 'Speed and velocity are NOT the same thing and physics will fight you on this 🥊'],
      ['y', 'Why not?'],
      [
        't',
        'Velocity is speed WITH a direction. 20 m·s⁻¹ east is a velocity. And acceleration is how fast velocity changes: a = (v − u) ÷ t.',
      ],
      ['t', 'A car goes from 0 to 20 m·s⁻¹ in 5 s? a = 20 ÷ 5 = 4 m·s⁻².'],
      ['y', 'And force?'],
      [
        't',
        'Newton’s second law: F = ma. And always give the direction for vectors — leaving it out is the easiest mark to lose.',
      ],
    ],
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
    gossip: [
      ['t', 'Energy never disappears, it just changes outfits 👗'],
      ['y', 'Huh?'],
      [
        't',
        'A ball held up high has potential energy: Ep = mgh. Let it fall and that energy turns into kinetic energy: Ek = ½mv².',
      ],
      [
        't',
        'And here’s the scary part: double the speed and the kinetic energy goes up FOUR times.',
      ],
      ['y', 'That’s why fast crashes are so bad'],
      [
        't',
        'Exactly. And in the formula, don’t forget the ½ and don’t forget to square v. Those two slips cost the most marks.',
      ],
    ],
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
    gossip: [
      ['t', 'In a chemical reaction, atoms just switch partners. Nobody leaves the party 🎉'],
      ['y', 'What do you mean?'],
      [
        't',
        'H₂ + O₂ → H₂O looks fine, but count: 2 oxygens on the left, 1 on the right. Someone went missing!',
      ],
      [
        't',
        'Fix it with the BIG numbers in front: 2H₂ + O₂ → 2H₂O. Now 4 H and 2 O on each side. Balanced.',
      ],
      ['y', 'Can’t I just change H₂O to H₂O₂?'],
      [
        't',
        'NO 😱 That changes the substance completely — that’s hydrogen peroxide! Never change the small numbers.',
      ],
    ],
    mistake: 'Changing the small numbers (subscripts) instead of the big numbers in front.',
    checks: [
      { question: 'Burning paper: physical or chemical change?', answer: 'Chemical' },
      { question: 'Molar mass of CO₂', answer: '44 g·mol⁻¹' },
    ],
  },
};
