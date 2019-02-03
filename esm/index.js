export const calculateResult = (flowsFrom1, r) => flowsFrom1.reduce((result, { date, amount }) => result + amount / Math.pow(r, date), 0.0);
export const calculateResultDerivation = (flowsFrom1, r) => flowsFrom1.reduce((result, { date, amount }) => result - (date * amount) / Math.pow(r, date + 1.0), 0.0);
export const calculate = (flows, guessRate = 0.1, maxEpsilon = 1e-10, maxScans = 200, maxIterations = 20) => {
    if (flows.findIndex(({ amount }) => amount > 0) === -1) {
        throw new RangeError("No positive amount was found in cash flows");
    }
    if (flows.findIndex(({ amount }) => amount < 0) === -1) {
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
    let resultValue;
    let iterationScan = 0;
    let doLoop = false;
    const firstFlowAmount = flows[0].amount;
    const flowsFrom1 = flows.slice(1);
    do {
        if (iterationScan >= 1) {
            resultRate = -0.99 + (iterationScan - 1) * 0.01;
        }
        let iteration = maxIterations;
        do {
            resultValue =
                firstFlowAmount + calculateResult(flowsFrom1, resultRate + 1);
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
export const normalize = (flows) => {
    const flowsN = flows
        .map(({ amount, date }) => ({
        amount,
        date: date.getTime()
    }))
        .sort((a, b) => a.date - b.date);
    const firstDate = flowsN[0].date;
    return flowsN.map(({ amount, date }) => ({
        amount,
        date: (date - firstDate) / D_N
    }));
};
export const xirr = (flows, guessRate, maxEpsilon, maxScans, maxIterations) => calculate(normalize(flows), guessRate, maxEpsilon, maxScans, maxIterations);
//# sourceMappingURL=index.js.map