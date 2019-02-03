export const calculateResult = (firtsFlow, flowsFrom1, r) => flowsFrom1.reduce((result, { date, amount }) => result + amount / Math.pow(r, date), firtsFlow.amount);
export const calculateResultDerivation = (flowsFrom1, r) => flowsFrom1.reduce((result, { date, amount }) => result - (date * amount) / Math.pow(r, date + 1.0), 0.0);
export const calculate = (flows, guessRate = 0.1, maxEpsilon = 1e-10, maxScans = 200, maxIterations = 20) => {
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
    let resultValue;
    let iterationScan = 0;
    let doLoop = false;
    const firstFlow = flows[0];
    const flowsFrom1 = flows.slice(1);
    do {
        if (iterationScan >= 1) {
            resultRate = -0.99 + (iterationScan - 1) * 0.01;
        }
        let iteration = maxIterations;
        do {
            resultValue = calculateResult(firstFlow, flowsFrom1, resultRate + 1);
            const newRate = resultRate -
                resultValue / calculateResultDerivation(flowsFrom1, resultRate + 1);
            const rateEpsilon = Math.abs(newRate - resultRate);
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
        throw new Error("XIRR calculation failed. Try to increase one of: max epsilon, max scans, max iterations");
    }
    return resultRate;
};
const D_N = 365.0 * 86400000;
export const normalize = (cashflows) => {
    const cashflowsS = cashflows
        .map(({ amount, date }) => ({
        amount,
        date: date.getTime()
    }))
        .sort((a, b) => a.date - b.date);
    const first = cashflowsS[0].date;
    return cashflowsS.map(({ amount, date }) => ({
        amount,
        date: (date - first) / D_N
    }));
};
export const xirr = (flows, guessRate, maxEpsilon, maxScans, maxIterations) => calculate(normalize(flows), guessRate, maxEpsilon, maxScans, maxIterations);
//# sourceMappingURL=index.js.map