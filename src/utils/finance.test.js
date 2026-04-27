import { describe, test, it, expect } from 'vitest';
import {
  calculateInvestmentTotal,
  calculateLoanAmount,
  calculateMonthlyPayment,
  calculateRentalYields
} from './finance.js';

test('calculateInvestmentTotal - sums up costs', () => {
  expect(calculateInvestmentTotal(100000, 20000, 8000)).toBe(128000);
  expect(calculateInvestmentTotal(0, 0, 0)).toBe(0);
});

test('calculateLoanAmount - subtracts down payment from total', () => {
  expect(calculateLoanAmount(128000, 28000)).toBe(100000);
});

test('calculateLoanAmount - returns 0 if down payment exceeds total', () => {
  expect(calculateLoanAmount(100000, 150000)).toBe(0);
});

test('calculateMonthlyPayment - standard mortgage calculation', () => {
  // 100,000 EUR, 3.5%, 20 years
  const payment = calculateMonthlyPayment(100000, 3.5, 20);
  expect(Math.abs(payment - 579.96) < 0.01).toBeTruthy();
});

test('calculateMonthlyPayment - 0% interest rate', () => {
  const payment = calculateMonthlyPayment(120000, 0, 10);
  expect(payment).toBe(1000);
});

test('calculateMonthlyPayment - 0 years duration', () => {
  const payment = calculateMonthlyPayment(100000, 3.5, 0);
  expect(payment).toBe(0);
});

test('calculateMonthlyPayment - 0 loan amount', () => {
  const payment = calculateMonthlyPayment(0, 3.5, 20);
  expect(payment).toBe(0);
});

test('calculateRentalYields - standard scenario', () => {
  const params = {
    investTotal: 100000,
    monthlyGrossRent: 500,
    annualRealRent: 5700, // 500 * 12 * 0.95 (5% vacancy)
    annualCharges: 1000,
  };

  const { rBrute, rNet } = calculateRentalYields(params);
  expect(rBrute).toBe(6);
  expect(rNet).toBe(4.7);
});
