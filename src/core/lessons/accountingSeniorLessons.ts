import type { TopicLesson } from './TopicLesson';

const INVENTORY: TopicLesson = {
  idea: 'Cost of sales = opening stock + purchases − closing stock. Closing stock can be valued by FIFO (first in, first out) or weighted average (total cost ÷ total units).',
  example: {
    question: 'Opening stock R5 000, purchases R40 000, closing stock R7 000. Cost of sales?',
    steps: ['Cost of sales = opening + purchases − closing', '= R5 000 + R40 000 − R7 000'],
    answer: 'R38 000',
  },
  pattern: {
    rows: [
      ['10 units at R20', 'R200'],
      ['30 units at R30', 'R900'],
      ['40 units in total', 'R1 100'],
      ['average per unit', 'R27.50'],
    ],
    rule: 'Weighted average = total cost ÷ total units.',
  },
  realWorld: {
    question:
      'A shop sells phone cases. Why does it count the cases still on the shelf at year-end?',
    answer: 'To work out the real cost of sales — and so the real gross profit.',
  },
  gossip: [
    [
      't',
      'Stock is sneaky: whatever’s still on the shelf at year-end changes your whole profit 📦',
    ],
    ['y', 'How?'],
    [
      't',
      'Cost of sales = what you had + what you bought − what’s left. Forget the “what’s left” part and your profit looks terrible.',
    ],
    [
      't',
      'And when prices change during the year, you value what’s left with FIFO or weighted average.',
    ],
    ['y', 'Weighted average?'],
    ['t', 'Total cost ÷ total units. 40 units for R1 100 → R27.50 each. Easy marks.'],
  ],
  mistake: 'Forgetting to subtract closing stock when working out cost of sales.',
  checks: [
    { question: 'What does FIFO stand for?', answer: 'First in, first out' },
    { question: 'Total cost R900 for 60 units. Weighted average per unit?', answer: 'R15' },
  ],
};

