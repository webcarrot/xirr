export declare type CashFlow = {
    amount: number;
    date: Date;
};
export declare type CashFlowNormalized = {
    amount: number;
    date: number;
};
export declare const calculateResult: (flows: ReadonlyArray<CashFlowNormalized>, r: number) => number;
export declare const calculateResultDerivation: (flows: ReadonlyArray<CashFlowNormalized>, r: number) => number;
export declare const calculate: (flows: ReadonlyArray<CashFlowNormalized>, guessRate?: number, maxEpsilon?: number, maxScans?: number, maxIterations?: number) => number;
export declare const normalize: (cashflows: ReadonlyArray<CashFlow>) => ReadonlyArray<CashFlowNormalized>;
export declare const xirr: (flows: ReadonlyArray<CashFlow>, guessRate?: number, maxEpsilon?: number, maxScans?: number, maxIterations?: number) => number;
