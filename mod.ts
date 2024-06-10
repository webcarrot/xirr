/**
 * Record representing cash flow
 *
 * @example
 * ```ts
 * {
 *   amount: 100,
 *   date: new Date("2019-02-02")
 * }
 * ```
 */
export type CashFlow = {
  readonly amount: number;
  readonly date: Date;
};

/**
 * @deprecated Should be internal
 */
export type CashFlowNormalized = {
  readonly amount: number;
  readonly date: number;
};

/**
 * @deprecated Should be internal
 */
export function calculateResult(
  flowsFrom1: ReadonlyArray<CashFlowNormalized>,
  r: number
): number {
  let result = 0.0;
  for (let { date, amount } of flowsFrom1) {
    result = result + amount / Math.pow(r, date);
  }
  return result;
}

/**
 * @deprecated Should be internal
 */
export function calculateResultDerivation(
  flowsFrom1: ReadonlyArray<CashFlowNormalized>,
  r: number
): number {
  let result = 0.0;
  for (let { date, amount } of flowsFrom1) {
    result = result - (date * amount) / Math.pow(r, date + 1.0);
  }
  return result;
}

function flowGt0({ amount }: CashFlowNormalized): boolean {
  return amount > 0;
}

function flowLt0({ amount }: CashFlowNormalized): boolean {
  return amount < 0;
}

/**
 * @deprecated Should be internal
 */
export function calculate(
  flows: ReadonlyArray<CashFlowNormalized>,
  guessRate: number = 0.1,
  maxEpsilon: number = 1e-10,
  maxScans: number = 200,
  maxIterations: number = 20
): number {
  if (flows.findIndex(flowGt0) === -1) {
    throw new RangeError("No positive amount was found in cash flows");
  }
  if (flows.findIndex(flowLt0) === -1) {
    throw new RangeError("No negative amount was found in cash flows");
  }
  if (guessRate <= -1) {
    throw new RangeError("Guess rate is less than or equal to -1");
  }
  if (maxEpsilon <= 0) {
    throw new RangeError("Max epsilon is less than or equal to 0");
  }
  if (maxScans < 10) {
    throw new RangeError("Max scans is lower than 10");
  }
  if (maxIterations < 10) {
    throw new RangeError("Max iterations is lower than 10");
  }
  let resultRate = guessRate;
  let resultValue: number;
  let iterationScan: number = 0;
  let doLoop: boolean = false;
  const firstFlowAmount = flows[0].amount;
  const flowsFrom1 = flows.slice(1);
  do {
    if (iterationScan >= 1) {
      resultRate = -0.99 + (iterationScan - 1) * 0.01;
    }
    let iteration: number = maxIterations;
    do {
      resultValue =
        firstFlowAmount + calculateResult(flowsFrom1, resultRate + 1);
      const newRate: number =
        resultRate -
        resultValue / calculateResultDerivation(flowsFrom1, resultRate + 1);
      const rateEpsilon: number = Math.abs(newRate - resultRate);
      resultRate = newRate;
      doLoop = rateEpsilon > maxEpsilon && Math.abs(resultValue) > maxEpsilon;
    } while (doLoop && --iteration);
    doLoop =
      doLoop ||
      isNaN(resultRate) ||
      !isFinite(resultRate) ||
      isNaN(resultValue) ||
      !isFinite(resultValue);
  } while (doLoop && !(++iterationScan < maxScans));
  if (doLoop) {
    throw new Error(
      "XIRR calculation failed. Try to increase one of: max epsilon, max scans, max iterations"
    );
  }
  return resultRate;
}

const D_N = 365.0 * 86400000;

function normalizeCashFlow({ amount, date }: CashFlow): CashFlowNormalized {
  return {
    amount,
    date: date.getTime(),
  };
}

function sortCashFlows(
  { date: a }: CashFlowNormalized,
  { date: b }: CashFlowNormalized
): number {
  return a - b;
}

/**
 * @deprecated Should be internal
 */
export function normalize(
  flows: ReadonlyArray<CashFlow>
): ReadonlyArray<CashFlowNormalized> {
  const flowsN = flows
    .map<CashFlowNormalized>(normalizeCashFlow)
    .sort(sortCashFlows);
  const firstDate: number = flowsN[0].date;
  return flowsN.map<CashFlowNormalized>(({ amount, date }) => ({
    amount,
    date: (date - firstDate) / D_N,
  }));
}

/**
 * Calculates the internal rate of return for a series of future cash flows that do not need to be periodic
 */
export function xirr(
  flows: ReadonlyArray<CashFlow>,
  guessRate?: number,
  maxEpsilon?: number,
  maxScans?: number,
  maxIterations?: number
): number {
  return calculate(
    normalize(flows),
    guessRate,
    maxEpsilon,
    maxScans,
    maxIterations
  );
}

export default xirr;
