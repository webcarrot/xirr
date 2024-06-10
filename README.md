# @webcarrot/xirr &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/webcarrot/xirr/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@webcarrot/xirr.svg?style=flat)](https://www.npmjs.com/package/@webcarrot/xirr)

JavaScript implementation of the XIRR LibreOffice function.
It should give the same results as equivalents from LibreOffice Calc, MS Excel, Google Spreadsheet etc.

## Instalation

`npm i @webcarrot/xirr`

## Usage

```typescript
import { xirr, CashFlow } from "@webcarrot/xirr";

const flows: Array<CashFlow> = [
  {
    amount: 100,
    date: new Date("2019-02-02"),
  },
  {
    amount: -120,
    date: new Date("2019-03-02"),
  },
];

try {
  console.log("XIRR:", xirr(flows), "of", flows);
} catch (err) {
  console.log(err);
}
```

## Methods and types

```ts
export type CashFlow = {
  readonly amount: number;
  readonly date: Date;
};
export declare function xirr(
  flows: ReadonlyArray<CashFlow>,
  guessRate?: number,
  maxEpsilon?: number,
  maxScans?: number,
  maxIterations?: number
): number;
```
