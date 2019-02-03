export declare type CashFlow = {
    readonly amount: number;
    readonly date: Date;
};
export declare type CashFlowNormalized = {
    readonly amount: number;
    readonly date: number;
};
export declare const calculateResult: (flowsFrom1: ReadonlyArray<CashFlowNormalized>, r: number) => number;
export declare const calculateResultDerivation: (flowsFrom1: ReadonlyArray<CashFlowNormalized>, r: number) => number;
export declare const calculate: (flows: ReadonlyArray<CashFlowNormalized>, guessRate?: number, maxEpsilon?: number, maxScans?: number, maxIterations?: number) => number;
export declare const normalize: (flows: ReadonlyArray<CashFlow>) => ReadonlyArray<CashFlowNormalized>;
export declare const xirr: (flows: ReadonlyArray<CashFlow>, guessRate?: number, maxEpsilon?: number, maxScans?: number, maxIterations?: number) => number;
