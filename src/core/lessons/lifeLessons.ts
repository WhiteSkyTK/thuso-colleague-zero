import type { TopicLesson } from './TopicLesson';

/** CAPS Life Sciences, Grade 10: one short lesson per topic. */
export const LIFE_LESSONS: Readonly<Record<string, TopicLesson>> = {
  'chemistry of life': {
    idea: 'Living things are built from organic molecules: carbohydrates (energy), lipids (stored energy), proteins (growth and enzymes) and nucleic acids (the genetic code).',
    example: {
      question: 'Which food test shows starch, and what do you see?',
      steps: ['Add iodine solution to the food', 'Yellow-brown turns blue-black'],
      answer: 'The iodine test: blue-black means starch',
    },
    pattern: {
      rows: [
        ['starch', 'iodine → blue-black'],
        ['glucose', 'Benedict’s + heat → orange-red'],
        ['protein', 'Biuret → purple'],
        ['fat', 'rub on paper → see-through spot'],
      ],
      rule: 'Each nutrient has its own test and its own colour change.',
    },
    realWorld: {
      question: 'Why do runners eat pasta the night before a race?',
      answer: 'Pasta is full of starch, which the body breaks down into glucose for energy',
    },
    gossip: [
      ['t', 'Okay so your body is basically built from four main characters 🎬'],
      ['y', 'Who?'],
      [
        't',
        'Carbohydrates — the energy ones. Lipids — they store energy for later. Proteins — they build you and make enzymes. Nucleic acids — DNA, they hold all the secrets 🤫',
      ],
      ['y', 'How do you catch them in food?'],
      [
        't',
        'Iodine turns blue-black with starch. Benedict’s goes orange-red with glucose — but ONLY if you heat it. Biuret goes purple with protein.',
      ],
      [
        't',
        'And half the class forgets to heat the Benedict’s test, then wonders why nothing happened 😭',
      ],
    ],
    mistake: 'Forgetting to heat the Benedict’s test — no heat, no colour change.',
    checks: [
      { question: 'Which group of molecules do enzymes belong to?', answer: 'Proteins' },
      { question: 'Which mineral does the body need to make haemoglobin?', answer: 'Iron' },
    ],
  },
  cells: {
    idea: 'Cells are the basic units of life. Plant cells have a cell wall, chloroplasts and a large vacuole; animal cells do not. Actual size = image size ÷ magnification.',
    example: {
      question: 'A cell is 50 mm long in a drawing at ×1 000. How big is the real cell?',
      steps: [
        'Actual size = image size ÷ magnification',
        '= 50 mm ÷ 1 000 = 0.05 mm',
        '0.05 mm × 1 000 = 50 µm',
      ],
      answer: '50 µm',
    },
    pattern: {
      rows: [
        ['cell wall', 'plants only'],
        ['chloroplasts', 'plants only'],
        ['nucleus', 'plants and animals'],
        ['cell membrane', 'plants and animals'],
      ],
      rule: 'Plants have extras for support and photosynthesis.',
    },
    realWorld: {
      question: 'Why does a carrot left in salty water go floppy?',
      answer: 'Water leaves its cells by osmosis, so they lose their turgor pressure',
    },
    gossip: [
      ['t', 'So plant cells and animal cells are cousins, but plant cells are a little extra 💅'],
      ['y', 'Extra how?'],
      [
        't',
        'They have a cell WALL outside the membrane for support, chloroplasts to make food, and one big vacuole full of water.',
      ],
      ['y', 'And animal cells?'],
      [
        't',
        'Membrane, nucleus, mitochondria — no wall, no chloroplasts. Simple but they get the job done.',
      ],
      [
        't',
        'Oh and for drawings: actual size = image size ÷ magnification. And mm to µm? Times 1 000. Don’t let units embarrass you.',
      ],
    ],
    diagram: {
      kind: 'dots',
      title: 'Plant cell parts vs animal cell parts (shared + extras)',
      groups: [
        { label: 'shared parts', count: 4 },
        { label: 'plant extras', count: 3 },
      ],
    },
    mistake:
      'Calling the cell wall the cell membrane — the wall is outside the membrane and only in plants.',
    checks: [
      { question: 'Which organelle releases energy in respiration?', answer: 'The mitochondrion' },
      { question: 'Image 20 mm long at ×400. Actual size in µm?', answer: '50 µm' },
    ],
  },
  'cell division': {
    idea: 'Mitosis makes two identical daughter cells with the same number of chromosomes, for growth and repair. Phases: prophase, metaphase, anaphase, telophase.',
    example: {
      question:
        'A human body cell with 46 chromosomes divides by mitosis. How many in each daughter cell?',
      steps: ['The chromosomes are copied first', 'Each daughter cell gets a full set'],
      answer: '46',
    },
    pattern: {
      rows: [
        ['prophase', 'chromosomes become visible'],
        ['metaphase', 'they line up in the middle'],
        ['anaphase', 'they are pulled apart'],
        ['telophase', 'two new nuclei form'],
      ],
      rule: 'PMAT — Please Make A Taco 🌮 — in that order.',
    },
    realWorld: {
      question: 'How does a cut on your knee heal?',
      answer: 'Skin cells divide by mitosis to replace the damaged cells',
    },
    gossip: [
      ['t', 'Okay so a cell decided to make an exact copy of itself and the process is DRAMA 🎭'],
      ['y', 'Tell me everything'],
      [
        't',
        'Prophase: the chromosomes show up, all dressed up and visible. Metaphase: they line up in the Middle like a red carpet.',
      ],
      [
        't',
        'Anaphase: they get pulled Apart to opposite sides. Telophase: two new nuclei form and the cell splits. Two identical twins, 46 chromosomes each.',
      ],
      ['y', 'How do I remember the order?'],
      ['t', 'PMAT: Please Make A Taco 🌮. M for middle, A for apart. You’re welcome.'],
    ],
    diagram: {
      kind: 'flow',
      title: 'Mitosis, step by step',
      steps: [
        'Prophase: chromosomes appear',
        'Metaphase: line up in the middle',
        'Anaphase: pulled apart',
        'Telophase: two new nuclei',
      ],
    },
    mistake: 'Mixing up metaphase and anaphase — M for middle, A for apart.',
    checks: [
      { question: 'What is uncontrolled mitosis called?', answer: 'Cancer' },
      { question: 'In which phase do chromosomes line up at the equator?', answer: 'Metaphase' },
    ],
  },
  'plant and animal tissues': {
    idea: 'A tissue is a group of similar cells doing one job. Plants: xylem (water), phloem (food), epidermis (protection). Animals: epithelial, connective, muscle and nerve tissue.',
    example: {
      question: 'Which plant tissue carries water from the roots to the leaves?',
      steps: [
        'Water moves up from the roots',
        'Long hollow dead cells, strengthened with lignin, carry it',
      ],
      answer: 'Xylem',
    },
    pattern: {
      rows: [
        ['muscle tissue', 'movement'],
        ['nerve tissue', 'carries messages'],
        ['blood (connective)', 'transport'],
        ['epithelial tissue', 'covers and lines'],
      ],
      rule: 'A tissue’s shape matches its job.',
    },
    realWorld: {
      question: 'Why does a celery stalk turn red when it stands in red food colouring?',
      answer: 'The xylem carries the coloured water up the stalk',
    },
    gossip: [
      ['t', 'Plants have their own delivery service and honestly it’s very organised 🚚'],
      ['y', 'Go on'],
      [
        't',
        'Xylem delivers WATER up from the roots. Phloem delivers FOOD — sugars from the leaves to everywhere else.',
      ],
      ['y', 'I always mix those two up'],
      [
        't',
        'Everyone does! Think “xylem = H₂O, phloem = food”. Phloem, food — both have the f-sound.',
      ],
      [
        't',
        'And animals? Muscle moves you, nerves carry messages, blood transports, epithelial tissue covers and lines. Every tissue has one job.',
      ],
    ],
    mistake: 'Saying phloem carries water — phloem carries food (sugars); xylem carries water.',
    checks: [
      { question: 'Which plant tissue carries sugars?', answer: 'Phloem' },
      { question: 'Which animal tissue carries messages?', answer: 'Nerve tissue' },
    ],
  },
  'support and transport in plants': {
    idea: 'Water enters root hairs by osmosis, travels up the xylem and leaves through the stomata (transpiration). Transpiration pulls water up like a straw.',
    example: {
      question: 'Put in order: stomata, root hair, xylem, leaf cells.',
      steps: [
        'Root hair takes in water by osmosis',
        'Xylem carries it up the stem',
        'Leaf cells use some for photosynthesis',
        'Stomata let water vapour out',
      ],
      answer: 'root hair → xylem → leaf cells → stomata',
    },
    pattern: {
      rows: [
        ['hot day', 'faster transpiration'],
        ['windy day', 'faster transpiration'],
        ['humid day', 'slower transpiration'],
        ['dark (stomata closed)', 'slower transpiration'],
      ],
      rule: 'Anything that carries water vapour away faster speeds transpiration up.',
    },
    realWorld: {
      question: 'Why do farmers water crops early in the morning or late in the afternoon?',
      answer: 'Less transpiration and evaporation then, so less water is wasted',
    },
    gossip: [
      [
        't',
        'So how does water get from the soil all the way to the top of a tree? It’s a whole heist 🕵️',
      ],
      ['y', 'A heist??'],
      [
        't',
        'Root hairs sneak the water in by osmosis. Then the xylem carries it up the stem like an elevator.',
      ],
      [
        't',
        'The leaves use some for photosynthesis, and the rest escapes through the stomata as vapour. That’s transpiration — and it PULLS more water up behind it, like sucking a straw 🥤',
      ],
      ['y', 'What makes it faster?'],
      [
        't',
        'Heat, wind and light speed it up. Humid air slows it down. And it’s osmosis into root hairs, NOT diffusion — the examiners check that.',
      ],
    ],
    diagram: {
      kind: 'flow',
      title: 'The water’s journey through a plant',
      steps: [
        'Soil water',
        'Root hairs (osmosis)',
        'Xylem in the stem',
        'Leaves',
        'Stomata → air (transpiration)',
      ],
    },
    mistake: 'Saying water enters root hairs by diffusion — it is osmosis.',
    checks: [
      { question: 'Which instrument measures the rate of transpiration?', answer: 'A potometer' },
      { question: 'Which cells open and close the stomata?', answer: 'Guard cells' },
    ],
  },
  'biosphere to ecosystems': {
    idea: 'Energy flows from the sun to producers to consumers. Only about 10% of the energy passes on to the next level.',
    example: {
      question:
        'Grass has 10 000 kJ of energy. How much reaches the lion in grass → impala → lion?',
      steps: ['The impala gets 10%: 1 000 kJ', 'The lion gets 10% of that: 100 kJ'],
      answer: '100 kJ',
    },
    pattern: {
      rows: [
        ['producer', '10 000 kJ'],
        ['primary consumer', '1 000 kJ'],
        ['secondary consumer', '100 kJ'],
        ['tertiary consumer', '10 kJ'],
      ],
      rule: 'Each level gets about 10% of the level below it.',
    },
    realWorld: {
      question: 'Why are there far fewer lions than impala in the Kruger Park?',
      answer:
        'Only about 10% of the energy passes up each level, so there is little left for top predators',
    },
    gossip: [
      [
        't',
        'Okay, the sun is the ultimate influencer — ALL the energy in an ecosystem starts with it ☀️',
      ],
      ['y', 'Then what?'],
      [
        't',
        'Grass catches the sunlight and makes food. The impala eats the grass. The lion eats the impala.',
      ],
      [
        't',
        'But each time energy moves up, about 90% is lost as heat and movement. Only around 10% gets passed on.',
      ],
      ['y', 'So that’s why there are so few lions?'],
      [
        't',
        'EXACTLY. And the arrows in a food chain point to the eater: grass → impala → lion. They show where the energy goes, not who eats whom.',
      ],
    ],
    diagram: {
      kind: 'bars',
      title: 'Energy at each level (kJ)',
      bars: [
        { label: 'grass', value: 10000 },
        { label: 'impala', value: 1000 },
        { label: 'lion', value: 100 },
      ],
    },
    mistake:
      'Drawing food-chain arrows from the eater to the eaten — arrows show where the energy goes (grass → impala).',
    checks: [
      {
        question: 'What do we call an organism that makes its own food?',
        answer: 'A producer (autotroph)',
      },
      {
        question: 'A caterpillar has 500 kJ. About how much reaches the bird that eats it?',
        answer: 'About 50 kJ',
      },
    ],
  },
  'biodiversity and classification': {
    idea: 'Living things are grouped from big to small: Kingdom, Phylum, Class, Order, Family, Genus, Species. The scientific name is Genus + species.',
    example: {
      question: 'Write the scientific name for humans correctly.',
      steps: [
        'Genus first, with a capital: Homo',
        'species next, small letter: sapiens',
        'Underline it when handwritten, italics when typed',
      ],
      answer: 'Homo sapiens',
    },
    pattern: {
      rows: [
        ['Kingdom', 'Animalia'],
        ['Phylum', 'Chordata'],
        ['Class', 'Mammalia'],
        ['Species', 'sapiens'],
      ],
      rule: 'King Philip Came Over For Good Soup — biggest group to smallest.',
    },
    realWorld: {
      question: 'Why do scientists use Latin names instead of “lion” or “tau” in Setswana?',
      answer: 'One name that everyone in the world understands, whatever language they speak',
    },
    gossip: [
      [
        't',
        'Scientists sort every living thing like a giant family tree, and the levels have a whole hierarchy 👑',
      ],
      ['y', 'Which levels?'],
      [
        't',
        'Kingdom, Phylum, Class, Order, Family, Genus, Species. Remember: King Philip Came Over For Good Soup 🍲',
      ],
      ['t', 'The scientific name is just the last two: Genus and species. Humans? Homo sapiens.'],
      ['y', 'Seems easy'],
      [
        't',
        'It is — but the genus gets the capital letter and the species does NOT. Write “homo Sapiens” and the marker will cry.',
      ],
    ],
    diagram: {
      kind: 'flow',
      title: 'Big group to small group',
      steps: ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'],
    },
    mistake: 'Writing “homo Sapiens” — the genus has the capital, the species does not.',
    checks: [
      { question: 'What is the smallest level of classification?', answer: 'Species' },
      {
        question: 'Name the five kingdoms.',
        answer: 'Bacteria (Monera), Protista, Fungi, Plantae, Animalia',
      },
    ],
  },
  'history of life on earth': {
    idea: 'Fossils show that life changed over millions of years. In undisturbed rock, deeper layers are older.',
    example: {
      question: 'Fossil A is in a deep rock layer and fossil B near the surface. Which is older?',
      steps: [
        'Rock layers are laid down one on top of the other',
        'The deeper layers formed first',
      ],
      answer: 'Fossil A is older',
    },
    pattern: {
      rows: [
        ['bacteria', 'about 3.5 billion years ago'],
        ['fish', 'about 500 million years ago'],
        ['dinosaurs', 'about 230 million years ago'],
        ['modern humans', 'about 300 000 years ago'],
      ],
      rule: 'Simple life came first; complex life came much later.',
    },
    realWorld: {
      question: 'Why is the Cradle of Humankind near Johannesburg a World Heritage Site?',
      answer: 'It holds some of the world’s oldest hominin fossils, like Mrs Ples and Little Foot',
    },
    gossip: [
      ['t', 'Earth has receipts going back BILLIONS of years, and they’re called fossils 🦴'],
      ['y', 'Receipts for what?'],
      [
        't',
        'For who lived when. Bacteria first, about 3.5 billion years ago. Fish, then dinosaurs, and humans only about 300 000 years ago. We’re basically the new kids.',
      ],
      [
        't',
        'And rock layers stack like a pile of laundry — the stuff at the bottom has been there longest. Deeper = older.',
      ],
      ['y', 'So fossils are the actual bones?'],
      [
        't',
        'Plot twist: usually not! Minerals slowly replace the bone, so it turns into rock. And some of the oldest human-family fossils are right here near Joburg 🇿🇦',
      ],
    ],
    diagram: {
      kind: 'flow',
      title: 'A very short history of life',
      steps: [
        'Bacteria (~3.5 billion years ago)',
        'Fish (~500 million years ago)',
        'Dinosaurs (~230 million years ago)',
        'Modern humans (~300 000 years ago)',
      ],
    },
    mistake:
      'Saying fossils are the original bones — most are minerals that replaced the original tissue.',
    checks: [
      {
        question: 'Name one way a fossil forms.',
        answer: 'The organism is buried in sediment and minerals replace its tissues',
      },
      { question: 'What is the study of fossils called?', answer: 'Palaeontology' },
    ],
  },
};
