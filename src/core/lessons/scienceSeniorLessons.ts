import type { TopicLesson } from './TopicLesson';

/** CAPS Physical Sciences, Grades 11 and 12: topics beyond Grade 10. */
export const SCIENCE_SENIOR_LESSONS: Readonly<Record<string, TopicLesson>> = {
  'vectors in two dimensions': {
    idea: 'Vectors have size and direction. Add them head to tail; for perpendicular vectors use Pythagoras for the size and tan for the direction.',
    example: {
      question: 'You walk 3 km east, then 4 km north. Resultant displacement?',
      steps: ['Perpendicular, so R² = 3² + 4²', 'R = 5 km', 'tan θ = 4/3 → θ ≈ 53° north of east'],
      answer: '5 km at 53° north of east',
    },
    pattern: {
      rows: [
        ['3 and 4 at 90°', '5'],
        ['6 and 8', '10'],
        ['5 and 12', '13'],
        ['9 and 12', '15'],
      ],
      rule: 'Perpendicular vectors: R = √(a² + b²).',
    },
    realWorld: {
      question:
        'A plane flies north at 300 km/h with a 40 km/h wind from the west. Resultant speed?',
      answer: '√(300² + 40²) ≈ 302.7 km/h',
    },
    gossip: [
      ['t', 'Vectors are numbers with a sense of direction, unlike some people I know 🧭'],
      ['y', 'Haha okay'],
      ['t', '3 km east plus 4 km north is NOT 7 km. You end up 5 km away — Pythagoras.'],
      ['t', 'Then tan gives the angle: about 53° north of east. Size AND direction, every time.'],
      ['y', 'So just adding is wrong?'],
      ['t', 'Only if they point the same way. Otherwise draw it head to tail first.'],
    ],
    mistake: 'Adding vector sizes like ordinary numbers when they point in different directions.',
    checks: [
      { question: 'Resultant of 6 N east and 8 N north?', answer: '10 N' },
      {
        question: 'What is a resultant?',
        answer: 'The single vector with the same effect as all the vectors together',
      },
    ],
  },
  "newton's laws": {
    idea: 'First law: no net force → no change in motion (inertia). Second law: Fnet = ma. Third law: forces come in equal, opposite pairs on DIFFERENT objects.',
    example: {
      question: 'A 1 200 kg car accelerates at 2 m·s⁻². Net force?',
      steps: ['Fnet = ma', '= 1 200 × 2'],
      answer: '2 400 N',
    },
    pattern: {
      rows: [
        ['2 kg at 3 m·s⁻²', '6 N'],
        ['5 kg at 2 m·s⁻²', '10 N'],
        ['10 kg at 0.5 m·s⁻²', '5 N'],
        ['4 kg at 2.5 m·s⁻²', '10 N'],
      ],
      rule: 'Fnet = ma.',
    },
    realWorld: {
      question: 'Why do you lurch forward when a taxi brakes suddenly?',
      answer: 'Inertia (Newton’s first law): your body keeps moving — that’s why seatbelts matter.',
    },
    gossip: [
      ['t', 'Newton basically wrote three rules and physics has followed them ever since 🍎'],
      ['y', 'Spill all three'],
      [
        't',
        'One: things keep doing what they’re doing unless a force interferes — that’s why you fly forward when the taxi brakes.',
      ],
      [
        't',
        'Two: Fnet = ma. Three: every force has a partner, equal and opposite — but on a DIFFERENT object.',
      ],
      ['y', 'Why “different”?'],
      [
        't',
        'Because if they acted on the same object they’d cancel and nothing would ever move. Exam favourite!',
      ],
    ],
    mistake:
      'Putting a third-law pair on the same object — the two forces act on different objects.',
    checks: [
      { question: 'Net force on a 3 kg box accelerating at 4 m·s⁻²?', answer: '12 N' },
      { question: 'Weight of a 60 kg learner (g = 9.8 m·s⁻²)?', answer: '588 N' },
    ],
  },
  'intermolecular forces': {
    idea: 'Forces between molecules: London forces (weakest), dipole–dipole, hydrogen bonds (strongest). Stronger forces → higher boiling point.',
    example: {
      question: 'Why does water boil at 100 °C but methane at −162 °C?',
      steps: [
        'Water molecules hold each other with hydrogen bonds',
        'Methane has only weak London forces',
        'Stronger forces need more energy to break',
      ],
      answer: 'Water’s hydrogen bonds are much stronger',
    },
    pattern: {
      rows: [
        ['London forces', 'weakest'],
        ['dipole–dipole', 'stronger'],
        ['hydrogen bonds', 'strongest'],
        ['stronger forces', 'higher boiling point'],
      ],
      rule: 'Stronger intermolecular forces → higher boiling and melting points.',
    },
    realWorld: {
      question: 'How can some insects walk on water?',
      answer: 'Hydrogen bonds give water a high surface tension.',
    },
    gossip: [
      [
        't',
        'Molecules have relationships with each other and some are way clingier than others 💑',
      ],
      ['y', 'Which are the clingiest?'],
      ['t', 'Hydrogen bonds — like in water. That’s why water stays liquid up to 100 °C.'],
      [
        't',
        'Methane only has weak London forces, so it’s a gas even at −160 °C. Barely knows each other.',
      ],
      ['y', 'Is that the same as bonds inside a molecule?'],
      ['t', 'No! Intra = inside the molecule; inter = between molecules. Don’t mix them up.'],
    ],
    mistake:
      'Mixing up intramolecular bonds (inside a molecule) and intermolecular forces (between molecules).',
    checks: [
      { question: 'Strongest intermolecular force?', answer: 'Hydrogen bonding' },
      { question: 'Higher boiling point: H₂O or H₂S?', answer: 'H₂O, because of hydrogen bonds' },
    ],
  },
  'geometrical optics': {
    idea: 'Reflection: angle of incidence = angle of reflection. Refraction: light bends towards the normal when it slows down in a denser medium. Beyond the critical angle: total internal reflection.',
    example: {
      question: 'Light goes from air into glass at 30° to the normal. Which way does it bend?',
      steps: ['Glass is optically denser, so the light slows down', 'It bends towards the normal'],
      answer: 'Towards the normal — a smaller angle in the glass',
    },
    pattern: {
      rows: [
        ['i = 20°', 'reflected at 20°'],
        ['i = 35°', 'reflected at 35°'],
        ['i = 50°', 'reflected at 50°'],
        ['i = 65°', 'reflected at 65°'],
      ],
      rule: 'Reflection: the angle of incidence equals the angle of reflection.',
    },
    realWorld: {
      question: 'How do optic-fibre cables carry internet light around corners?',
      answer: 'Total internal reflection keeps the light bouncing along inside the fibre.',
    },
    gossip: [
      ['t', 'Your Wi-Fi literally depends on light refusing to leave a glass fibre 🌐'],
      ['y', 'Wait what?'],
      [
        't',
        'When light hits a less dense material at a steep enough angle — past the critical angle — it can’t escape. Total internal reflection.',
      ],
      ['t', 'Normal refraction: into denser glass, light slows and bends TOWARDS the normal.'],
      ['y', 'Angles from the surface?'],
      ['t', 'No! Always from the normal, the line at 90°. That’s where marks get lost.'],
    ],
    mistake: 'Measuring angles from the surface instead of from the normal.',
    checks: [
      {
        question: 'When does total internal reflection happen?',
        answer: 'From a denser to a less dense medium, at more than the critical angle',
      },
      { question: 'What is the normal?', answer: 'A line at 90° to the surface' },
    ],
  },
  electrostatics: {
    idea: 'Like charges repel, unlike charges attract. Coulomb’s law: F = kQ₁Q₂/r² — double the distance, a quarter of the force. Charge is conserved.',
    example: {
      question: 'Identical spheres with +6 nC and −2 nC touch and separate. Charge on each?',
      steps: ['Total: +6 + (−2) = +4 nC', 'Shared equally: +4 ÷ 2'],
      answer: '+2 nC each',
    },
    pattern: {
      rows: [
        ['distance × 2', 'force ÷ 4'],
        ['distance × 3', 'force ÷ 9'],
        ['distance ÷ 2', 'force × 4'],
        ['one charge × 2', 'force × 2'],
      ],
      rule: 'Inverse square law: F ∝ 1/r².',
    },
    realWorld: {
      question: 'Why does a balloon rubbed on your hair stick to a wall?',
      answer:
        'Rubbing moves electrons; the charged balloon induces opposite charge in the wall, so they attract.',
    },
    gossip: [
      ['t', 'Charges have the simplest love life: opposites attract, likes repel 🧲'],
      ['y', 'And how strong?'],
      [
        't',
        'Coulomb’s law. Move them twice as far apart and the force drops to a QUARTER, because distance is squared.',
      ],
      [
        't',
        'And when two identical spheres touch, they share the total charge equally. +6 and −2 → +2 each.',
      ],
      ['y', 'Why a quarter, not a half?'],
      ['t', 'Because it’s r². Forgetting to square r is the number one mistake here.'],
    ],
    mistake: 'Forgetting to square the distance in Coulomb’s law.',
    checks: [
      {
        question: 'The distance is halved. What happens to the force?',
        answer: 'It becomes 4 times bigger',
      },
      {
        question: 'Identical spheres with +8 nC and +2 nC touch. Charge on each?',
        answer: '+5 nC',
      },
    ],
  },
  'momentum and impulse': {
    idea: 'Momentum p = mv. In a closed system, total momentum is conserved. Impulse = Fnet·Δt = Δp.',
    example: {
      question:
        'A 0.5 kg ball hits a wall at 10 m·s⁻¹ and bounces back at 8 m·s⁻¹. Change in momentum?',
      steps: [
        'Towards the wall is positive: pᵢ = 0.5 × 10 = 5 kg·m·s⁻¹',
        'p_f = 0.5 × (−8) = −4 kg·m·s⁻¹',
        'Δp = −4 − 5',
      ],
      answer: '−9 kg·m·s⁻¹ (9 kg·m·s⁻¹ away from the wall)',
    },
    pattern: {
      rows: [
        ['2 kg at 3 m·s⁻¹', '6 kg·m·s⁻¹'],
        ['5 kg at 4 m·s⁻¹', '20 kg·m·s⁻¹'],
        ['0.2 kg at 15 m·s⁻¹', '3 kg·m·s⁻¹'],
        ['1 500 kg at 20 m·s⁻¹', '30 000 kg·m·s⁻¹'],
      ],
      rule: 'p = mv.',
    },
    realWorld: {
      question: 'Why do airbags make crashes safer?',
      answer:
        'They make the stopping time longer, so the force for the same change in momentum is smaller.',
    },
    gossip: [
      ['t', 'Airbags are pure physics and they’re saving lives every day 🚗💥'],
      ['y', 'How?'],
      ['t', 'In a crash your momentum has to drop to zero no matter what. Impulse: F × Δt = Δp.'],
      ['t', 'The airbag makes Δt longer, so the force F on you is smaller. Same Δp, gentler stop.'],
      ['y', 'And the bouncing-ball sums?'],
      [
        't',
        'Watch the direction! Bounce back = negative velocity. Ignore it and your Δp is wrong.',
      ],
    ],
    mistake: 'Ignoring direction — when an object bounces back, its velocity changes sign.',
    checks: [
      { question: 'Momentum of a 70 kg runner at 5 m·s⁻¹?', answer: '350 kg·m·s⁻¹' },
      { question: 'Impulse equals the change in…', answer: 'momentum' },
    ],
  },
  'vertical projectile motion': {
    idea: 'Only gravity acts: a = 9.8 m·s⁻² downwards, all the time. At the top v = 0. Use v_f = v_i + gΔt and Δy = v_iΔt + ½gΔt².',
    example: {
      question: 'A ball is thrown up at 19.6 m·s⁻¹. How long to reach the top?',
      steps: ['At the top v_f = 0', '0 = 19.6 − 9.8Δt', 'Δt = 2 s'],
      answer: '2 s (and 4 s to get back to the hand)',
    },
    pattern: {
      rows: [
        ['thrown up at 9.8 m·s⁻¹', '1 s to the top'],
        ['19.6 m·s⁻¹', '2 s'],
        ['29.4 m·s⁻¹', '3 s'],
        ['49 m·s⁻¹', '5 s'],
      ],
      rule: 'Time to the top = initial speed ÷ 9.8.',
    },
    realWorld: {
      question:
        'You drop a stone into a well and hear the splash after 2 s. About how deep is it (ignore the sound’s time)?',
      answer: '½ × 9.8 × 2² ≈ 19.6 m',
    },
    gossip: [
      ['t', 'Throw a ball straight up and gravity is the ONLY one in charge the whole time ⬆️⬇️'],
      ['y', 'Even at the top?'],
      [
        't',
        'Especially at the top! The velocity is 0 for a moment, but the acceleration is still 9.8 m·s⁻² down.',
      ],
      ['t', 'Thrown up at 19.6 m·s⁻¹? Two seconds to the top, two back down. Symmetrical.'],
      ['y', 'So acceleration is zero at the top?'],
      ['t', 'NEVER. That’s the most famous wrong answer in Grade 12 physics 😭'],
    ],
    mistake: 'Saying the acceleration is zero at the top — it is always 9.8 m·s⁻² downwards.',
    checks: [
      { question: 'Velocity at the highest point?', answer: '0 m·s⁻¹' },
      { question: 'Acceleration at the highest point?', answer: '9.8 m·s⁻² downwards' },
    ],
  },
  'organic chemistry': {
    idea: 'Organic compounds are carbon chains. The prefix counts carbons (meth-, eth-, prop-, but-); the ending shows the group: alkane -ane, alkene -ene (C=C), alcohol -ol, carboxylic acid -oic acid; acid + alcohol → ester.',
    example: {
      question: 'Name CH₃CH₂CH₂OH.',
      steps: [
        'Count the carbons: 3 → prop-',
        'Functional group –OH → alcohol (-ol)',
        'It is on carbon 1',
      ],
      answer: 'Propan-1-ol',
    },
    pattern: {
      rows: [
        ['1 carbon', 'meth-'],
        ['2 carbons', 'eth-'],
        ['3 carbons', 'prop-'],
        ['4 carbons', 'but-'],
      ],
      rule: 'The prefix counts the carbons in the longest chain.',
    },
    realWorld: {
      question: 'What forms when an alcohol reacts with a carboxylic acid?',
      answer: 'An ester — many smell fruity and are used as flavourings.',
    },
    gossip: [
      ['t', 'Organic chemistry is all about carbon, and carbon LOVES making chains ⛓️'],
      ['y', 'How do you name them?'],
      [
        't',
        'Count the carbons in the longest chain: meth, eth, prop, but. Then the ending tells you the family.',
      ],
      [
        't',
        '-ane, -ene, -ol, -oic acid. And acid + alcohol = an ester, which often smells like fruit 🍌',
      ],
      ['y', 'What do people get wrong?'],
      ['t', 'Counting a branch as the main chain. Always hunt for the LONGEST chain first.'],
    ],
    mistake: 'Counting a branch as part of the main chain — always find the longest chain.',
    checks: [
      { question: 'General formula of the alkanes?', answer: 'CₙH₂ₙ₊₂' },
      { question: 'What makes a compound an alkene?', answer: 'A carbon–carbon double bond (C=C)' },
    ],
  },
  'rates of reaction': {
    idea: 'Reactions go faster with a higher temperature, a higher concentration, a bigger surface area or a catalyst — more effective collisions per second.',
    example: {
      question: 'Why does powdered chalk react faster with acid than a lump does?',
      steps: [
        'Powder has a much bigger surface area',
        'More particles exposed → more collisions per second',
      ],
      answer: 'Bigger surface area → faster reaction',
    },
    pattern: {
      rows: [
        ['hotter', 'faster'],
        ['more concentrated', 'faster'],
        ['powdered', 'faster'],
        ['catalyst added', 'faster'],
      ],
      rule: 'Anything that adds effective collisions speeds a reaction up.',
    },
    realWorld: {
      question: 'Why do we keep food in the fridge?',
      answer: 'Colder temperatures slow down the reactions that spoil food.',
    },
    gossip: [
      ['t', 'Particles have to literally bump into each other to react, and hard enough 💥'],
      ['y', 'Hard enough?'],
      [
        't',
        'They need at least the activation energy. Heat makes them faster, so more collisions are strong enough.',
      ],
      [
        't',
        'Powder instead of a lump, more concentrated, or a catalyst — all mean more effective collisions.',
      ],
      ['y', 'Does the catalyst get used up?'],
      ['t', 'Nope! It gives an easier path and comes out unchanged. That’s its whole charm ✨'],
    ],
    mistake: 'Saying a catalyst gets used up — it is unchanged at the end.',
    checks: [
      {
        question: 'How does a catalyst speed up a reaction?',
        answer: 'It gives a path with a lower activation energy',
      },
      {
        question: 'What is activation energy?',
        answer: 'The minimum energy needed for a reaction to happen',
      },
    ],
  },
  'chemical equilibrium': {
    idea: 'In a closed system a reversible reaction reaches dynamic equilibrium: forward and reverse rates are equal. Le Chatelier: change the conditions and the system shifts to oppose the change.',
    example: {
      question: 'N₂ + 3H₂ ⇌ 2NH₃ (exothermic). What happens if the pressure increases?',
      steps: [
        'Left: 4 mol of gas; right: 2 mol',
        'Higher pressure favours fewer gas moles',
        'The equilibrium shifts right',
      ],
      answer: 'More NH₃ forms',
    },
    pattern: {
      rows: [
        ['add a reactant', 'shifts right'],
        ['remove a product', 'shifts right'],
        ['raise the pressure', 'shifts to fewer gas moles'],
        ['heat an exothermic reaction', 'shifts left'],
      ],
      rule: 'The system opposes the change (Le Chatelier).',
    },
    realWorld: {
      question: 'Why does the Haber process (ammonia for fertiliser) run at high pressure?',
      answer: 'The product side has fewer gas moles, so high pressure gives more ammonia.',
    },
    gossip: [
      [
        't',
        'Equilibrium is the most contrary thing in chemistry — whatever you do, it pushes back 😤',
      ],
      ['y', 'Like what?'],
      [
        't',
        'Add more reactant? It makes more product to use it up. Raise the pressure? It shifts to the side with fewer gas moles.',
      ],
      [
        't',
        'Heat up an exothermic reaction? It shifts back to absorb the heat. Le Chatelier, every time.',
      ],
      ['y', 'And a catalyst?'],
      ['t', 'Doesn’t shift anything! It just gets to equilibrium faster.'],
    ],
    mistake: 'Saying a catalyst shifts the equilibrium — it only helps it get there faster.',
    checks: [
      {
        question: 'At equilibrium, how do the forward and reverse rates compare?',
        answer: 'They are equal',
      },
      {
        question: 'Does a catalyst change the yield?',
        answer: 'No — only how fast equilibrium is reached',
      },
    ],
  },
  'acids and bases': {
    idea: 'Acids donate H⁺ (protons); bases accept them. pH below 7 is acidic, 7 is neutral, above 7 is basic. Acid + base → salt + water (neutralisation).',
    example: {
      question: 'HCl + NaOH → ?',
      steps: ['Acid + base → salt + water', 'H⁺ + OH⁻ → H₂O, and Na⁺ + Cl⁻ → NaCl'],
      answer: 'NaCl + H₂O',
    },
    pattern: {
      rows: [
        ['pH 1', 'strongly acidic'],
        ['pH 7', 'neutral'],
        ['pH 10', 'basic'],
        ['pH 14', 'strongly basic'],
      ],
      rule: 'Lower pH = more acidic.',
    },
    realWorld: {
      question: 'Why do people take an antacid for heartburn?',
      answer: 'The antacid is a base that neutralises extra stomach acid.',
    },
    gossip: [
      ['t', 'Acids and bases cancel each other out and make… salt water. Plot twist 🧂'],
      ['y', 'That’s it?'],
      ['t', 'Acid gives away H⁺, base takes it. HCl + NaOH → NaCl + H₂O. Neutralisation.'],
      ['t', 'That’s why antacids work for heartburn — a base calming down extra stomach acid.'],
      ['y', 'Strong vs concentrated?'],
      [
        't',
        'Strong = fully ionised. Concentrated = lots dissolved. Different things — exam loves it.',
      ],
    ],
    mistake: 'Mixing up strong (fully ionised) and concentrated (a lot dissolved).',
    checks: [
      { question: 'pH of pure water at 25 °C?', answer: '7' },
      { question: 'Products of an acid and a metal hydroxide?', answer: 'A salt and water' },
    ],
  },
  electrochemistry: {
    idea: 'Galvanic cells turn chemical energy into electricity; electrolytic cells use electricity to drive a reaction. Oxidation (losing electrons) at the anode; reduction (gaining) at the cathode.',
    example: {
      question: 'In a Zn–Cu cell, which metal is oxidised?',
      steps: [
        'Zinc is the stronger reducing agent',
        'Zn → Zn²⁺ + 2e⁻ at the anode',
        'Cu²⁺ + 2e⁻ → Cu at the cathode',
      ],
      answer: 'Zinc is oxidised',
    },
    pattern: {
      rows: [
        ['oxidation', 'loses electrons'],
        ['reduction', 'gains electrons'],
        ['anode', 'oxidation'],
        ['cathode', 'reduction'],
      ],
      rule: 'OIL RIG: Oxidation Is Loss, Reduction Is Gain.',
    },
    realWorld: {
      question: 'How is a phone battery like a galvanic cell?',
      answer: 'Chemical reactions push electrons around the circuit, giving electrical energy.',
    },
    gossip: [
      ['t', 'Your phone battery is basically a tiny chemistry drama between two metals 🔋'],
      ['y', 'What drama?'],
      [
        't',
        'One metal loses electrons (oxidation), the other gains them (reduction). The electrons flowing between them = electricity.',
      ],
      ['t', 'Remember OIL RIG — Oxidation Is Loss, Reduction Is Gain. And AN OX, RED CAT.'],
      ['y', 'Red cat?'],
      ['t', 'Reduction at the CAThode 🐱 Put reduction at the anode and lose the mark.'],
    ],
    mistake: 'Putting reduction at the anode — reduction always happens at the cathode.',
    checks: [
      { question: 'What happens at the cathode?', answer: 'Reduction' },
      { question: 'Is electroplating galvanic or electrolytic?', answer: 'Electrolytic' },
    ],
  },
};
