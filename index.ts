export type CashFlow = {
  amount: number;
  date: Date;
};

export type CashFlowNormalized = {
  amount: number;
  date: number;
};

export const calculateResult = (
  firtsFlow: CashFlowNormalized,
  flowsFrom1: ReadonlyArray<CashFlowNormalized>,
  r: number
): number =>
  flowsFrom1.reduce<number>(
    (result, { date, amount }) => result + amount / Math.pow(r, date),
    firtsFlow.amount
  );

export const calculateResultDerivation = (
  flowsFrom1: ReadonlyArray<CashFlowNormalized>,
  r: number
): number =>
  flowsFrom1.reduce<number>(
    (result, { date, amount }) =>
      result - (date * amount) / Math.pow(r, date + 1.0),
    0.0
  );

export const calculate = (
  flows: ReadonlyArray<CashFlowNormalized>,
  guessRate: number = 0.1,
  maxEpsilon: number = 1e-10,
  maxScans: number = 200,
  maxIterations: number = 20
): number => {
  if (flows.findIndex(({ amount }) => amount > 0) === -1) {
    throw new Error("No positive amount in cash flows");
  }
  if (flows.findIndex(({ amount }) => amount < 0) === -1) {
    throw new Error("No negative amount in cash flows");
  }
  if (guessRate <= -1) {
    throw new Error("Guess rate lower than -1");
  }
  if (maxEpsilon < 0) {
    throw new Error("Max epsilon lower than 0");
  }
  if (maxScans < 10) {
    throw new Error("Max scans lower than 10");
  }
  if (maxIterations < 10) {
    throw new Error("Max iterations lower than 10");
  }
  let resultRate = guessRate;
  let resultValue: number;
  let iterationScan: number = 0;
  let doLoop: boolean = false;
  const firstFlow = flows[0];
  const flowsFrom1 = flows.slice(1);
  do {
    if (iterationScan >= 1) {
      resultRate = -0.99 + (iterationScan - 1) * 0.01;
    }
    let iteration: number = maxIterations;
    do {
      resultValue = calculateResult(firstFlow, flowsFrom1, resultRate + 1);
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
};

const D_N = 365.0 * 86400000;

export const normalize = (
  cashflows: ReadonlyArray<CashFlow>
): ReadonlyArray<CashFlowNormalized> => {
  const cashflowsS = cashflows
    .map<CashFlowNormalized>(({ amount, date }) => ({
      amount,
      date: date.getTime()
    }))
    .sort((a, b) => a.date - b.date);
  const first: number = cashflowsS[0].date;
  return cashflowsS.map<CashFlowNormalized>(({ amount, date }) => ({
    amount,
    date: (date - first) / D_N
  }));
};

export const xirr = (
  flows: ReadonlyArray<CashFlow>,
  guessRate?: number,
  maxEpsilon?: number,
  maxScans?: number,
  maxIterations?: number
): number =>
  calculate(normalize(flows), guessRate, maxEpsilon, maxScans, maxIterations);
