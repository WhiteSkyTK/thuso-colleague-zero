import type { TopicLesson } from './TopicLesson';

const BUDGETING: TopicLesson = {
  idea: 'A cash budget plans money in and money out. Receipts − payments = a surplus (positive) or a deficit (negative).',
  example: {
    question: 'Expected receipts R25 000, expected payments R28 500. Surplus or deficit?',
    steps: ['Receipts − payments = R25 000 − R28 500', '= −R3 500'],
    answer: 'A deficit of R3 500',
  },
  pattern: {
    rows: [
      ['R10 000 in, R8 000 out', 'surplus R2 000'],
      ['R5 000 in, R6 000 out', 'deficit R1 000'],
      ['R12 000 in, R12 000 out', 'break even'],
      ['R9 000 in, R7 500 out', 'surplus R1 500'],
    ],
    rule: 'Money in minus money out: positive is a surplus, negative is a deficit.',
  },
  realWorld: {
    question:
      'You get R800 pocket money. Taxi fare R400, airtime R150, food R300. Surplus or deficit?',
    answer: 'R800 − R850 = a deficit of R50, so something has to go',
  },
  gossip: [
    [
      't',
      'Okay so budgets are basically planning your month BEFORE payday so you are not broke by the 20th 😅',
    ],
    ['y', 'Too relatable. How does it work?'],
    [
      't',
      'You list all the money you expect in — receipts. Then all the money you expect out — payments.',
    ],
    [
      't',
      'Receipts minus payments. Positive? Surplus, we love to see it. Negative? Deficit. Somebody is borrowing.',
    ],
    ['y', 'And what can go wrong in the exam?'],
    [
      't',
      'Psst… depreciation does NOT go in a cash budget. No cash moves! Bad debts too. Examiners put them in just to see who falls for it 👀',
    ],
  ],
  diagram: {
    kind: 'bars',
    title: 'Receipts vs payments (a deficit)',
    unit: 'R',
    bars: [
      { label: 'receipts', value: 25000 },
      { label: 'payments', value: 28500 },
    ],
  },
  mistake: 'Putting depreciation or bad debts in a cash budget — no cash moves for them.',
  checks: [
    { question: 'Receipts R14 000, payments R11 500. Result?', answer: 'A surplus of R2 500' },
    {
      question: 'Name one item that never appears in a cash budget.',
      answer: 'Depreciation (or bad debts)',
    },
  ],
};

const ANALYSIS: TopicLesson = {
  idea: 'Ratios turn numbers into meaning. Mark-up % = gross profit ÷ cost of sales × 100. Current ratio = current assets : current liabilities.',
  example: {
    question: 'Gross profit R36 000, cost of sales R54 000. Find the mark-up %.',
    steps: ['Mark-up % = gross profit ÷ cost of sales × 100', '= 36 000 ÷ 54 000 × 100'],
    answer: '66.7%',
  },
  pattern: {
    rows: [
      ['CA R20 000, CL R10 000', '2 : 1'],
      ['CA R30 000, CL R10 000', '3 : 1'],
      ['CA R15 000, CL R15 000', '1 : 1'],
      ['CA R40 000, CL R20 000', '2 : 1'],
    ],
    rule: 'Current ratio = current assets ÷ current liabilities, written as ? : 1.',
  },
  realWorld: {
    question:
      'A clothing shop buys a jacket for R400 and sells it for R600. What is its mark-up %?',
    answer: 'Gross profit R200 ÷ R400 × 100 = 50%',
  },
  gossip: [
    [
      't',
      'So the financial statements are out, but numbers alone don’t tell the story. Ratios do 🔍',
    ],
    ['y', 'Like what?'],
    [
      't',
      'Mark-up! Gross profit ÷ cost of sales × 100. Shop buys a jacket at R400, sells at R600 — R200 profit on R400 cost. 50% mark-up.',
    ],
    ['y', 'Wait, not divided by sales?'],
    [
      't',
      'THAT is the trap 😏 Mark-up is always on COST. Divide by sales and you get a different ratio altogether.',
    ],
    [
      't',
      'And the current ratio — current assets vs current liabilities — tells you if the business can pay its short-term bills. 2 : 1 means R2 for every R1 it owes. Healthy.',
    ],
  ],
  mistake: 'Dividing by sales instead of cost of sales when working out the mark-up %.',
  checks: [
    { question: 'Gross profit R20 000, cost of sales R50 000. Mark-up %?', answer: '40%' },
    {
      question: 'Current assets R60 000, current liabilities R30 000. Current ratio?',
      answer: '2 : 1',
    },
  ],
};

