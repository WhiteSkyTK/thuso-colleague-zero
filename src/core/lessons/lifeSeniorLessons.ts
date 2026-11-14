import type { TopicLesson } from './TopicLesson';

/** CAPS Life Sciences, Grade 11. */
const GRADE_11: Readonly<Record<string, TopicLesson>> = {
  'micro-organisms': {
    idea: 'Micro-organisms are viruses, bacteria, protists and fungi. Some cause disease (HIV, TB, malaria); many are useful (yoghurt, bread, decomposers).',
    example: {
      question: 'Name the type of organism behind TB, malaria and HIV.',
      steps: [
        'TB → a bacterium',
        'Malaria → a protist (Plasmodium), spread by mosquitoes',
        'HIV → a virus that attacks the immune system',
      ],
      answer: 'Bacterium, protist, virus',
    },
    pattern: {
      rows: [
        ['bacteria', 'antibiotics work'],
        ['viruses', 'antibiotics do not work'],
        ['fungi', 'antifungals work'],
        ['protists (malaria)', 'antimalarials work'],
      ],
      rule: 'The right medicine depends on the type of microbe.',
    },
    realWorld: {
      question: 'Why must you finish the full course of TB treatment, even when you feel better?',
      answer:
        'Stopping early lets surviving bacteria come back — and can make them drug-resistant.',
    },
    gossip: [
      [
        't',
        'Micro-organisms have the worst reputation, but most of them are actually on our side 🦠',
      ],
      ['y', 'Really?'],
      [
        't',
        'Yeast makes your bread rise, bacteria make yoghurt, and decomposers recycle everything that dies.',
      ],
      [
        't',
        'The villains: HIV is a virus, TB is a bacterium, malaria is a protist carried by mosquitoes.',
      ],
      ['y', 'So antibiotics fix all of them?'],
      ['t', 'NO 🙅 Antibiotics only work on bacteria. Taking them for flu (a virus) does nothing.'],
    ],
    mistake: 'Taking antibiotics for flu — flu is a virus, and antibiotics don’t work on viruses.',
    checks: [
      { question: 'Which micro-organism makes bread rise?', answer: 'Yeast (a fungus)' },
      {
        question: 'How is malaria spread?',
        answer: 'By the bite of an infected Anopheles mosquito',
      },
    ],
  },
  'plant diversity': {
    idea: 'Plant groups: bryophytes (mosses, no vascular tissue), pteridophytes (ferns, spores), gymnosperms (seeds in cones) and angiosperms (flowers, seeds in fruit).',
    example: {
      question: 'Classify a moss, a fern, a pine tree and a mango tree.',
      steps: [
        'Moss: no vascular tissue → bryophyte',
        'Fern: vascular tissue, spores → pteridophyte',
        'Pine: seeds in cones → gymnosperm',
        'Mango: flowers and fruit → angiosperm',
      ],
      answer: 'Bryophyte, pteridophyte, gymnosperm, angiosperm',
    },
    pattern: {
      rows: [
        ['moss', 'no xylem, spores'],
        ['fern', 'xylem, spores'],
        ['pine', 'seeds in cones'],
        ['mango', 'seeds in fruit'],
      ],
      rule: 'Each group adds something new: vessels, then seeds, then flowers and fruit.',
    },
    realWorld: {
      question: 'Why do flowering plants dominate gardens and farms?',
      answer:
        'Flowers attract pollinators and fruit spreads seeds, so they reproduce very successfully.',
    },
    gossip: [
      ['t', 'Plants had a glow-up over millions of years and each group added a new feature ✨'],
      ['y', 'Like what?'],
      [
        't',
        'Mosses: no pipes at all, they stay small and damp. Ferns: got xylem, but still spores.',
      ],
      [
        't',
        'Pines: seeds — but naked, in cones. Then flowering plants: flowers AND fruit. Main characters.',
      ],
      ['y', 'So ferns have seeds?'],
      ['t', 'Nope, spores! That one catches people every year.'],
    ],
    diagram: {
      kind: 'flow',
      title: 'From simple to complex plants',
      steps: [
        'Bryophytes: no vessels',
        'Pteridophytes: vessels, spores',
        'Gymnosperms: naked seeds',
        'Angiosperms: flowers and fruit',
      ],
    },
    mistake: 'Saying ferns make seeds — ferns reproduce by spores.',
    checks: [
      { question: 'Which group has seeds in cones?', answer: 'Gymnosperms' },
      { question: 'Which group has no vascular tissue?', answer: 'Bryophytes' },
    ],
  },
  'animal diversity': {
    idea: 'Animals are grouped by body plan: symmetry (radial or bilateral), germ layers (2 or 3), a body cavity (coelom) and a gut with one or two openings.',
    example: {
      question: 'Compare a jellyfish and an earthworm.',
      steps: [
        'Jellyfish: radial symmetry, 2 germ layers, a gut with one opening',
        'Earthworm: bilateral symmetry, 3 germ layers, a coelom, a gut with mouth and anus',
      ],
      answer: 'A simple body plan versus a more complex one',
    },
    pattern: {
      rows: [
        ['jellyfish (Cnidaria)', 'radial, 2 layers'],
        ['flatworm (Platyhelminthes)', 'bilateral, no coelom'],
        ['earthworm (Annelida)', 'bilateral, coelom'],
        ['fish, humans (Chordata)', 'bilateral, coelom, notochord'],
      ],
      rule: 'Body plans get more complex down the list.',
    },
    realWorld: {
      question: 'How can a tapeworm (a flatworm) live inside a human gut?',
      answer: 'Its flat body absorbs food through its surface — it doesn’t need a gut of its own.',
    },
    gossip: [
      ['t', 'Animals are judged on their body plan and honestly some are very basic 😂'],
      ['y', 'Like who?'],
      [
        't',
        'Jellyfish: round like a pizza (radial), two layers, one opening for food in AND waste out.',
      ],
      [
        't',
        'Earthworm: a left and right side (bilateral), three layers, a coelom, and a proper tube from mouth to anus.',
      ],
      ['y', 'That one-opening thing is wild'],
      ['t', 'Right?! Remember: pizza = radial, you = bilateral.'],
    ],
    mistake: 'Mixing up symmetry: radial is like a pizza; bilateral has a left and a right side.',
    checks: [
      { question: 'How many germ layers does a jellyfish have?', answer: 'Two (diploblastic)' },
      {
        question: 'What is a coelom?',
        answer: 'A fluid-filled body cavity between the gut and the body wall',
      },
    ],
  },
  'energy transformations': {
    idea: 'Photosynthesis stores the sun’s energy in glucose (in chloroplasts, in light). Respiration releases it as ATP (in mitochondria, all the time).',
    example: {
      question: 'Where does each process happen in a leaf cell, and when?',
      steps: [
        'Photosynthesis: in the chloroplasts, only in light',
        'Aerobic respiration: in the mitochondria, day and night',
      ],
      answer: 'Chloroplasts (in light) and mitochondria (always)',
    },
    pattern: {
      rows: [
        ['more light', 'photosynthesis faster'],
        ['more CO₂', 'photosynthesis faster'],
        ['too hot', 'enzymes denature — slower'],
        ['no light', 'no photosynthesis'],
      ],
      rule: 'Light, carbon dioxide and temperature limit the rate.',
    },
    realWorld: {
      question: 'Why do your muscles burn when you sprint hard?',
      answer: 'Without enough oxygen, cells respire anaerobically and lactic acid builds up.',
    },
    gossip: [
      [
        't',
        'Photosynthesis and respiration are basically opposites and they’re in a relationship 💞',
      ],
      ['y', 'Explain'],
      [
        't',
        'Photosynthesis takes CO₂ and water and, with light, makes glucose and oxygen. Respiration uses glucose and oxygen to release energy, giving back CO₂ and water.',
      ],
      ['t', 'And plants do BOTH. They respire all the time — day and night.'],
      ['y', 'Wait, plants respire?'],
      ['t', 'Yes! Saying plants only photosynthesise is the classic mistake.'],
    ],
    mistake: 'Saying plants only photosynthesise — plants respire all the time.',
    checks: [
      { question: 'Which gas does photosynthesis release?', answer: 'Oxygen' },
      {
        question: 'What does anaerobic respiration in muscles produce?',
        answer: 'Lactic acid (and a little energy)',
      },
    ],
  },
  'animal nutrition': {
    idea: 'Food goes through ingestion, digestion, absorption (in the villi of the small intestine), assimilation and egestion. Enzymes do the chemical breakdown.',
    example: {
      question: 'Trace the starch in a slice of bread through the gut.',
      steps: [
        'Mouth: salivary amylase starts on the starch',
        'Stomach: acid stops the amylase',
        'Small intestine: enzymes finish it into glucose',
        'Villi absorb the glucose into the blood',
      ],
      answer: 'Mouth → small intestine → absorbed in the villi',
    },
    pattern: {
      rows: [
        ['starch', 'amylase'],
        ['protein', 'protease (e.g. pepsin)'],
        ['fats', 'lipase'],
        ['maltose', 'maltase'],
      ],
      rule: 'Each enzyme breaks down one kind of food.',
    },
    realWorld: {
      question: 'Why can milk upset people who are lactose intolerant?',
      answer: 'They lack lactase, so lactose isn’t digested and gut bacteria ferment it.',
    },
    gossip: [
      ['t', 'Your sandwich goes on a whole road trip through your body 🥪'],
      ['y', 'Where does it start?'],
      [
        't',
        'In your mouth — saliva already starts breaking the starch. Then the stomach churns it with acid.',
      ],
      [
        't',
        'But the real action is the small intestine: enzymes finish the job and the villi absorb everything.',
      ],
      ['y', 'So not mostly the stomach?'],
      ['t', 'Nope! Most digestion and absorption happens in the small intestine. Exam favourite.'],
    ],
    diagram: {
      kind: 'flow',
      title: 'Food’s journey',
      steps: ['Ingestion', 'Digestion', 'Absorption (villi)', 'Assimilation', 'Egestion'],
    },
    mistake:
      'Saying digestion happens mainly in the stomach — most of it is in the small intestine.',
    checks: [
      { question: 'Where are nutrients absorbed?', answer: 'In the villi of the small intestine' },
      { question: 'Which enzyme digests fats?', answer: 'Lipase' },
    ],
  },
  'gaseous exchange': {
    idea: 'Oxygen and carbon dioxide diffuse across the alveoli. Alveoli are many, thin, moist and surrounded by capillaries.',
    example: {
      question: 'Why are alveoli so good at gas exchange?',
      steps: [
        'A huge surface area — millions of alveoli',
        'Walls one cell thick — a short diffusion path',
        'Moist, with a rich blood supply that keeps the gradient',
      ],
      answer: 'Large, thin, moist and well supplied with blood',
    },
    pattern: {
      rows: [
        ['breathing in', 'diaphragm contracts and flattens'],
        ['breathing in', 'ribs move up and out'],
        ['breathing out', 'diaphragm relaxes and domes'],
        ['breathing out', 'ribs move down and in'],
      ],
      rule: 'Breathing in makes the chest bigger, so air rushes in.',
    },
    realWorld: {
      question: 'Why do long-term smokers get short of breath?',
      answer: 'Smoke damages the alveoli, so there is less surface for gas exchange.',
    },
    gossip: [
      ['t', 'Your lungs have millions of tiny air sacs and they’re the MVPs of breathing 🫁'],
      ['y', 'Alveoli?'],
      [
        't',
        'Yes! Super thin walls, always moist, wrapped in capillaries. Oxygen slips into the blood, CO₂ slips out — diffusion.',
      ],
      [
        't',
        'And breathing in? The diaphragm contracts and flattens, ribs go up and out, the chest gets bigger, air rushes in.',
      ],
      ['y', 'And smoking?'],
      ['t', 'It destroys alveoli. Less surface, less oxygen, out of breath on the stairs 😮‍💨'],
    ],
    mistake:
      'Saying we breathe in pure oxygen — air is mostly nitrogen; we use some of its oxygen.',
    checks: [
      { question: 'By which process do gases cross the alveoli?', answer: 'Diffusion' },
      {
        question: 'What does the diaphragm do when you breathe in?',
        answer: 'It contracts and flattens',
      },
    ],
  },
  excretion: {
    idea: 'Excretion removes waste made by the body. Kidney nephrons filter blood (glomerulus), reabsorb what is useful, and pass the rest on as urine.',
    example: {
      question: 'Follow a molecule of urea from the blood to the bladder.',
      steps: [
        'Filtered from the blood in the glomerulus into Bowman’s capsule',
        'Not reabsorbed — it stays in the tubule',
        'Collecting duct → ureter → bladder',
      ],
      answer: 'Glomerulus → tubule → collecting duct → ureter → bladder',
    },
    pattern: {
      rows: [
        ['lungs', 'carbon dioxide'],
        ['kidneys', 'urea, water and salts'],
        ['skin', 'sweat'],
        ['liver', 'bile pigments'],
      ],
      rule: 'Several organs excrete different wastes.',
    },
    realWorld: {
      question: 'Why is your urine darker on a hot day?',
      answer: 'You lose water as sweat, so ADH makes the kidneys reabsorb more water.',
    },
    gossip: [
      ['t', 'Your kidneys filter about all your blood many times a day and nobody thanks them 🫘'],
      ['y', 'What do they actually do?'],
      [
        't',
        'Blood gets squeezed through the glomerulus. Useful stuff — glucose, most water — is taken back. Urea is left behind as urine.',
      ],
      [
        't',
        'Hot day? ADH tells the kidneys to keep more water. That’s why your urine goes darker.',
      ],
      ['y', 'Is poo excretion then?'],
      ['t', 'No! That’s egestion — undigested food your cells never made. Classic trap.'],
    ],
    diagram: {
      kind: 'flow',
      title: 'Making urine',
      steps: [
        'Blood into the glomerulus',
        'Filtrate in Bowman’s capsule',
        'Reabsorption in the tubules',
        'Urine in the collecting duct',
        'Ureter → bladder',
      ],
    },
    mistake: 'Calling egestion (faeces) excretion.',
    checks: [
      {
        question: 'Where is blood filtered in a nephron?',
        answer: 'In the glomerulus, into Bowman’s capsule',
      },
      {
        question: 'Which hormone makes the kidneys reabsorb more water?',
        answer: 'ADH (antidiuretic hormone)',
      },
    ],
  },
  'population ecology': {
    idea: 'Populations change with births, deaths, immigration and emigration. Mark–recapture estimates size: N = (marked first × caught second) ÷ marked recaptured.',
    example: {
      question:
        '25 snails are marked and released. Later 30 are caught and 5 are marked. Estimate the population.',
      steps: ['N = (M × C) ÷ R', '= (25 × 30) ÷ 5', '= 750 ÷ 5'],
      answer: '150 snails',
    },
    pattern: {
      rows: [
        ['lag phase', 'slow growth'],
        ['exponential phase', 'rapid growth'],
        ['stationary phase', 'births = deaths'],
        ['carrying capacity', 'the most the area can support'],
      ],
      rule: 'A population curve is S-shaped and levels off at the carrying capacity.',
    },
    realWorld: {
      question: 'Why do game reserves sometimes move elephants elsewhere?',
      answer: 'Too many elephants exceed the carrying capacity and damage the habitat.',
    },
    gossip: [
      [
        't',
        'How do scientists count snails in a whole forest? They don’t — they do a clever trick 🐌',
      ],
      ['y', 'What trick?'],
      [
        't',
        'Mark 25 and let them go. Come back and catch 30. If 5 are marked, then 25 is about a sixth of everyone… so roughly 150.',
      ],
      ['t', 'N = M × C ÷ R. That’s mark–recapture.'],
      ['y', 'Any catch?'],
      [
        't',
        'The marked ones must mix back in first, and marks mustn’t rub off. Otherwise the estimate lies.',
      ],
    ],
    mistake: 'Recapturing before the marked animals have mixed back into the population.',
    checks: [
      { question: 'M = 40, C = 50, R = 10. Estimate N.', answer: '200' },
      { question: 'Name two things that increase a population.', answer: 'Births and immigration' },
    ],
  },
};

