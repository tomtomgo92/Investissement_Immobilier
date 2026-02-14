import { test } from 'node:test';
import assert from 'node:assert';
import { calculateInvestmentTotal, calculateLoanAmount, calculateMonthlyPayment } from './finance.js';

test('calculateInvestmentTotal - sums up costs', () => {
    assert.strictEqual(calculateInvestmentTotal(100000, 20000, 8000), 128000);
    assert.strictEqual(calculateInvestmentTotal(0, 0, 0), 0);
});

test('calculateLoanAmount - subtracts down payment from total', () => {
    assert.strictEqual(calculateLoanAmount(128000, 28000), 100000);
});

test('calculateLoanAmount - returns 0 if down payment exceeds total', () => {
    assert.strictEqual(calculateLoanAmount(100000, 150000), 0);
});

test('calculateMonthlyPayment - standard mortgage calculation', () => {
    // 100,000 EUR, 3.5%, 20 years
    // Monthly rate = 3.5 / 100 / 12 = 0.00291666...
    // Number of payments = 240
    // Expected result ~ 579.96
    const payment = calculateMonthlyPayment(100000, 3.5, 20);
    // Allow small floating point difference
    assert.ok(Math.abs(payment - 579.96) < 0.01, `Expected ~579.96, got ${payment}`);
});

test('calculateMonthlyPayment - 0% interest rate', () => {
    // 120,000 EUR, 0%, 10 years (120 months)
    // Should be 1000 per month
    const payment = calculateMonthlyPayment(120000, 0, 10);
    assert.strictEqual(payment, 1000);
});

test('calculateMonthlyPayment - 0 years duration', () => {
    const payment = calculateMonthlyPayment(100000, 3.5, 0);
    assert.strictEqual(payment, 0);
});

test('calculateMonthlyPayment - 0 loan amount', () => {
    const payment = calculateMonthlyPayment(0, 3.5, 20);
    assert.strictEqual(payment, 0);
});
