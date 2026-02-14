import { test } from 'node:test';
import assert from 'node:assert';
import { calculateRentalYields } from './finance.js';

test('calculateRentalYields - standard scenario', () => {
  const params = {
    investTotal: 100000,
    monthlyGrossRent: 500,
    annualRealRent: 5700, // 500 * 12 * 0.95 (5% vacancy)
    annualCharges: 1000,
  };

  const { rBrute, rNet } = calculateRentalYields(params);

  // rBrute: (500 * 12) / 100000 * 100 = 6000 / 100000 * 100 = 6%
  assert.strictEqual(rBrute, 6);

  // rNet: (5700 - 1000) / 100000 * 100 = 4700 / 100000 * 100 = 4.7%
  assert.strictEqual(rNet, 4.7);
});

test('calculateRentalYields - zero investment', () => {
  const params = {
    investTotal: 0,
    monthlyGrossRent: 500,
    annualRealRent: 6000,
    annualCharges: 1000,
  };

  const { rBrute, rNet } = calculateRentalYields(params);

  assert.strictEqual(rBrute, 0);
  assert.strictEqual(rNet, 0);
});

test('calculateRentalYields - zero rent/charges', () => {
  const params = {
    investTotal: 100000,
    monthlyGrossRent: 0,
    annualRealRent: 0,
    annualCharges: 0,
  };

  const { rBrute, rNet } = calculateRentalYields(params);

  assert.strictEqual(rBrute, 0);
  assert.strictEqual(rNet, 0);
});
