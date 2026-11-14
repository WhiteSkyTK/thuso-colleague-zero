import type { TopicLesson } from './TopicLesson';

/** CAPS English First Additional Language, Grades 10–12: one short lesson per topic. */
export const ENGLISH_LESSONS: Readonly<Record<string, TopicLesson>> = {
  'reading comprehension': {
    idea: 'Read the questions first, then the text. Answer in full sentences, in your own words unless asked to quote, and match the marks: 2 marks = 2 points.',
    example: {
      question: 'Why did the narrator leave the village? Quote ONE word. (2 marks)',
      steps: [
        'Scan the text for “left” or “village”',
        'Give the reason in your own words (1 mark)',
        'Quote one word, in quotation marks (1 mark)',
      ],
      answer: 'A reason in your own words + one quoted word',
    },
    pattern: {
      rows: [
        ['Quote…', 'copy exactly, in “ ”'],
        ['Explain…', 'say why, in your own words'],
        ['True or false?', 'answer + a quote as proof'],
        ['Discuss…', 'your view + a reason'],
      ],
      rule: 'The question word tells you exactly what to do.',
    },
    realWorld: {
      question: 'The school sends a WhatsApp about a trip. Which three things must you find?',
      answer: 'The date and time, what to bring, and the cost or what to sign',
    },
    gossip: [
      ['t', 'Okay so comprehension is not about reading harder, it’s about reading SMARTER 🧠'],
      ['y', 'How?'],
      ['t', 'Read the questions FIRST. Then you know what you’re hunting for in the text.'],
      [
        't',
        'Look at the marks: 2 marks means 2 points. Writing one point for 2 marks is leaving money on the table 💸',
      ],
      ['y', 'And quoting?'],
      [
        't',
        'If they say “quote ONE word”, you quote one word — not the whole sentence. And “in your own words” means don’t copy. They notice. Trust me.',
      ],
    ],
    diagram: {
      kind: 'flow',
      title: 'Smart reading order',
      steps: [
        'Read the questions',
        'Skim the whole text',
        'Scan for key words',
        'Answer: match the marks',
      ],
    },
    mistake: 'Quoting a whole sentence when the question asks for one word.',
    checks: [
      { question: 'A question is worth 3 marks. How many points do you need?', answer: 'Three' },
      {
        question: 'What does “in your own words” mean?',
        answer: 'Do not copy the text — rephrase it',
      },
    ],
  },
  'summary writing': {
    idea: 'Choose 7 main points, write them in your own words as full sentences in ONE paragraph, stay within the word limit (often 90 words) and give the word count.',
    example: {
      question:
        'Summarise: “The learners, who were very tired after the long trip, went straight to bed.”',
      steps: [
        'Find the main fact: the learners went to bed',
        'Cut the extra detail',
        'Rewrite it briefly in your own words',
      ],
      answer: 'The tired learners went straight to bed.',
    },
    pattern: {
      rows: [
        ['examples', 'leave out'],
        ['repeated ideas', 'leave out'],
        ['descriptions', 'leave out'],
        ['main facts', 'keep'],
      ],
      rule: 'Keep the facts, cut the padding.',
    },
    realWorld: {
      question: 'You tell a friend about a 2-hour movie in 30 seconds. What do you keep?',
      answer: 'Who, what happens and how it ends — that is a summary',
    },
    gossip: [
      [
        't',
        'A summary is literally gossip skills — you tell the main story and skip the boring bits 😂',
      ],
      ['y', 'Hahaha true'],
      ['t', 'Find 7 main points. Leave out examples, repetition and long descriptions.'],
      [
        't',
        'Write them in YOUR words, as one paragraph, and stay under the word limit. Then write the word count at the end.',
      ],
      ['y', 'Can I just copy the important sentences?'],
      ['t', 'Nope 🙅 copying loses the language marks. Same tea, your own words.'],
    ],
    diagram: {
      kind: 'flow',
      title: 'Summary in five moves',
      steps: [
        'Read the instruction',
        'Underline 7 points',
        'Rewrite in your own words',
        'One paragraph',
        'Count the words',
      ],
    },
    mistake: 'Copying sentences straight from the text — the marks are for your own words.',
    checks: [
      { question: 'How many points does a summary usually need?', answer: 'Seven' },
      {
        question: 'Point form or a paragraph?',
        answer: 'A paragraph, unless the instruction says otherwise',
      },
    ],
  },
  'language structures': {
    idea: 'Know the rules the paper tests: tenses, active and passive voice, direct and indirect speech, and concord (the subject and verb agree).',
    example: {
      question: 'Change to the passive voice: The learner wrote the essay.',
      steps: [
        'The object becomes the subject: The essay',
        'Use “to be” + past participle: was written',
        'Add “by” + the doer: by the learner',
      ],
      answer: 'The essay was written by the learner.',
    },
    pattern: {
      rows: [
        ['I eat', 'I ate'],
        ['She runs', 'She ran'],
        ['They write', 'They wrote'],
        ['He goes', 'He went'],
      ],
      rule: 'Many common verbs have irregular past tenses — learn them.',
    },
    realWorld: {
      question: 'A headline says “Taxi fares were increased by 5%.” Who did it?',
      answer: 'The passive hides the doer — you have to ask who increased them',
    },
    gossip: [
      ['t', 'Passive voice is the sneakiest way to hide who did something 👀'],
      ['y', 'What do you mean?'],
      [
        't',
        '“The learner broke the window” — we KNOW who did it. “The window was broken” — suddenly nobody did it 😂',
      ],
      [
        't',
        'To make passive: the object moves to the front, add “was/were” + past participle, and “by” + the doer if you want.',
      ],
      ['y', 'And reported speech?'],
      [
        't',
        'Move the tense one step back. “I am tired,” she said → She said that she WAS tired. Forget that and it’s gone.',
      ],
    ],
    mistake:
      'In indirect speech, forgetting to move the tense back: “I am tired” → she said that she was tired.',
    checks: [
      {
        question: 'Correct the concord: “The list of names are long.”',
        answer: 'The list of names is long.',
      },
      {
        question: 'Indirect speech: “I will come,” he said.',
        answer: 'He said that he would come.',
      },
    ],
  },
  'novel study': {
    idea: 'For any novel, know the characters, the setting, the conflict, the themes and how the plot develops. Every answer needs evidence from the book.',
    example: {
      question: 'Is the main character a good friend? (3 marks)',
      steps: [
        'Give your view: yes or no',
        'Give one reason from the story',
        'Back it up with an event or a quote',
      ],
      answer: 'View + reason + evidence',
    },
    pattern: {
      rows: [
        ['exposition', 'meet the characters'],
        ['rising action', 'the conflict grows'],
        ['climax', 'the turning point'],
        ['resolution', 'the conflict ends'],
      ],
      rule: 'Almost every story follows this shape.',
    },
    realWorld: {
      question: 'Think of a TV soapie you watch. What is the main conflict right now?',
      answer: 'Naming the conflict is exactly what the exam asks you to do with your novel',
    },
    gossip: [
      [
        't',
        'A novel is basically a soapie in a book, and you’re the one following ALL the drama 📺',
      ],
      ['y', 'Okay I like this'],
      [
        't',
        'First we meet everyone (exposition). Then the trouble builds up (rising action). Then the big moment where everything changes — the climax 😱',
      ],
      ['t', 'Then things settle and the conflict is sorted out — the resolution.'],
      ['y', 'What do they ask in the exam?'],
      [
        't',
        'Your opinion — but with receipts. View + reason + evidence from the book. Just retelling the story? Zero marks for gossip without the tea.',
      ],
    ],
    diagram: {
      kind: 'flow',
      title: 'The shape of a story',
      steps: ['Exposition', 'Rising action', 'Climax', 'Falling action', 'Resolution'],
    },
    mistake: 'Retelling the story instead of answering the question.',
    checks: [
      {
        question: 'What is a theme?',
        answer: 'A main idea or message of the story (e.g. friendship, greed)',
      },
      { question: 'What is the climax?', answer: 'The turning point — the most intense moment' },
    ],
  },
  poetry: {
    idea: 'Read the poem three times. Find the speaker, the tone and the figures of speech, then explain the EFFECT they create.',
    example: {
      question: '“The classroom was a zoo.” Name the figure of speech and explain it.',
      steps: [
        'No “like” or “as” → a metaphor',
        'The class is compared to a zoo',
        'Effect: it was loud, wild and out of control',
      ],
      answer: 'A metaphor: the class was wild and noisy',
    },
    pattern: {
      rows: [
        ['as brave as a lion', 'simile'],
        ['the wind whispered', 'personification'],
        ['I’ve told you a million times', 'hyperbole'],
        ['the sun is a golden coin', 'metaphor'],
      ],
      rule: 'Like/as = simile; is/was = metaphor; human action = personification; exaggeration = hyperbole.',
    },
    realWorld: {
      question: 'An advert says “This burger is heaven.” Which figure of speech, and why use it?',
      answer: 'A metaphor — it makes you feel the burger is perfect',
    },
    gossip: [
      ['t', 'Poets never say anything straight, they’re SO dramatic 🎭'],
      ['y', 'Like how?'],
      [
        't',
        '“The wind whispered” — wind can’t whisper! That’s personification, giving human actions to things.',
      ],
      [
        't',
        '“As brave as a lion” uses “as”, so simile. “The classroom was a zoo” — no like or as — metaphor.',
      ],
      ['y', 'Okay I can spot them'],
      [
        't',
        'Spotting is half the marks. The other half? Say what it DOES — the effect. “The class was loud and wild.” That’s where people lose marks.',
      ],
    ],
    mistake: 'Naming the figure of speech but not explaining its effect.',
    checks: [
      { question: '“The stars danced.” Which figure of speech?', answer: 'Personification' },
      {
        question: 'What is tone?',
        answer: 'The speaker’s attitude or feeling (e.g. angry, hopeful)',
      },
    ],
  },
  'essay writing': {
    idea: 'Plan first, then write: an introduction, 3–4 body paragraphs (one idea each) and a conclusion. Stay on topic and within the word count.',
    example: {
      question: 'Plan an essay on “The best day of my life”.',
      steps: [
        'Brainstorm: what, where, who, feelings',
        'Introduction: hook the reader',
        'Body: one paragraph per part of the day',
        'Conclusion: why it mattered',
      ],
      answer: 'A five-paragraph plan',
    },
    pattern: {
      rows: [
        ['narrative', 'tells a story'],
        ['descriptive', 'paints a picture'],
        ['reflective', 'thinks about feelings'],
        ['argumentative', 'takes a side'],
      ],
      rule: 'Know the essay type before you start writing.',
    },
    realWorld: {
      question: 'Writing a cover letter for a holiday job uses the same skills. Why?',
      answer: 'You need a clear opening, organised points and a strong ending',
    },
    gossip: [
      ['t', 'The secret nobody tells you about essays? The A-students PLAN first 🤫'],
      ['y', 'Even in the exam?'],
      ['t', 'Especially in the exam. Two minutes on a mind map saves you from rambling.'],
      [
        't',
        'Then: an intro that hooks, body paragraphs with ONE idea each, and a conclusion that ties it up.',
      ],
      ['y', 'What if I just start writing?'],
      ['t', 'Then the essay wanders off like a lost tourist and the structure marks go with it 😬'],
    ],
    diagram: {
      kind: 'flow',
      title: 'From plan to final essay',
      steps: [
        'Plan (mind map)',
        'Introduction',
        'Body paragraphs',
        'Conclusion',
        'Edit and count words',
      ],
    },
    mistake: 'Starting without a plan — the essay wanders and loses structure marks.',
    checks: [
      { question: 'How many main ideas per paragraph?', answer: 'One' },
      { question: 'Which essay type takes a side?', answer: 'Argumentative' },
    ],
  },
  'transactional writing': {
    idea: 'Transactional texts — formal letters, emails, CVs, speeches, reports — each have a format. Format, register (formal or informal) and purpose all earn marks.',
    example: {
      question: 'Set out the parts of a formal letter.',
      steps: [
        'Your address at the top right, then the date',
        'The recipient’s address on the left',
        'Salutation: Dear Sir/Madam',
        'Subject line, body, then Yours faithfully + your name',
      ],
      answer: 'Address, date, recipient, salutation, subject, body, closing',
    },
    pattern: {
      rows: [
        ['Dear Sir/Madam', 'Yours faithfully'],
        ['Dear Mr Dlamini', 'Yours sincerely'],
        ['Hi Thandi', 'Regards / Love'],
        ['To whom it may concern', 'Yours faithfully'],
      ],
      rule: 'The greeting decides the closing.',
    },
    realWorld: {
      question:
        'You want to complain to a cellphone company about a wrong bill. Which text and register?',
      answer: 'A formal letter or email of complaint, in a formal register',
    },
    gossip: [
      ['t', 'Okay so formal letters have RULES and the markers are very strict about them 📏'],
      ['y', 'Like what?'],
      [
        't',
        'If you start with “Dear Sir/Madam” — you don’t know their name — you end with “Yours faithfully”.',
      ],
      [
        't',
        'If you know the name, “Dear Mr Dlamini”, you end with “Yours sincerely”. Mix them up and it’s a whole thing.',
      ],
      ['y', 'And can I write like I talk?'],
      [
        't',
        'Not in a formal letter! No slang, no “hey”. Save the vibes for the friendly letter 😌',
      ],
    ],
    diagram: {
      kind: 'flow',
      title: 'A formal letter, top to bottom',
      steps: [
        'Your address + date',
        'Recipient + salutation',
        'Subject line',
        'Body: purpose first',
        'Closing + name',
      ],
    },
    mistake: 'Using slang or an informal greeting in a formal letter.',
    checks: [
      { question: 'Closing for “Dear Sir”?', answer: 'Yours faithfully' },
      {
        question: 'Name two transactional texts.',
        answer: 'e.g. a formal letter, CV, email, speech or report',
      },
    ],
  },
  'oral presentation': {
    idea: 'A strong talk has a clear start, middle and end, eye contact, a clear voice and good timing. Practise out loud.',
    example: {
      question: 'Plan a 2-minute talk on your role model.',
      steps: [
        'Hook: a question or a quote',
        'Three points about them',
        'End: what you learned from them',
      ],
      answer: 'Hook + three points + ending',
    },
    pattern: {
      rows: [
        ['talking too fast', 'pause after each point'],
        ['looking down', 'look at the audience'],
        ['reading word for word', 'use cue cards'],
        ['too soft', 'project your voice'],
      ],
      rule: 'Every common problem has a simple fix.',
    },
    realWorld: {
      question: 'Why does a job interview feel like an oral?',
      answer: 'You speak clearly, give examples and keep eye contact — the same skills',
    },
    gossip: [
      ['t', 'Orals are scary, I know. But here’s what the confident ones are secretly doing 🎤'],
      ['y', 'Tell me'],
      [
        't',
        'They open with a hook — a question or a quote — so everyone is listening from the first line.',
      ],
      [
        't',
        'They use cue cards with key words, NOT the whole speech, so they can look at the audience.',
      ],
      ['y', 'And if I get nervous and rush?'],
      [
        't',
        'Pause after each point. Breathe. A pause sounds confident, rushing sounds panicked. You’ve got this 💪',
      ],
    ],
    mistake: 'Reading the whole speech from paper instead of talking to the audience.',
    checks: [
      { question: 'What helps you remember your points without reading?', answer: 'Cue cards' },
      {
        question: 'Name one way to open a speech.',
        answer: 'A question, a quote or a short story',
      },
    ],
  },
};
