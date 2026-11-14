import type { TopicLesson } from './TopicLesson';

/** CAPS Life Orientation, Grades 10–12: one short lesson per topic. */
export const LO_LESSONS: Readonly<Record<string, TopicLesson>> = {
  'personal development': {
    idea: 'Know your strengths, values and goals — then turn wishes into SMART goals: Specific, Measurable, Achievable, Realistic and Time-bound.',
    example: {
      question: 'Turn “I want to do better in maths” into a SMART goal.',
      steps: [
        'Specific: which part? Algebra',
        'Measurable: from 45% to 60%',
        'Achievable and realistic: 30 minutes of practice, 4 days a week',
        'Time-bound: by the June exams',
      ],
      answer:
        'Raise my algebra mark from 45% to 60% by June, with 30 minutes of practice 4 days a week.',
    },
    pattern: {
      rows: [
        ['S', 'Specific'],
        ['M', 'Measurable'],
        ['A', 'Achievable'],
        ['R', 'Realistic'],
        ['T', 'Time-bound'],
      ],
      rule: 'SMART goals turn wishes into plans.',
    },
    realWorld: {
      question: 'You want R600 for headphones by December. Make it a SMART goal.',
      answer: 'Save R100 a month from pocket money for 6 months, starting in July.',
    },
    gossip: [
      [
        't',
        'Okay so everyone says “I’m going to do better this term”… and then nothing happens 😅',
      ],
      ['y', 'Guilty'],
      ['t', 'Because it’s a wish, not a goal! A SMART goal has a number and a date.'],
      [
        't',
        '“Maths from 45% to 60% by June, 30 minutes four days a week.” Now you can actually check if you’re winning.',
      ],
      ['y', 'That sounds way more doable'],
      ['t', 'That’s the tea ☕ No number, no date = no goal.'],
    ],
    diagram: {
      kind: 'flow',
      title: 'From wish to result',
      steps: [
        'Know yourself',
        'Set a SMART goal',
        'Make a plan',
        'Check your progress',
        'Celebrate or adjust',
      ],
    },
    mistake: 'Setting a goal with no number or date — you can never tell if you reached it.',
    checks: [
      { question: 'What does the M in SMART stand for?', answer: 'Measurable' },
      {
        question: 'Why does knowing your strengths help?',
        answer: 'You can build on them and choose subjects and careers that fit you',
      },
    ],
  },
  'careers and career choices': {
    idea: 'Your APS adds the points of your best six subjects (most universities leave out Life Orientation). Each course also has subject requirements, like Maths at 60%.',
    example: {
      question: 'Marks: 72, 65, 58, 81, 49 and 63. Work out the APS.',
      steps: ['Convert: 72→6, 65→5, 58→4, 81→7, 49→3, 63→5', 'Add: 6 + 5 + 4 + 7 + 3 + 5'],
      answer: 'APS = 30',
    },
    pattern: {
      rows: [
        ['80–100%', '7 points'],
        ['70–79%', '6 points'],
        ['60–69%', '5 points'],
        ['50–59%', '4 points'],
      ],
      rule: 'Each 10% band is one more point (40–49% = 3, 30–39% = 2, below 30% = 1).',
    },
    realWorld: {
      question:
        'A BCom needs APS 28 and Maths at 60%. You have APS 30 but 55% in Maths. Are you in?',
      answer:
        'Not yet — the subject requirement fails even though the APS is high. Push Maths to 60%.',
    },
    gossip: [
      ['t', 'So Lebo had APS 30 and was SO sure she was getting into BCom 🎓'],
      ['y', 'And?'],
      [
        't',
        'Rejected 😬 The course needed Maths at 60% and she had 55%. The APS wasn’t the problem — one subject was.',
      ],
      [
        't',
        'Moral of the story: check the APS AND the subject requirements. And most universities don’t count Life Orientation.',
      ],
      ['y', 'So 5% in maths decided everything?'],
      ['t', 'Exactly. That’s why Thuso shows you which mark opens which door.'],
    ],
    mistake: 'Counting Life Orientation in your APS — most universities leave it out.',
    checks: [
      { question: 'How many APS points is 74%?', answer: '6' },
      {
        question: 'Name one place to study after matric besides university.',
        answer: 'A TVET college, or a learnership or apprenticeship',
      },
    ],
  },
  'study skills': {
    idea: 'Short, spaced, active study beats long re-reading: test yourself, space your reviews out, and study in focused blocks with breaks (for example 25 minutes on, 5 off).',
    example: {
      question: 'Plan a one-hour study session for a test on Friday.',
      steps: [
        '25 min: make flash cards from your notes',
        '5 min: break',
        '25 min: test yourself with the cards and a past paper question',
        '5 min: write down what you got wrong',
      ],
      answer: 'Two focused blocks, with breaks, ending with your gaps',
    },
    pattern: {
      rows: [
        ['learn it', 'day 1'],
        ['first review', 'day 2'],
        ['second review', 'day 4'],
        ['third review', 'day 7'],
      ],
      rule: 'Each review comes a little later — that is spaced repetition.',
    },
    realWorld: {
      question: 'Your phone keeps buzzing while you study. What works?',
      answer: 'Put it in another room, or on aeroplane mode, for each 25-minute block.',
    },
    gossip: [
      ['t', 'Okay, unpopular opinion: highlighting your whole textbook is NOT studying 🖍️'],
      ['y', 'Excuse me?!'],
      [
        't',
        'It feels productive, but your brain is just watching. Testing yourself is what makes it stick.',
      ],
      [
        't',
        'Flash cards, past questions, cover-and-recall. And come back to it on day 2, day 4, day 7.',
      ],
      ['y', 'And my phone?'],
      ['t', 'In another room for 25 minutes. Then 5 minutes of scrolling as a reward 😌'],
    ],
    diagram: {
      kind: 'flow',
      title: 'One focused study block',
      steps: [
        'Plan what to cover',
        'Focus for 25 min',
        'Break for 5 min',
        'Test yourself',
        'Write down your gaps',
      ],
    },
    mistake: 'Re-reading and highlighting instead of testing yourself.',
    checks: [
      {
        question: 'What is active recall?',
        answer: 'Testing yourself from memory instead of re-reading',
      },
      {
        question: 'Why space your reviews out?',
        answer: 'You forget less when you revisit just before you would forget',
      },
    ],
  },
  'physical education': {
    idea: 'Fitness has components — cardio endurance, strength, flexibility and speed. Regular exercise also lifts your mood and focus. Always warm up and cool down.',
    example: {
      question: 'Plan a safe 30-minute session.',
      steps: [
        '5 min warm-up: brisk walk and arm circles',
        '20 min activity: skipping or soccer drills',
        '5 min cool-down: slow walk and stretches',
      ],
      answer: 'Warm-up, main activity, cool-down',
    },
    pattern: {
      rows: [
        ['skipping', 'cardio endurance'],
        ['push-ups', 'strength'],
        ['hamstring stretch', 'flexibility'],
        ['sprints', 'speed'],
      ],
      rule: 'Each exercise trains a different fitness component.',
    },
    realWorld: {
      question: 'Why do you focus better after a game of soccer at break?',
      answer: 'Exercise sends more blood to the brain and lifts your mood.',
    },
    gossip: [
      ['t', 'Plot twist: PE actually helps your marks 🏃'],
      ['y', 'How?!'],
      [
        't',
        'Moving gets more blood and oxygen to your brain, and it lowers stress. Focus goes up.',
      ],
      [
        't',
        'But please warm up first. Cold muscles + sudden sprint = injury and a whole season on the bench.',
      ],
      ['y', 'And after?'],
      [
        't',
        'Cool down slowly with stretches, so your heart rate comes down and you’re not stiff tomorrow.',
      ],
    ],
    diagram: {
      kind: 'flow',
      title: 'A safe session',
      steps: ['Warm-up (5 min)', 'Main activity (20 min)', 'Cool-down (5 min)'],
    },
    mistake: 'Skipping the warm-up — cold muscles get injured more easily.',
    checks: [
      {
        question: 'Name one component of fitness.',
        answer: 'Cardio endurance, strength, flexibility or speed',
      },
      {
        question: 'Why cool down after exercise?',
        answer: 'To bring your heart rate down slowly and reduce stiffness',
      },
    ],
  },
  citizenship: {
    idea: 'Citizens have rights AND responsibilities. In South Africa you can register to vote from 16 and vote from 18; your ward councillor is your first link to local government.',
    example: {
      question: 'The streetlight outside your house is broken. What can you do as a citizen?',
      steps: [
        'Report it to the municipality and keep the reference number',
        'Follow up with your ward councillor',
        'Raise it at a ward committee meeting if nothing happens',
      ],
      answer: 'Report it, follow up, use your ward councillor',
    },
    pattern: {
      rows: [
        ['right to education', 'attend and learn'],
        ['right to safety', 'respect others'],
        ['right to vote', 'vote and stay informed'],
        ['right to a clean environment', 'don’t litter'],
      ],
      rule: 'Every right comes with a responsibility.',
    },
    realWorld: {
      question: 'You turn 18 before the next election. What must you do to vote?',
      answer: 'Register with the IEC (you can register from 16) and take your ID on voting day.',
    },
    gossip: [
      [
        't',
        'Okay so being a citizen isn’t just about rights… there’s a responsibility attached to every single one 👀',
      ],
      ['y', 'Like what?'],
      [
        't',
        'Right to education? Responsibility to show up and learn. Right to a clean environment? Don’t litter. It’s a package deal.',
      ],
      [
        't',
        'And the streetlight that’s been broken for months? Report it, get a reference number, and follow up with your ward councillor.',
      ],
      ['y', 'When can I vote?'],
      ['t', 'Register from 16, vote from 18. Your voice, your vote 🗳️'],
    ],
    mistake: 'Thinking rights have no limits — they are balanced against other people’s rights.',
    checks: [
      { question: 'From what age can you vote in South Africa?', answer: '18' },
      {
        question: 'Who is your first contact for a problem in your ward?',
        answer: 'Your ward councillor',
      },
    ],
  },
  'social and environmental responsibility': {
    idea: 'Your choices affect your community and the planet: reduce, reuse, recycle, save water and power, and help where you can.',
    example: {
      question: 'Plan a class project to cut litter around the school.',
      steps: [
        'Find the problem: count litter in one spot for a week',
        'Plan: bins and a clean-up day',
        'Act: run the clean-up with the class',
        'Report: share before-and-after photos and numbers',
      ],
      answer: 'Find → plan → act → report',
    },
    pattern: {
      rows: [
        ['reduce', 'buy less packaging'],
        ['reuse', 'refill a water bottle'],
        ['recycle', 'sort cans and paper'],
        ['rethink', 'walk instead of a lift'],
      ],
      rule: 'Reduce comes first — it saves the most.',
    },
    realWorld: {
      question: 'Cape Town came close to “Day Zero” in 2018. How can one household save water?',
      answer: 'Shorter showers, fixing leaks, and reusing grey water for plants.',
    },
    gossip: [
      ['t', 'Remember when Cape Town almost ran out of water? “Day Zero” was REAL 😳'],
      ['y', 'What happened?'],
      [
        't',
        'People cut showers to a couple of minutes, fixed leaks and reused water. Together they pushed Day Zero away.',
      ],
      ['t', 'That’s the point: small habits × a whole city = huge change.'],
      ['y', 'So recycling matters?'],
      ['t', 'Yes, but REDUCE matters most. The best bottle is the one you never bought ♻️'],
    ],
    diagram: {
      kind: 'flow',
      title: 'A community project',
      steps: ['Find the problem', 'Plan', 'Act', 'Report back'],
    },
    mistake: 'Thinking one person can’t make a difference — habits add up across a community.',
    checks: [
      { question: 'Which of the Rs saves the most?', answer: 'Reduce' },
      {
        question: 'Name one way to save electricity at home.',
        answer: 'Switch off lights and appliances when not in use',
      },
    ],
  },
  'democracy and human rights': {
    idea: 'South Africa’s Constitution (1996) is the highest law. Its Bill of Rights protects everyone — including equality, dignity and education.',
    example: {
      question:
        'A learner is kept out of a school club because of their religion. Which right is affected?',
      steps: [
        'Everyone is equal and may not be unfairly discriminated against',
        'That is the right to equality in the Bill of Rights',
        'Report it to the principal, or the SA Human Rights Commission',
      ],
      answer: 'The right to equality',
    },
    pattern: {
      rows: [
        ['27 April 1994', 'first democratic election'],
        ['1996', 'Constitution adopted'],
        ['21 March', 'Human Rights Day'],
        ['27 April', 'Freedom Day'],
      ],
      rule: 'Our public holidays remember the road to democracy.',
    },
    realWorld: {
      question: 'Why is 21 March Human Rights Day?',
      answer: 'It remembers the Sharpeville massacre of 21 March 1960.',
    },
    gossip: [
      ['t', 'The Constitution is literally the boss of every other law in South Africa 👑'],
      ['y', 'Even Parliament?'],
      [
        't',
        'Even Parliament. If a law goes against the Constitution, the courts can strike it down.',
      ],
      [
        't',
        'And the Bill of Rights inside it protects EVERYONE — equality, dignity, education, and more.',
      ],
      ['y', 'What if someone breaks it?'],
      ['t', 'Report it — the SA Human Rights Commission exists exactly for that.'],
    ],
    mistake:
      'Confusing a want with a right — a right is protected for everyone by the Constitution.',
    checks: [
      { question: 'What is the highest law in South Africa?', answer: 'The Constitution' },
      {
        question: 'Which body protects human rights in South Africa?',
        answer: 'The South African Human Rights Commission',
      },
    ],
  },
  'health and wellbeing': {
    idea: 'Wellbeing is physical, mental and social: sleep, food, movement and people you can talk to. Asking for help is a strength, not a weakness.',
    example: {
      question: 'You feel stressed before exams. What helps?',
      steps: [
        'Name it: write down what is worrying you',
        'Break it down: one small task at a time',
        'Look after the basics: sleep, water, food, a walk',
        'Talk to someone: a friend, family, a teacher or a counsellor',
      ],
      answer: 'Name it, break it down, look after yourself, talk',
    },
    pattern: {
      rows: [
        ['body', 'sleep, food, movement'],
        ['mind', 'rest, calm, hobbies'],
        ['people', 'friends and family'],
        ['support', 'a counsellor or helpline'],
      ],
      rule: 'Wellbeing has many parts — look after all of them.',
    },
    realWorld: {
      question: 'A friend has seemed down for weeks. What do you do?',
      answer: 'Listen without judging, and help them talk to a trusted adult or a counsellor.',
    },
    gossip: [
      ['t', 'Real talk for a second 💜 Exam stress is real and you’re not weird for feeling it.'],
      ['y', 'It’s a lot sometimes'],
      [
        't',
        'Write down what’s worrying you, then do ONE small thing. Then the next. Big mountains, small steps.',
      ],
      ['t', 'Sleep, water, food and a walk sound boring, but they’re your brain’s fuel.'],
      ['y', 'And if it’s still too much?'],
      [
        't',
        'Talk to someone — a friend, a teacher, a counsellor. Asking for help is a strength, always.',
      ],
    ],
    mistake: 'Thinking you must handle everything alone — asking for help is a strength.',
    checks: [
      { question: 'Name the three parts of wellbeing.', answer: 'Physical, mental and social' },
      {
        question: 'Who can you talk to at school?',
        answer: 'A teacher, a counsellor or another trusted adult',
      },
    ],
  },
};
