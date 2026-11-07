# xirr &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/webcarrot/xirr/blob/master/LICENSE) &middot; [![npm version](https://img.shields.io/npm/v/@webcarrot/xirr.svg?style=flat)](https://www.npmjs.com/package/@webcarrot/xirr) &middot; [![JSR](https://jsr.io/badges/@webcarrot/xirr)](https://jsr.io/@webcarrot/xirr)

JavaScript implementation of the XIRR LibreOffice function.
It should give the same results as equivalents from LibreOffice Calc, MS Excel, Google Spreadsheet etc.

# Usage

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

# Development

Run `npm ci` and then `npm test` to type-check the implementation and run the
Node.js tests. The tests import TypeScript directly and require Node.js 22.18+
or a later release with built-in TypeScript type stripping enabled.