/** CAPS Life Sciences, Grade 12. */
const GRADE_12: Readonly<Record<string, TopicLesson>> = {
  'dna and rna': {
    idea: 'DNA is a double helix with base pairs A–T and G–C, kept in the nucleus. RNA is single-stranded, uses U instead of T, and carries the code to the ribosomes to make proteins.',
    example: {
      question: 'Give the complementary DNA strand and the mRNA for the template ATG CCA.',
      steps: ['DNA pairs A–T and G–C → TAC GGT', 'mRNA pairs A with U instead → UAC GGU'],
      answer: 'DNA: TAC GGT; mRNA: UAC GGU',
    },
    pattern: {
      rows: [
        ['A', 'T (in DNA)'],
        ['G', 'C'],
        ['A', 'U (in RNA)'],
        ['C', 'G'],
      ],
      rule: 'Bases always pair the same way; RNA uses U instead of T.',
    },
    realWorld: {
      question: 'How can a DNA test show who a child’s parent is?',
      answer: 'A child shares half their DNA with each parent, so matching patterns show the link.',
    },
    gossip: [
      ['t', 'DNA is the most famous couple in biology: A always with T, G always with C 💍'],
      ['y', 'And RNA?'],
      ['t', 'RNA is the messenger. It copies the code, but T gets replaced by U — A pairs with U.'],
      [
        't',
        'Transcription makes mRNA in the nucleus; translation reads it on the ribosome to build a protein.',
      ],
      ['y', 'So no T in RNA?'],
      ['t', 'Zero T in RNA. Put one in and the marker will know 😅'],
    ],
    diagram: {
      kind: 'flow',
      title: 'From gene to protein',
      steps: [
        'DNA in the nucleus',
        'Transcription → mRNA',
        'mRNA to the ribosome',
        'Translation → protein',
      ],
    },
    mistake: 'Putting T in RNA — RNA uses uracil (U).',
    checks: [
      { question: 'Name the sugar in DNA.', answer: 'Deoxyribose' },
      { question: 'Where are proteins made?', answer: 'On the ribosomes' },
    ],
  },
  meiosis: {
    idea: 'Meiosis makes four genetically different gametes with half the chromosomes (23 in humans). Crossing over and random arrangement create variation.',
    example: {
      question:
        'A cell with 46 chromosomes goes through meiosis. How many cells, with how many chromosomes?',
      steps: [
        'Meiosis I separates the homologous pairs: 2 cells with 23',
        'Meiosis II separates the chromatids: 4 cells with 23',
      ],
      answer: '4 cells with 23 chromosomes each',
    },
    pattern: {
      rows: [
        ['mitosis', '2 identical cells'],
        ['mitosis', 'same chromosome number'],
        ['meiosis', '4 different cells'],
        ['meiosis', 'half the chromosome number'],
      ],
      rule: 'Mitosis copies; meiosis halves and mixes.',
    },
    realWorld: {
      question: 'Why aren’t brothers and sisters identical (unless they’re identical twins)?',
      answer: 'Each egg and sperm made by meiosis carries a different mix of chromosomes.',
    },
    gossip: [
      ['t', 'Meiosis is the reason you look like your family but not EXACTLY like anyone 👀'],
      ['y', 'How?'],
      [
        't',
        'In prophase I, partner chromosomes swap pieces — crossing over. Then they line up randomly.',
      ],
      [
        't',
        'Two divisions later: four cells, 23 chromosomes each, all different. Halved and remixed.',
      ],
      ['y', 'And if it goes wrong?'],
      [
        't',
        'Non-disjunction — chromosomes don’t separate. That’s how Down syndrome (trisomy 21) can happen.',
      ],
    ],
    mistake: 'Saying crossing over happens in meiosis II — it happens in prophase I.',
    checks: [
      { question: 'In which phase does crossing over happen?', answer: 'Prophase I' },
      {
        question: 'What is non-disjunction?',
        answer: 'Chromosomes fail to separate, e.g. causing trisomy 21 (Down syndrome)',
      },
    ],
  },
  'reproduction in vertebrates': {
    idea: 'Vertebrates differ in fertilisation (external or internal), where the young develop (eggs outside or inside) and how much parental care they give.',
    example: {
      question: 'Compare reproduction in a frog and a human.',
      steps: [
        'Frog: external fertilisation in water, eggs develop outside, little care',
        'Human: internal fertilisation, the embryo develops in the uterus, lots of care',
      ],
      answer: 'External and ovuliparous versus internal and viviparous',
    },
    pattern: {
      rows: [
        ['ovuliparous', 'eggs fertilised outside (most fish, frogs)'],
        ['oviparous', 'eggs laid after internal fertilisation (birds)'],
        ['ovoviviparous', 'eggs hatch inside the mother (some sharks)'],
        ['viviparous', 'young grow inside, fed by a placenta (humans)'],
      ],
      rule: 'The more the young develop inside the mother, the fewer the offspring — but the better they survive.',
    },
    realWorld: {
      question: 'Why does a fish lay thousands of eggs, but a cow has one calf?',
      answer:
        'Few fish eggs survive in open water; the calf is protected inside the mother and cared for.',
    },
    gossip: [
      ['t', 'Fish and humans have VERY different parenting styles 🐟👶'],
      ['y', 'Go on'],
      ['t', 'Fish: thousands of eggs, fertilised outside, then… good luck. Most get eaten.'],
      [
        't',
        'Humans: internal fertilisation, one baby growing safely in the uterus, fed through the placenta, years of care.',
      ],
      ['y', 'Placenta or amnion?'],
      [
        't',
        'Placenta swaps food and waste; the amnion is the fluid sac that cushions. Don’t mix them up!',
      ],
    ],
    mistake:
      'Mixing up the amnion (protective fluid sac) and the placenta (exchange of food, oxygen and waste).',
    checks: [
      {
        question: 'Where does fertilisation happen in humans?',
        answer: 'In the fallopian tube (oviduct)',
      },
      {
        question: 'What does the placenta do?',
        answer: 'Exchanges food, oxygen and waste between mother and fetus',
      },
    ],
  },
  'genetics and inheritance': {
    idea: 'Genes come in alleles. A dominant allele (T) hides a recessive one (t). A Punnett square gives the chances: Tt × Tt → 3 tall : 1 short.',
    example: {
      question: 'Two heterozygous tall plants (Tt × Tt) produce 400 seeds. How many will be short?',
      steps: [
        'Each parent gives T or t',
        'Punnett square: TT, Tt, Tt, tt',
        'Short (tt) is 1 in 4 → 400 ÷ 4',
      ],
      answer: '100 short plants',
    },
    pattern: {
      rows: [
        ['TT × tt', 'all tall (Tt)'],
        ['Tt × tt', '1 tall : 1 short'],
        ['Tt × Tt', '3 tall : 1 short'],
        ['tt × tt', 'all short'],
      ],
      rule: 'Count the recessive pairs in the Punnett square.',
    },
    realWorld: {
      question: 'Two brown-eyed parents have a blue-eyed child. How?',
      answer:
        'Both carry a hidden recessive allele (Bb × Bb): a 1 in 4 chance of bb. (Real eye colour involves several genes.)',
    },
    gossip: [
      [
        't',
        'Okay so two brown-eyed parents had a blue-eyed baby and the family group chat went CRAZY 😂',
      ],
      ['y', 'Is that even possible?'],
      ['t', 'Totally! Both parents were Bb — brown wins, but each secretly carried blue.'],
      [
        't',
        'Punnett square: BB, Bb, Bb, bb. One in four chance of bb = blue eyes. Science, not scandal.',
      ],
      ['y', 'Genotype vs phenotype?'],
      ['t', 'Genotype = the letters (Bb). Phenotype = what you see (brown eyes).'],
    ],
    mistake: 'Mixing up genotype (the alleles, e.g. Tt) and phenotype (what you see, e.g. tall).',
    checks: [
      { question: 'Genotype of a heterozygous tall plant?', answer: 'Tt' },
      {
        question: 'Which blood group alleles are co-dominant?',
        answer: 'Iᴬ and Iᴮ (blood group AB)',
      },
    ],
  },
  'human responses to the environment': {
    idea: 'The nervous system responds fast: receptor → sensory neuron → CNS → motor neuron → effector. Reflex arcs go through the spinal cord for speed.',
    example: {
      question: 'Trace the reflex when you touch a hot pot.',
      steps: [
        'A receptor in the skin detects the heat',
        'A sensory neuron carries the impulse to the spinal cord',
        'An interneuron passes it to a motor neuron',
        'The muscle contracts and the hand pulls away',
      ],
      answer: 'Receptor → sensory → interneuron → motor → effector',
    },
    pattern: {
      rows: [
        ['bright light', 'pupil constricts'],
        ['dim light', 'pupil dilates'],
        ['near object', 'lens becomes rounder'],
        ['far object', 'lens becomes flatter'],
      ],
      rule: 'The eye adjusts itself automatically.',
    },
    realWorld: {
      question: 'Why do you pull away from a hot pot before you feel the pain?',
      answer: 'The reflex goes through the spinal cord, faster than the message to the brain.',
    },
    gossip: [
      ['t', 'Your hand moves off a hot pot BEFORE your brain even knows it hurts 🔥'],
      ['y', 'That’s impossible'],
      [
        't',
        'It’s a reflex arc! The message goes skin → spinal cord → straight back to the muscle. The brain hears about it later.',
      ],
      [
        't',
        'Your eyes do automatic stuff too: bright light, the pupil shrinks; near objects, the lens gets rounder.',
      ],
      ['y', 'So the brain isn’t in charge?'],
      ['t', 'Not for simple reflexes. The spinal cord handles it — that’s the exam answer.'],
    ],
    diagram: {
      kind: 'flow',
      title: 'A reflex arc',
      steps: [
        'Receptor',
        'Sensory neuron',
        'Spinal cord (interneuron)',
        'Motor neuron',
        'Effector (muscle)',
      ],
    },
    mistake: 'Saying the brain controls simple reflexes — they go through the spinal cord.',
    checks: [
      {
        question: 'Which part of the eye controls how much light enters?',
        answer: 'The iris (by changing the pupil size)',
      },
      { question: 'Which part of the ear controls balance?', answer: 'The semicircular canals' },
    ],
  },
  'human endocrine system': {
    idea: 'Hormones are chemical messengers in the blood. Negative feedback keeps things balanced: insulin lowers blood glucose; glucagon raises it.',
    example: {
      question: 'Blood glucose rises after lunch. What happens?',
      steps: [
        'The pancreas detects the high glucose',
        'It releases insulin',
        'The liver stores glucose as glycogen',
        'Blood glucose drops back to normal',
      ],
      answer: 'Insulin brings it down — negative feedback',
    },
    pattern: {
      rows: [
        ['insulin', 'pancreas — lowers blood glucose'],
        ['adrenalin', 'adrenal glands — fight or flight'],
        ['thyroxin', 'thyroid — metabolism'],
        ['ADH', 'pituitary — water balance'],
      ],
      rule: 'Each gland makes hormones for its own job.',
    },
    realWorld: {
      question: 'What goes wrong in type 1 diabetes?',
      answer: 'The pancreas makes little or no insulin, so blood glucose stays too high.',
    },
    gossip: [
      [
        't',
        'Hormones are your body’s group chat — slower than nerves, but EVERYONE gets the message 📲',
      ],
      ['y', 'Example?'],
      [
        't',
        'After lunch your blood sugar spikes. The pancreas sends insulin and the liver stores the extra as glycogen.',
      ],
      [
        't',
        'Sugar too low? Glucagon tells the liver to release it again. Back and forth — negative feedback.',
      ],
      ['y', 'Glucagon and glycogen sound the same'],
      ['t', 'I KNOW 😭 Glucagon is the hormone; glycogen is the stored sugar.'],
    ],
    mistake: 'Mixing up glucagon (a hormone that raises glucose) and glycogen (stored glucose).',
    checks: [
      { question: 'Which hormone raises blood glucose?', answer: 'Glucagon' },
      { question: 'Which gland is called the master gland?', answer: 'The pituitary gland' },
    ],
  },
  evolution: {
    idea: 'Natural selection: there is variation, more young than can survive, competition — and the best-suited survive and pass on their genes.',
    example: {
      question: 'Explain how bacteria become resistant to antibiotics.',
      steps: [
        'Variation: a few bacteria carry a resistance gene',
        'The antibiotic kills the others',
        'The resistant ones survive and reproduce',
        'The next generation is mostly resistant',
      ],
      answer: 'Natural selection',
    },
    pattern: {
      rows: [
        ['variation', 'individuals differ'],
        ['over-production', 'more young than can survive'],
        ['selection', 'the best-suited survive'],
        ['inheritance', 'they pass on their genes'],
      ],
      rule: 'Variation + selection + inheritance = evolution.',
    },
    realWorld: {
      question: 'Why should doctors not over-prescribe antibiotics?',
      answer: 'It selects for resistant bacteria, making infections harder to treat.',
    },
    gossip: [
      ['t', 'Evolution is happening right now, in hospitals, and it’s kind of terrifying 🧫'],
      ['y', 'What?!'],
      [
        't',
        'A few bacteria randomly have a resistance gene. The antibiotic kills the rest. Guess who’s left to multiply?',
      ],
      [
        't',
        'That’s natural selection: variation, survival of the best-suited, passing it on. Darwin would be proud.',
      ],
      ['y', 'So the bacteria decided to change?'],
      ['t', 'No! Individuals don’t evolve. Populations change over generations.'],
    ],
    mistake:
      'Saying individuals evolve during their lifetime — populations evolve over generations.',
    checks: [
      {
        question: 'Who proposed natural selection?',
        answer: 'Charles Darwin (with Alfred Russel Wallace)',
      },
      {
        question: 'Name one kind of evidence for evolution.',
        answer: 'Fossils, comparative anatomy or DNA',
      },
    ],
  },
  'human impact on the environment': {
    idea: 'People change the environment through pollution, deforestation, overuse of water, alien invasive plants and climate change — and can limit it with conservation and sustainable use.',
    example: {
      question: 'How does burning coal for electricity affect the climate?',
      steps: [
        'Burning coal releases carbon dioxide',
        'CO₂ is a greenhouse gas that traps heat',
        'More trapped heat → global warming and climate change',
      ],
      answer: 'More greenhouse gas → warming',
    },
    pattern: {
      rows: [
        ['alien plants', 'use lots of water, push out indigenous plants'],
        ['overfishing', 'fish populations collapse'],
        ['deforestation', 'erosion, less CO₂ absorbed'],
        ['fertiliser run-off', 'algae bloom, fish die'],
      ],
      rule: 'Every human action has knock-on effects in the ecosystem.',
    },
    realWorld: {
      question: 'Why does South Africa clear alien trees like wattle near rivers?',
      answer:
        'They use a lot of water and push out indigenous plants (the Working for Water programme).',
    },
    gossip: [
      ['t', 'Some trees in South Africa are basically water thieves 🌳💧'],
      ['y', 'Trees can be thieves?'],
      [
        't',
        'Alien invasives like wattle drink way more water than indigenous plants and crowd them out. That’s why people get paid to clear them.',
      ],
      ['t', 'And burning coal? Releases CO₂, which traps heat — the enhanced greenhouse effect.'],
      ['y', 'Isn’t the greenhouse effect normal?'],
      [
        't',
        'The natural one keeps Earth warm. The ENHANCED one is the extra warming from us. Know the difference.',
      ],
    ],
    mistake:
      'Mixing up the natural greenhouse effect and the enhanced greenhouse effect caused by people.',
    checks: [
      { question: 'Name one greenhouse gas.', answer: 'Carbon dioxide (or methane)' },
      {
        question: 'What is eutrophication?',
        answer: 'Extra nutrients make algae bloom and use up the oxygen in the water',
      },
    ],
  },
};

export const LIFE_SENIOR_LESSONS: Readonly<Record<string, TopicLesson>> = {
  ...GRADE_11,
  ...GRADE_12,
};