/** CAPS Accounting, Grade 10 (and topics that come back in Grades 11 and 12). */
export const ACCOUNTING_LESSONS: Readonly<Record<string, TopicLesson>> = {
  'accounting concepts': {
    idea: 'The accounting equation always balances: Assets = Owner’s equity + Liabilities. Every transaction changes at least two items.',
    example: {
      question: 'Assets R80 000 and liabilities R30 000. What is the owner’s equity?',
      steps: ['Write the equation: A = OE + L', 'R80 000 = OE + R30 000', 'OE = R80 000 − R30 000'],
      answer: 'R50 000',
    },
    pattern: {
      rows: [
        ['Owner invests R10 000 cash', 'A +10 000, OE +10 000'],
        ['Buys stationery R500 cash', 'A −500, OE −500'],
        ['Takes a R5 000 loan', 'A +5 000, L +5 000'],
        ['Pays R2 000 off the loan', 'A −2 000, L −2 000'],
      ],
      rule: 'Both sides move by the same amount, so the equation stays balanced.',
    },
    realWorld: {
      question:
        'A spaza shop owner buys R3 000 of stock on credit. What happens to assets and liabilities?',
      answer: 'Assets (stock) +R3 000 and liabilities (creditors) +R3 000 — still balanced',
    },
    gossip: [
      [
        't',
        'Okay you know the accounting equation? Assets = Owner’s equity + Liabilities. Those three are besties who must ALWAYS stay equal 👯',
      ],
      ['y', 'Always always?'],
      [
        't',
        'Always. Owner throws in R10 000 cash? Assets up R10 000, owner’s equity up R10 000. Balanced.',
      ],
      ['y', 'And if the business takes a loan?'],
      ['t', 'Assets up, liabilities up. Same amount. No drama.'],
      [
        't',
        'But here’s the tea ☕ drawings are NOT an expense. When the owner takes money out it just shrinks owner’s equity. People lose marks on that every single year.',
      ],
    ],
    diagram: {
      kind: 'bars',
      title: 'Assets = owner’s equity + liabilities',
      unit: 'R',
      bars: [
        { label: 'assets', value: 80000 },
        { label: 'equity', value: 50000 },
        { label: 'liabilities', value: 30000 },
      ],
    },
    mistake:
      'Treating drawings as an expense — drawings reduce owner’s equity but are not an expense.',
    checks: [
      {
        question: 'Which concept says the business is separate from its owner?',
        answer: 'The business entity concept',
      },
      {
        question: 'Assets R120 000, owner’s equity R90 000. Find the liabilities.',
        answer: 'R30 000',
      },
    ],
  },
  'bookkeeping of a sole trader': {
    idea: 'Every transaction starts with a source document, goes into a journal, is posted to the General Ledger and is checked in the Trial Balance.',
    example: {
      question: 'Cash sales of R2 300 on a cash register roll. Where does it go?',
      steps: [
        'Source document: the cash register roll',
        'Journal: Cash Receipts Journal (CRJ)',
        'Ledger: debit Bank, credit Sales',
      ],
      answer: 'CRJ → Bank (debit) and Sales (credit)',
    },
    pattern: {
      rows: [
        ['Receipt issued', 'Cash Receipts Journal'],
        ['Cheque or EFT paid', 'Cash Payments Journal'],
        ['Invoice to a debtor', 'Debtors Journal'],
        ['Invoice from a creditor', 'Creditors Journal'],
      ],
      rule: 'The source document tells you which journal to use.',
    },
    realWorld: {
      question:
        'You pay the municipality R1 200 for water by EFT. Which journal and which accounts?',
      answer: 'Cash Payments Journal: debit Water and electricity, credit Bank',
    },
    gossip: [
      [
        't',
        'Every transaction goes on a whole journey, like a celeb from the airport to the club ✈️',
      ],
      ['y', 'Haha okay, go on'],
      [
        't',
        'First the source document — a receipt, an invoice, a cheque counterfoil. That’s the receipts, literally, the proof.',
      ],
      [
        't',
        'Then it’s recorded in a journal: CRJ for money in, CPJ for money out, DJ and CJ for credit deals.',
      ],
      ['y', 'And then?'],
      [
        't',
        'Posted to the General Ledger, and the Trial Balance checks that debits = credits. If they don’t match, someone messed up and EVERYONE will know 😬',
      ],
    ],
    diagram: {
      kind: 'flow',
      title: 'The journey of a transaction',
      steps: ['Source document', 'Journal', 'General Ledger', 'Trial Balance'],
    },
    mistake: 'Debiting and crediting the wrong way round — money coming in is a debit to Bank.',
    checks: [
      { question: 'Which journal records goods sold on credit?', answer: 'The Debtors Journal' },
      { question: 'In a Trial Balance, total debits must equal…', answer: 'total credits' },
    ],
  },
  'salaries and wages': {
    idea: 'Gross salary − deductions (PAYE, UIF, pension, medical aid) = net salary. UIF is 1% from the employee, and the employer adds another 1%.',
    example: {
      question: 'Gross salary R12 000. PAYE R1 100, pension R900, UIF 1%. Find the net salary.',
      steps: [
        'UIF: 1% × R12 000 = R120',
        'Total deductions: R1 100 + R900 + R120 = R2 120',
        'Net: R12 000 − R2 120',
      ],
      answer: 'R9 880',
    },
    pattern: {
      rows: [
        ['gross R5 000', 'UIF R50'],
        ['gross R8 000', 'UIF R80'],
        ['gross R15 000', 'UIF R150'],
        ['gross R20 000', 'UIF R200'],
      ],
      rule: 'UIF = 1% of gross: move the comma two places to the left.',
    },
    realWorld: {
      question:
        'Your first payslip says gross R6 500 but only R5 900 reaches your bank. Where did R600 go?',
      answer: 'To deductions like PAYE, UIF and pension: gross − deductions = net',
    },
    gossip: [
      ['t', 'So Thabo got his first payslip and nearly fainted 😱'],
      ['y', 'Why?!'],
      ['t', 'Gross said R12 000 but only R9 880 landed in his account.'],
      [
        't',
        'PAYE took R1 100, his pension took R900, and UIF took 1% — R120. Gross minus deductions = net. That’s the whole story.',
      ],
      ['y', 'So the boss pays UIF too?'],
      [
        't',
        'Yes! The employer adds ANOTHER 1% on top. That’s an extra expense for the business, not taken from Thabo. Mix them up and the memo will not be kind.',
      ],
    ],
    diagram: {
      kind: 'bars',
      title: 'Gross, deductions and net',
      unit: 'R',
      bars: [
        { label: 'gross', value: 12000 },
        { label: 'deductions', value: 2120 },
        { label: 'net', value: 9880 },
      ],
    },
    mistake:
      'Deducting the employer’s contributions from the worker’s salary — they are an extra cost for the business.',
    checks: [
      { question: 'Gross R10 000, deductions R1 850. Net salary?', answer: 'R8 150' },
      { question: 'What does UIF stand for?', answer: 'Unemployment Insurance Fund' },
    ],
  },
  vat: {
    idea: 'VAT in South Africa is 15%. Price excluding VAT × 1.15 = price including VAT. The VAT inside a price = price × 15 ÷ 115.',
    example: {
      question: 'A TV costs R4 600 including VAT. How much is the VAT?',
      steps: ['VAT = R4 600 × 15 ÷ 115', '= R600 (so the price before VAT is R4 000)'],
      answer: 'R600',
    },
    pattern: {
      rows: [
        ['R100 excl.', 'R115 incl.'],
        ['R200 excl.', 'R230 incl.'],
        ['R1 000 excl.', 'R1 150 incl.'],
        ['R40 excl.', 'R46 incl.'],
      ],
      rule: 'Including VAT = excluding VAT × 1.15.',
    },
    realWorld: {
      question: 'A till slip says R230, VAT included. How much of that goes to SARS?',
      answer: 'R230 × 15 ÷ 115 = R30',
    },
    gossip: [
      ['t', 'Real talk: VAT is the sneakiest thing in every shop 🛒'],
      ['y', 'What do you mean?'],
      ['t', 'Every price tag is hiding 15% for SARS. R115 on the shelf? R15 of that is VAT.'],
      ['y', 'So I just take 15% of R115?'],
      [
        't',
        'NOOO 🙅 That’s the trap! The VAT inside a price is price × 15 ÷ 115. The 15% is of the price BEFORE VAT.',
      ],
      ['t', 'To add VAT: × 1.15. To find the VAT inside: × 15 ÷ 115. Tell your friends.'],
    ],
    diagram: {
      kind: 'bars',
      title: 'Where the R4 600 goes',
      unit: 'R',
      bars: [
        { label: 'excl. VAT', value: 4000 },
        { label: 'VAT', value: 600 },
        { label: 'incl. VAT', value: 4600 },
      ],
    },
    mistake: 'Taking 15% of a VAT-inclusive price. R4 600 × 15% is wrong — use × 15 ÷ 115.',
    checks: [
      { question: 'Price excluding VAT R800. Price including VAT?', answer: 'R920' },
      { question: 'Who does a VAT vendor pay VAT over to?', answer: 'SARS' },
    ],
  },
  'final accounts': {
    idea: 'Gross profit = sales − cost of sales. Net profit = gross profit + other income − expenses.',
    example: {
      question:
        'Sales R90 000, cost of sales R54 000, other income R3 000, expenses R21 000. Net profit?',
      steps: [
        'Gross profit: R90 000 − R54 000 = R36 000',
        'Add other income: R36 000 + R3 000 = R39 000',
        'Subtract expenses: R39 000 − R21 000',
      ],
      answer: 'R18 000',
    },
    pattern: {
      rows: [
        ['sales R100, cost R60', 'GP R40'],
        ['sales R200, cost R150', 'GP R50'],
        ['sales R500, cost R300', 'GP R200'],
        ['sales R80, cost R50', 'GP R30'],
      ],
      rule: 'Gross profit = sales − cost of sales.',
    },
    realWorld: {
      question:
        'A tuckshop sells R5 000 of chips and drinks that cost R3 200. Rent is R800. Profit?',
      answer: 'Gross profit R1 800; net profit R1 000',
    },
    gossip: [
      ['t', 'The Income Statement is the business’s end-of-year tell-all 📖'],
      ['y', 'Spill'],
      [
        't',
        'First, sales minus cost of sales. That’s gross profit — what you made on the stock itself.',
      ],
      ['t', 'Then add other income, like rent you received, and take away ALL the expenses.'],
      ['y', 'And what’s left over?'],
      ['t', 'Net profit 💰 But drawings? They don’t belong in there at all. Instant red pen.'],
    ],
    diagram: {
      kind: 'bars',
      title: 'From sales to net profit',
      unit: 'R',
      bars: [
        { label: 'sales', value: 90000 },
        { label: 'cost', value: 54000 },
        { label: 'gross', value: 36000 },
        { label: 'net', value: 18000 },
      ],
    },
    mistake: 'Putting drawings in the Income Statement — drawings are not an expense.',
    checks: [
      { question: 'Sales R60 000, cost of sales R35 000. Gross profit?', answer: 'R25 000' },
      {
        question: 'Which statement shows assets, liabilities and equity?',
        answer: 'The Balance Sheet (Statement of Financial Position)',
      },
    ],
  },
  'analysis of financial statements': ANALYSIS,
  'ratio analysis': ANALYSIS,
  budgeting: BUDGETING,
  budgets: BUDGETING,
  'internal control': {
    idea: 'Internal control protects a business’s assets: divide duties, number documents, lock up cash and stock, and count stock regularly.',
    example: {
      question:
        'One cashier receives the cash, records it and banks it. What is the risk and the fix?',
      steps: [
        'Risk: one person can steal the money and hide it in the books',
        'Fix: one person receives, another records, another banks',
      ],
      answer: 'Division of duties',
    },
    pattern: {
      rows: [
        ['cash', 'bank it daily, keep it in a safe'],
        ['stock', 'count it, lock the storeroom'],
        ['documents', 'number them in sequence'],
        ['staff', 'rotate duties, check references'],
      ],
      rule: 'Every asset gets a control that makes theft hard and easy to spot.',
    },
    realWorld: {
      question:
        'Why does a supermarket cashier count the till with a supervisor at the end of a shift?',
      answer: 'So any shortage is found straight away and someone is accountable',
    },
    gossip: [
      ['t', 'Imagine one cashier receives the cash, writes it in the books AND banks it 😳'],
      ['y', 'That’s sus'],
      ['t', 'SO sus. They could pocket R500, change the books, and nobody would ever know.'],
      [
        't',
        'So businesses divide duties: different people receive, record and bank. Plus locks, pre-numbered documents and surprise stock counts.',
      ],
      ['y', 'Trust issues 😂'],
      [
        't',
        'It’s called internal control, babe. And in the exam, name the exact control — “be careful” gets zero.',
      ],
    ],
    diagram: {
      kind: 'flow',
      title: 'Division of duties for cash',
      steps: [
        'Cashier receives the cash',
        'Clerk records it',
        'Manager banks it',
        'Owner checks the bank statement',
      ],
    },
    mistake: 'Giving a vague answer like “be careful” — name a specific control.',
    checks: [
      {
        question: 'Why should documents be pre-numbered?',
        answer: 'So a missing document is noticed',
      },
      {
        question: 'Name one control over stock.',
        answer: 'Regular stock counts or a locked storeroom',
      },
    ],
  },
};
