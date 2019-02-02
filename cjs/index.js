"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateResult = function (flows, r) {
    return flows
        .slice(1)
        .reduce(function (result, _a) {
        var date = _a.date, amount = _a.amount;
        return result + amount / Math.pow(r, date);
    }, flows[0].amount);
};
exports.calculateResultDerivation = function (flows, r) {
    return flows
        .slice(1)
        .reduce(function (result, _a) {
        var date = _a.date, amount = _a.amount;
        return result - (date * amount) / Math.pow(r, date + 1.0);
    }, 0.0);
};
exports.calculate = function (flows, guessRate, maxEpsilon, maxScans, maxIterations) {
    if (guessRate === void 0) { guessRate = 0.1; }
    if (maxEpsilon === void 0) { maxEpsilon = 1e-10; }
    if (maxScans === void 0) { maxScans = 200; }
    if (maxIterations === void 0) { maxIterations = 20; }
    if (flows.findIndex(function (_a) {
        var amount = _a.amount;
        return amount > 0;
    }) === -1) {
        throw new Error("No positive amount in cash flows");
    }
    if (flows.findIndex(function (_a) {
        var amount = _a.amount;
        return amount < 0;
    }) === -1) {
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
    var resultRate = guessRate;
    var resultValue;
    var iterationScan = 0;
    var doLoop = false;
    do {
        if (iterationScan >= 1) {
            resultRate = -0.99 + (iterationScan - 1) * 0.01;
        }
        var iteration = maxIterations;
        do {
            resultValue = exports.calculateResult(flows, resultRate + 1);
            var newRate = resultRate -
                resultValue / exports.calculateResultDerivation(flows, resultRate + 1);
            var rateEpsilon = Math.abs(newRate - resultRate);
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
var D_N = 365.0 * 86400000;
exports.normalize = function (cashflows) {
    var cashflowsS = cashflows
        .map(function (_a) {
        var amount = _a.amount, date = _a.date;
        return ({
            amount: amount,
            date: date.getTime()
        });
    })
        .sort(function (a, b) { return a.date - b.date; });
    var first = cashflowsS[0].date;
    return cashflowsS.map(function (_a) {
        var amount = _a.amount, date = _a.date;
        return ({
            amount: amount,
            date: (date - first) / D_N
        });
    });
};
exports.xirr = function (flows, guessRate, maxEpsilon, maxScans, maxIterations) {
    return exports.calculate(exports.normalize(flows), guessRate, maxEpsilon, maxScans, maxIterations);
};
//# sourceMappingURL=index.js.map