/** CAPS Accounting, Grades 11 and 12: topics beyond Grade 10. */
export const ACCOUNTING_SENIOR_LESSONS: Readonly<Record<string, TopicLesson>> = {
  partnerships: {
    idea: 'Partners share profit as the partnership agreement says: usually salaries and interest on capital first, then the rest in the profit-sharing ratio.',
    example: {
      question:
        'Net profit R120 000. Partner A gets a salary of R30 000; the rest is shared 2:1 between A and B.',
      steps: [
        'Left to share: R120 000 − R30 000 = R90 000',
        'A: 2/3 × R90 000 = R60 000; B: 1/3 = R30 000',
        'A in total: R30 000 + R60 000',
      ],
      answer: 'A gets R90 000, B gets R30 000',
    },
    pattern: {
      rows: [
        ['1:1 of R10 000', 'R5 000 and R5 000'],
        ['3:1 of R8 000', 'R6 000 and R2 000'],
        ['2:3 of R10 000', 'R4 000 and R6 000'],
        ['3:2 of R20 000', 'R12 000 and R8 000'],
      ],
      rule: 'Divide by the total of the ratio, then multiply by each partner’s share.',
    },
    realWorld: {
      question:
        'Two friends run a car wash and share profit 3:2. This month’s profit is R2 500. Who gets what?',
      answer: 'R1 500 and R1 000',
    },
    gossip: [
      ['t', 'Partnerships are like group projects… but with MONEY 💸'],
      ['y', 'Oh no'],
      [
        't',
        'That’s why there’s a partnership agreement. It says exactly who gets what, before anyone fights.',
      ],
      [
        't',
        'First the partners’ salaries and interest on capital come off. THEN the rest is split in the ratio.',
      ],
      ['y', 'And if you split first?'],
      ['t', 'Then your answer’s wrong and somebody in that partnership is very upset 😂'],
    ],
    mistake: 'Splitting the profit before taking off partners’ salaries and interest on capital.',
    checks: [
      {
        question: 'Which document says how partners share profit?',
        answer: 'The partnership agreement',
      },
      { question: 'Profit R30 000 shared 1:2. The larger share?', answer: 'R20 000' },
    ],
  },
  'fixed assets': {
    idea: 'Fixed assets lose value through depreciation. Straight-line: cost × % every year. Diminishing balance: carrying value × % each year.',
    example: {
      question:
        'A vehicle costs R200 000, depreciated at 20% a year on cost. Carrying value after 2 years?',
      steps: [
        'Each year: R200 000 × 20% = R40 000',
        'Two years: R80 000',
        'Carrying value: R200 000 − R80 000',
      ],
      answer: 'R120 000',
    },
    pattern: {
      rows: [
        ['bought', 'R100 000'],
        ['after year 1', 'R80 000'],
        ['after year 2', 'R64 000'],
        ['after year 3', 'R51 200'],
      ],
      rule: 'Diminishing balance at 20%: multiply what is left by 0.8 each year.',
    },
    realWorld: {
      question:
        'A taxi owner buys a minibus for R500 000. At 20% a year on cost, what is it worth on paper after 3 years?',
      answer: 'R500 000 − 3 × R100 000 = R200 000',
    },
    gossip: [
      [
        't',
        'Every car loses value the second it leaves the dealership, and accounting keeps receipts on that 🚗',
      ],
      ['y', 'That’s depreciation?'],
      ['t', 'Yes! Straight-line takes the same amount off every year — cost × %.'],
      [
        't',
        'Diminishing balance takes a % of what’s LEFT, so it shrinks less each year: R100 000 → R80 000 → R64 000.',
      ],
      ['y', 'What’s the trap?'],
      ['t', 'Using cost for diminishing balance. It’s carrying value, babe. Every time.'],
    ],
    diagram: {
      kind: 'bars',
      title: 'Diminishing balance at 20% a year',
      unit: 'R',
      bars: [
        { label: 'bought', value: 100000 },
        { label: 'yr 1', value: 80000 },
        { label: 'yr 2', value: 64000 },
        { label: 'yr 3', value: 51200 },
      ],
    },
    mistake: 'Using cost instead of carrying value for diminishing-balance depreciation.',
    checks: [
      {
        question: 'Equipment R50 000, 10% a year on cost. One year’s depreciation?',
        answer: 'R5 000',
      },
      {
        question: 'Carrying value R80 000, 20% diminishing balance. Next year’s depreciation?',
        answer: 'R16 000',
      },
    ],
  },
  reconciliations: {
    idea: 'A bank reconciliation explains why the bank statement and the Cash Book differ: outstanding deposits, outstanding payments, and bank charges or interest not yet in the books.',
    example: {
      question:
        'Bank statement R8 000 (favourable). Outstanding deposit R1 500, outstanding payment R2 300. Correct balance?',
      steps: [
        'Start with the statement: R8 000',
        'Add the outstanding deposit: R9 500',
        'Subtract the outstanding payment: − R2 300',
      ],
      answer: 'R7 200 — it should match the Cash Book',
    },
    pattern: {
      rows: [
        ['outstanding deposit', 'add to the statement'],
        ['outstanding payment', 'subtract from the statement'],
        ['bank charges', 'record in the Cash Payments Journal'],
        ['interest received', 'record in the Cash Receipts Journal'],
      ],
      rule: 'What the bank doesn’t know yet adjusts the statement; what you didn’t know yet goes in your books.',
    },
    realWorld: {
      question:
        'Your banking app shows R500, but a R120 debit order hasn’t gone off yet. What do you really have?',
      answer: 'R380 — that is reconciling',
    },
    gossip: [
      [
        't',
        'The bank and your Cash Book are telling two different stories and you have to find the truth 🕵️',
      ],
      ['y', 'Who’s lying?'],
      [
        't',
        'Nobody! They just don’t know the same things yet. A deposit you made last night isn’t on the statement yet.',
      ],
      ['t', 'And bank charges? The bank knew, you didn’t — so those go into YOUR books.'],
      ['y', 'Okay that makes sense'],
      [
        't',
        'Just don’t add outstanding payments. You subtract them. Every year someone adds them 😭',
      ],
    ],
    mistake: 'Adding outstanding payments instead of subtracting them.',
    checks: [
      {
        question: 'Bank charges of R85 appear only on the statement. Where do you record them?',
        answer: 'In the Cash Payments Journal',
      },
      {
        question: 'Statement R3 000, outstanding payment R700. Correct balance?',
        answer: 'R2 300',
      },
    ],
  },
  clubs: {
    idea: 'A club is a non-profit organisation: it has members and an accumulated fund (not capital), and shows a surplus or deficit (not a profit).',
    example: {
      question:
        'Membership fees received R12 000 include R1 500 for next year and leave out R800 still owed for this year. This year’s fees?',
      steps: [
        'Start: R12 000',
        'Less fees received in advance: − R1 500',
        'Add fees still owed: + R800',
      ],
      answer: 'R11 300',
    },
    pattern: {
      rows: [
        ['capital', 'accumulated fund'],
        ['profit', 'surplus'],
        ['loss', 'deficit'],
        ['owner', 'members'],
      ],
      rule: 'Clubs use their own words because they are not run for profit.',
    },
    realWorld: {
      question: 'Your soccer club collected R4 000 and spent R3 400 on kit and travel. Result?',
      answer: 'A surplus of R600',
    },
    gossip: [
      ['t', 'Clubs are not businesses and they will correct you if you say “profit” 😤'],
      ['y', 'What do they say then?'],
      [
        't',
        'Surplus or deficit. And not capital — accumulated fund. It belongs to all the members.',
      ],
      [
        't',
        'The tricky bit is fees: some members pay for next year early, some still owe for this year.',
      ],
      ['y', 'So I adjust them?'],
      ['t', 'Yes — take off the advance, add the arrears. Then it’s THIS year’s income only.'],
    ],
    mistake: 'Calling a club’s surplus a profit.',
    checks: [
      { question: 'What replaces capital in a club?', answer: 'The accumulated fund' },
      { question: 'Fees received in advance: asset or liability?', answer: 'A current liability' },
    ],
  },
  'inventory valuation': INVENTORY,
  'inventory systems': INVENTORY,
  'cost accounting': {
    idea: 'Cost of production = direct materials + direct labour + factory overheads. Unit cost = total cost ÷ units made.',
    example: {
      question: 'Materials R30 000, labour R18 000, overheads R12 000 for 2 000 units. Unit cost?',
      steps: ['Total: R30 000 + R18 000 + R12 000 = R60 000', 'Unit cost: R60 000 ÷ 2 000'],
      answer: 'R30 per unit',
    },
    pattern: {
      rows: [
        ['R60 000 ÷ 2 000 units', 'R30'],
        ['R60 000 ÷ 3 000 units', 'R20'],
        ['R60 000 ÷ 4 000 units', 'R15'],
        ['R60 000 ÷ 6 000 units', 'R10'],
      ],
      rule: 'More units share the same cost, so each unit gets cheaper.',
    },
    realWorld: {
      question:
        'A uniform maker spends R9 000 on fabric, R6 000 on wages and R3 000 on electricity for 300 shirts. Cost per shirt?',
      answer: 'R18 000 ÷ 300 = R60',
    },
    gossip: [
      ['t', 'Ever wondered how a factory knows what ONE shirt costs? 👕'],
      ['y', 'Never, but go on'],
      [
        't',
        'Add the fabric, the wages of the people making them and the factory costs like electricity. Then divide by how many shirts.',
      ],
      ['t', 'And the more you make, the cheaper each one gets — same costs, more shirts.'],
      ['y', 'What about the office staff?'],
      ['t', 'Not production costs! Selling and admin costs stay out. That’s the trap.'],
    ],
    mistake: 'Putting selling and admin costs into the cost of production.',
    checks: [
      { question: 'Total cost R45 000 for 1 500 units. Unit cost?', answer: 'R30' },
      { question: 'Factory rent: direct cost or overhead?', answer: 'A factory overhead' },
    ],
  },
  ethics: {
    idea: 'Ethics means doing what is right even when nobody checks: honest records, openness, responsibility — and good governance codes like King IV for companies.',
    example: {
      question: 'A manager asks you to record a R5 000 cash sale as R3 000. What do you do?',
      steps: [
        'Spot it: the books would be false — that is fraud',
        'Refuse, and record the real amount',
        'Report it through the right channel (the owner, auditor or a whistle-blowing line)',
      ],
      answer: 'Record R5 000 and report it',
    },
    pattern: {
      rows: [
        ['honesty', 'true records'],
        ['transparency', 'open information'],
        ['accountability', 'take responsibility'],
        ['fairness', 'treat everyone equally'],
      ],
      rule: 'Good governance rests on these values.',
    },
    realWorld: {
      question: 'Why do companies have anonymous whistle-blowing hotlines?',
      answer: 'So staff can report wrongdoing safely, without being victimised.',
    },
    gossip: [
      [
        't',
        'Okay, scenario: your manager asks you to write R3 000 in the books when the sale was R5 000 😳',
      ],
      ['y', 'Yikes'],
      ['t', 'That’s fraud. Even if “everyone does it”. Even if it’s your boss.'],
      [
        't',
        'You record the real amount and report it — that’s exactly what whistle-blowing lines are for.',
      ],
      ['y', 'What do they ask in the exam?'],
      [
        't',
        'Name the value broken (honesty, transparency…) and what should happen. Specific, not vibes.',
      ],
    ],
    mistake: 'Thinking “everyone does it” makes it okay.',
    checks: [
      {
        question: 'What is it called when an employee reports wrongdoing?',
        answer: 'Whistle-blowing',
      },
      { question: 'Name South Africa’s code of corporate governance.', answer: 'The King IV Code' },
    ],
  },
  companies: {
    idea: 'A company is owned by shareholders. Company tax comes off first; profit after tax pays dividends, and what is kept is retained income.',
    example: {
      question: 'Net profit before tax R500 000, company tax 27%. Profit after tax?',
      steps: ['Tax: 27% × R500 000 = R135 000', 'After tax: R500 000 − R135 000'],
      answer: 'R365 000',
    },
    pattern: {
      rows: [
        ['1 000 shares × 50c', 'R500'],
        ['10 000 shares × 20c', 'R2 000'],
        ['50 000 shares × 10c', 'R5 000'],
        ['200 000 shares × 15c', 'R30 000'],
      ],
      rule: 'Dividends = number of shares × dividend per share.',
    },
    realWorld: {
      question: 'You own 100 shares in a company that pays 80c a share. What do you get?',
      answer: 'R80 in dividends',
    },
    gossip: [
      ['t', 'When you own shares, you literally own a tiny piece of the company 🏢'],
      ['y', 'So I get the profit?'],
      ['t', 'Some of it! But tax comes first — 27% company tax. What’s left is profit after tax.'],
      [
        't',
        'The directors pay some out as dividends: shares × cents per share. The rest stays as retained income.',
      ],
      ['y', 'Can I get dividends from profit before tax?'],
      ['t', 'Nope 🙅 SARS always eats first.'],
    ],
    mistake: 'Paying dividends out of profit before tax — tax comes first.',
    checks: [
      { question: 'Who owns a company?', answer: 'Its shareholders' },
      { question: 'What is profit kept in the company called?', answer: 'Retained income' },
    ],
  },
  'cash flow statements': {
    idea: 'A cash flow statement shows where cash came from and went: operating, investing and financing activities.',
    example: {
      question:
        'Cash from operations R80 000, bought equipment R50 000, took a loan of R20 000. Net change in cash?',
      steps: [
        'Operating: + R80 000',
        'Investing: − R50 000',
        'Financing: + R20 000',
        'Net: 80 000 − 50 000 + 20 000',
      ],
      answer: '+R50 000',
    },
    pattern: {
      rows: [
        ['paying salaries', 'operating'],
        ['buying a vehicle', 'investing'],
        ['issuing shares', 'financing'],
        ['repaying a loan', 'financing'],
      ],
      rule: 'Day-to-day = operating; long-term assets = investing; loans and shares = financing.',
    },
    realWorld: {
      question: 'A business made a profit but still ran out of cash. How?',
      answer: 'Profit isn’t cash — money can be tied up in stock, debtors or new equipment.',
    },
    gossip: [
      ['t', 'Here’s the drama: a business can make a PROFIT and still go broke 😱'],
      ['y', 'How is that even possible?'],
      [
        't',
        'Because profit isn’t cash. The money might be stuck in stock, or customers haven’t paid yet.',
      ],
      ['t', 'The cash flow statement follows the actual cash: operating, investing, financing.'],
      ['y', 'Anything tricky?'],
      ['t', 'Depreciation gets ADDED back. It lowered profit, but no cash actually left.'],
    ],
    diagram: {
      kind: 'flow',
      title: 'Where the cash goes',
      steps: [
        'Operating activities',
        'Investing activities',
        'Financing activities',
        'Net change in cash',
      ],
    },
    mistake: 'Treating depreciation as a cash outflow — it is added back because no cash moved.',
    checks: [
      { question: 'Buying land is which kind of activity?', answer: 'Investing' },
      {
        question: 'Why is depreciation added back?',
        answer: 'It reduced profit but no cash left the business',
      },
    ],
  },
};
