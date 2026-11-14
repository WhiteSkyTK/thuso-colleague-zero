import { fromList, round2, type Maker } from './makerKit';

const VAT_RATE = 0.15;
const UIF_RATE = 0.01;

const budget: Maker = (pick) => {
  const [receipts, payments] = [pick(10, 40) * 500, pick(10, 40) * 500];
  const result = receipts - payments;
  return {
    question: `Receipts R${receipts}, payments R${payments}. Surplus (+) or deficit (−) in rand?`,
    answer: result,
    unit: 'R',
    working: [
      `R${receipts} − R${payments} = R${result}`,
      result < 0 ? 'Negative: a deficit' : 'Positive: a surplus',
    ],
  };
};

const markUp: Maker = (pick) => {
  const cost = pick(4, 20) * 1000;
  const percent = fromList(pick, [25, 40, 50, 60, 75, 100]);
  const profit = (cost * percent) / 100;
  return {
    question: `Gross profit R${profit}, cost of sales R${cost}. Mark-up %?`,
    answer: percent,
    unit: '%',
    working: [
      'Mark-up % = gross profit ÷ cost of sales × 100',
      `= ${profit} ÷ ${cost} × 100 = ${percent}%`,
    ],
  };
};

/** Accounting and Life Sciences: practice questions with fresh numbers. */
export const SCHOOL_MAKERS: Readonly<Record<string, Maker>> = {
  'ACCN:accounting concepts': (pick) => {
    const [liabilities, equity] = [pick(5, 40) * 1000, pick(10, 90) * 1000];
    return {
      question: `Assets R${liabilities + equity}, liabilities R${liabilities}. Owner’s equity in rand?`,
      answer: equity,
      unit: 'R',
      working: [
        'A = OE + L, so OE = A − L',
        `= R${liabilities + equity} − R${liabilities} = R${equity}`,
      ],
    };
  },
  'ACCN:vat': (pick) => {
    const excl = pick(2, 40) * 50;
    const incl = round2(excl * (1 + VAT_RATE));
    return {
      question: `A price is R${incl} including VAT. How much is the VAT in rand?`,
      answer: round2(excl * VAT_RATE),
      unit: 'R',
      working: [`VAT = R${incl} × 15 ÷ 115`, `= R${round2(excl * VAT_RATE)}`],
    };
  },
  'ACCN:salaries and wages': (pick) => {
    const [gross, paye] = [pick(10, 40) * 500, pick(2, 20) * 100];
    const uif = round2(gross * UIF_RATE);
    const net = round2(gross - paye - uif);
    return {
      question: `Gross salary R${gross}, PAYE R${paye}, UIF 1%. Net salary in rand?`,
      answer: net,
      unit: 'R',
      working: [`UIF = 1% × R${gross} = R${uif}`, `Net = R${gross} − R${paye} − R${uif} = R${net}`],
    };
  },
  'ACCN:final accounts': (pick) => {
    const [cost, profit] = [pick(20, 80) * 1000, pick(5, 40) * 1000];
    return {
      question: `Sales R${cost + profit}, cost of sales R${cost}. Gross profit in rand?`,
      answer: profit,
      unit: 'R',
      working: [
        'Gross profit = sales − cost of sales',
        `= R${cost + profit} − R${cost} = R${profit}`,
      ],
    };
  },
  'ACCN:budgeting': budget,
  'ACCN:budgets': budget,
  'ACCN:analysis of financial statements': markUp,
  'ACCN:ratio analysis': markUp,
  'LIFO:careers and career choices': (pick) => {
    const mark = pick(20, 99);
    const points = Math.max(1, Math.min(7, Math.floor(mark / 10) - 1));
    return {
      question: `How many APS points is ${mark}%?`,
      answer: points,
      unit: 'points',
      working: [
        '80–100% = 7, 70–79% = 6, 60–69% = 5, 50–59% = 4, 40–49% = 3, 30–39% = 2, below 30% = 1',
        `${mark}% → ${points}`,
      ],
    };
  },
  'ACCN:partnerships': (pick) => {
    const [a, b] = [pick(1, 4), pick(1, 4)];
    const profit = (a + b) * pick(2, 20) * 1000;
    const share = (profit * a) / (a + b);
    return {
      question: `Profit R${profit} is shared ${a}:${b} between partners A and B. A’s share in rand?`,
      answer: share,
      unit: 'R',
      working: [
        `R${profit} ÷ ${a + b} parts = R${profit / (a + b)} a part`,
        `A gets ${a} parts = R${share}`,
      ],
    };
  },
  'ACCN:fixed assets': (pick) => {
    const [cost, rate, years] = [pick(4, 40) * 10000, fromList(pick, [10, 15, 20, 25]), pick(1, 3)];
    const value = cost - (cost * rate * years) / 100;
    return {
      question: `Cost R${cost}, depreciation ${rate}% a year on cost. Carrying value after ${years} year(s)?`,
      answer: value,
      unit: 'R',
      working: [
        `Each year: R${cost} × ${rate}% = R${(cost * rate) / 100}`,
        `R${cost} − ${years} × R${(cost * rate) / 100} = R${value}`,
      ],
    };
  },
  'ACCN:companies': (pick) => {
    const [shares, cents] = [pick(1, 50) * 1000, fromList(pick, [10, 15, 20, 25, 40, 50])];
    const total = (shares * cents) / 100;
    return {
      question: `${shares} shares get a dividend of ${cents}c each. Total dividend in rand?`,
      answer: total,
      unit: 'R',
      working: ['Dividends = shares × cents per share', `${shares} × R${cents / 100} = R${total}`],
    };
  },
  'ACCN:cost accounting': (pick) => {
    const [units, unit] = [pick(1, 10) * 500, pick(5, 60)];
    return {
      question: `Total production cost R${units * unit} for ${units} units. Cost per unit?`,
      answer: unit,
      unit: 'R',
      working: ['Unit cost = total cost ÷ units', `R${units * unit} ÷ ${units} = R${unit}`],
    };
  },
  'LIFE:population ecology': (pick) => {
    const [marked, recaptured, ratio] = [pick(2, 10) * 5, pick(2, 8), pick(3, 8)];
    const caught = recaptured * ratio;
    return {
      question: `${marked} animals are marked. Later ${caught} are caught and ${recaptured} are marked. Estimate the population.`,
      answer: (marked * caught) / recaptured,
      unit: '',
      working: [
        'N = (M × C) ÷ R',
        `(${marked} × ${caught}) ÷ ${recaptured} = ${(marked * caught) / recaptured}`,
      ],
    };
  },
  'LIFE:genetics and inheritance': (pick) => {
    const seeds = pick(5, 50) * 8;
    return {
      question: `Tt × Tt produces ${seeds} offspring. How many are expected to be short (tt)?`,
      answer: seeds / 4,
      unit: '',
      working: ['Punnett square: TT, Tt, Tt, tt → 1 in 4 short', `${seeds} ÷ 4 = ${seeds / 4}`],
    };
  },
  'LIFE:cells': (pick) => {
    const magnification = fromList(pick, [100, 200, 400, 1000]);
    const actualUm = pick(2, 20) * 5;
    const imageMm = (actualUm * magnification) / 1000;
    return {
      question: `A cell drawing is ${imageMm} mm long at ×${magnification}. Actual size in µm?`,
      answer: actualUm,
      unit: 'µm',
      working: [
        'Actual size = image size ÷ magnification',
        `= ${imageMm} mm ÷ ${magnification} = ${imageMm / magnification} mm`,
        `× 1 000 = ${actualUm} µm`,
      ],
    };
  },
  'LIFE:cell division': (pick) => {
    const chromosomes = fromList(pick, [8, 14, 20, 24, 38, 46, 48]);
    return {
      question: `A body cell with ${chromosomes} chromosomes divides by mitosis. How many in each daughter cell?`,
      answer: chromosomes,
      unit: '',
      working: [
        'Mitosis copies every chromosome first',
        `Each daughter cell gets the full set: ${chromosomes}`,
      ],
    };
  },
  'LIFE:biosphere to ecosystems': (pick) => {
    const producer = pick(1, 9) * 10000;
    return {
      question: `Grass holds ${producer} kJ. About how much reaches the lion in grass → impala → lion (kJ)?`,
      answer: producer / 100,
      unit: 'kJ',
      working: [
        `Impala: 10% of ${producer} = ${producer / 10} kJ`,
        `Lion: 10% of ${producer / 10} = ${producer / 100} kJ`,
      ],
    };
  },
};
